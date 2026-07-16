/**
 * public/og.svg -> public/og.png
 *
 * OG 크롤러(카카오·페이스북·슬랙)는 SVG를 읽지 못하므로 PNG 사본이 필요하다.
 * og.svg 를 고쳤다면 `npm run og` 로 다시 뽑고 PNG도 함께 커밋한다.
 *
 * 설치된 Chrome 을 헤드리스로 띄워 CDN 폰트(Pretendard / JetBrains Mono)를
 * 실제로 로드한 뒤 렌더한다. 일반 SVG 변환기는 이 폰트들을 갖고 있지 않아
 * 시스템 기본 폰트로 대체돼 버린다.
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = fileURLToPath(new URL("..", import.meta.url));
const SVG_PATH = `${root}public/og.svg`;
const OUT_PATH = `${root}public/og.png`;

/** CHROME_PATH 로 덮어쓸 수 있다. 없으면 흔한 설치 위치를 훑는다. */
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  const found = candidates.find((p) => p && existsSync(p));
  if (!found) {
    throw new Error(
      "Chrome/Edge를 찾지 못했다. CHROME_PATH 환경변수로 실행 파일 경로를 지정해라."
    );
  }
  return found;
}

const svg = await readFile(SVG_PATH, "utf8");

// og.svg 는 font-family 로 'Pretendard'(Variable 아님)를 부르므로 static
// 스타일시트가 실제로 매칭된다. JetBrains Mono 는 사이트가 쓰는 것과 같은
// 스타일시트라 카드가 사이트와 동일하게 렌더된다.
const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="https://fastly.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://fastly.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
<link rel="stylesheet" href="https://fastly.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.0.18/index.min.css">
<style>
  html, body { margin: 0; padding: 0; background: #fff; }
  svg { display: block; }
</style>
</head>
<body>${svg}</body>
</html>`;

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: "new",
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle0" });

  // networkidle0 은 CSS가 도착했다는 뜻일 뿐 폰트가 그릴 준비가 됐다는 뜻은
  // 아니다. 이걸 빼면 대체 폰트 상태로 스크린샷이 찍힐 수 있다.
  await page.evaluate(() => document.fonts.ready);

  const loaded = await page.evaluate(() => ({
    pretendard: document.fonts.check("700 84px Pretendard"),
    mono: document.fonts.check("800 26px 'JetBrains Mono'"),
  }));

  // CDN이 흔들리면 조용히 대체 폰트로 찍힌다. 잘못된 카드를 내보내느니
  // 여기서 멈추는 편이 낫다.
  if (!loaded.pretendard || !loaded.mono) {
    throw new Error(
      `CDN 폰트 로드 실패 (${JSON.stringify(loaded)}). ` +
        `대체 폰트로 렌더될 상태라 중단한다. 네트워크를 확인하고 다시 실행해라.`
    );
  }

  const el = await page.$("svg");
  const buf = await el.screenshot({ type: "png" });
  await writeFile(OUT_PATH, buf);
  console.log(`og.png 생성 완료 — 1200x630, ${(buf.length / 1024).toFixed(1)} KB`);
  console.log("변경됐다면 public/og.png 를 커밋해라.");
} finally {
  await browser.close();
}

import React, { CSSProperties, ReactNode, useEffect, useState } from "react";

/* =====================================================================
   GAGYE — Designer Portfolio main page
   Responsive single-screen layout with an internally-scrolling project list.
   Colors are driven by CSS custom properties so light/dark themes swap by
   toggling [data-theme] — inline styles read them via var(--token).
   ===================================================================== */

const MONO = "'JetBrains Mono', ui-monospace, monospace";

/** Theme-aware tokens. Fixed values (accents, signal) stay literal. */
const V = {
  ink: "var(--ink)",
  fg2: "var(--fg2)",
  fg3: "var(--fg3)",
  line: "var(--line)",
  lineStrong: "var(--lineStrong)",
  panel: "var(--panel)",
  surface: "var(--surface)",
  hlBg: "var(--hl-bg)",
  hlInk: "var(--hl-ink)",
  logoBg: "var(--logo-bg)",
  logoInk: "var(--logo-ink)",
  signal: "#84CC16",
} as const;

export interface Project {
  no: string;
  name: string;
  desc: string;
  discipline: string;
  year: string;
  accent: string;
  /** sparkline points in a 100×28 viewBox */
  spark: string;
  /** optional case-study link */
  href?: string;
}

export const PROJECTS: Project[] = [
  { no: "06", name: "GAGYE", desc: "가계부와 주식을 하나로", discipline: "Product lead", year: "2026", accent: "#4B5563", spark: "0,22 12,20 24,23 36,16 48,18 60,11 72,13 84,7 100,5" },
  { no: "05", name: "Meridian Terminal", desc: "기관용 트레이딩 워크스페이스", discipline: "Lead designer", year: "2026", accent: "#0891B2", spark: "0,12 12,9 24,14 36,8 48,15 60,7 72,16 84,10 100,6" },
  { no: "04", name: "Onboarding", desc: "핀테크 가입 흐름 재설계", discipline: "Interaction", year: "2026", accent: "#7C3AED", spark: "0,20 12,18 24,19 36,14 48,15 60,12 72,9 84,10 100,7" },
  { no: "03", name: "Numeral", desc: "숫자 중심 타입 시스템", discipline: "Design systems", year: "2026", accent: "#D97706", spark: "0,16 12,14 24,16 36,13 48,15 60,12 72,14 84,11 100,12" },
  { no: "02", name: "Compass", desc: "자산 리밸런싱 가이드", discipline: "Product design", year: "2026", accent: "#DB2777", spark: "0,18 12,16 24,17 36,13 48,14 60,12 72,13 84,9 100,8" },
  { no: "01", name: "Pulse", desc: "실시간 시세 위젯", discipline: "Motion", year: "2026", accent: "#0D9488", spark: "0,14 12,17 24,11 36,18 48,10 60,16 72,9 84,15 100,8" },
];

function Sparkline({ points, color }: { points: string; color: string }) {
  return (
    <svg width={96} height={28} viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg className="pf-chev" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{ color: V.fg3 }}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function Dot() {
  return <span style={{ width: 7, height: 7, borderRadius: 999, background: V.signal, flex: "none" }} aria-hidden="true" />;
}

function GitHubIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 4.6 3 8.6 7.2 10 .5.1.7-.2.7-.5v-1.7c-2.9.6-3.5-1.4-3.5-1.4-.5-1.2-1.2-1.5-1.2-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.3-.3-4.8-1.2-4.8-5.2 0-1.1.4-2.1 1-2.8-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 2.8 1.1.8-.2 1.7-.3 2.5-.3.9 0 1.7.1 2.5.3 1.9-1.3 2.8-1.1 2.8-1.1.6 1.5.2 2.6.1 2.9.7.7 1 1.7 1 2.8 0 4-2.5 4.9-4.8 5.2.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4.2-1.4 7.2-5.4 7.2-10C22.5 6.2 17.8 1.5 12 1.5Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.4" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: "light" | "dark"; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="pf-iconbtn"
      onClick={onToggle}
      aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
      title={theme === "dark" ? "라이트 모드" : "다크 모드"}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SocialButton({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <a className="pf-social" href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      {icon}
      <span>{label}</span>
    </a>
  );
}

const STYLE = `
.pf-card {
  --ink: #0A0B0D;
  --fg2: #4B5563;
  --fg3: #6B7280;
  --line: rgba(0,0,0,0.06);
  --lineStrong: rgba(0,0,0,0.16);
  --panel: #F5F7FA;
  --surface: #FFFFFF;
  --hl-bg: #9CA3AF;
  --hl-ink: #0A0B0D;
  --logo-bg: #9CA3AF;
  --logo-ink: #0A0B0D;
  --card-border: rgba(0,0,0,0.10);
  --card-shadow: 0 24px 70px rgba(0,0,0,0.10);
  --scroll-thumb: rgba(0,0,0,0.16);
  --scroll-thumb-hover: rgba(0,0,0,0.28);
  width: min(1280px, 100%);
}
.pf-card[data-theme="dark"], [data-theme="dark"] .pf-card {
  --ink: #F3F4F6;
  --fg2: #9CA3AF;
  --fg3: #6B7280;
  --line: rgba(255,255,255,0.08);
  --lineStrong: rgba(255,255,255,0.18);
  --panel: #16181D;
  --surface: #0E0F12;
  --hl-bg: #3F4651;
  --hl-ink: #F3F4F6;
  --logo-bg: #9CA3AF;
  --logo-ink: #0A0B0D;
  --card-border: rgba(255,255,255,0.10);
  --card-shadow: 0 24px 70px rgba(0,0,0,0.55);
  --scroll-thumb: rgba(255,255,255,0.18);
  --scroll-thumb-hover: rgba(255,255,255,0.32);
}

/* smooth tween when toggling theme */
.pf-card, .pf-card *:not(.pf-chev) {
  transition: background-color .25s ease, border-color .25s ease, color .25s ease, fill .25s ease, stroke .25s ease, box-shadow .25s ease;
}

.pf-pad { padding: 40px 56px 44px; }

.pf-work-scroll::-webkit-scrollbar { width: 6px; }
.pf-work-scroll::-webkit-scrollbar-track { background: transparent; }
.pf-work-scroll::-webkit-scrollbar-thumb { background: var(--scroll-thumb); border-radius: 3px; }
.pf-work-scroll:hover::-webkit-scrollbar-thumb { background: var(--scroll-thumb-hover); }

.pf-grid { display: grid; grid-template-columns: 64px 1fr 96px 168px 76px 24px; gap: 20px; align-items: center; }

.pf-row { padding: 15px 8px; border-bottom: 1px solid var(--line); border-radius: 8px; text-decoration: none; color: inherit; }
a.pf-row { cursor: pointer; }
a.pf-row:hover { background: var(--panel); }
a.pf-row:focus-visible { outline: 2px solid var(--ink); outline-offset: -2px; }
.pf-chev { transition: transform .18s ease; }
a.pf-row:hover .pf-chev, a.pf-row:focus-visible .pf-chev { transform: translateX(3px); }

.pf-nav a { color: var(--fg2); text-decoration: none; border-radius: 6px; }
.pf-nav a:hover { color: var(--ink); }
.pf-link { color: inherit; text-decoration: none; transition: opacity .15s ease; }
.pf-link:hover { opacity: .7; }
.pf-nav a:focus-visible, .pf-link:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }

.pf-iconbtn { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--lineStrong); background: transparent; color: var(--fg2); cursor: pointer; }
.pf-iconbtn:hover { color: var(--ink); border-color: var(--ink); background: var(--panel); }
.pf-iconbtn:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

.pf-social { display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; border: 1px solid var(--lineStrong); border-radius: 999px; font-size: 13px; font-weight: 600; color: var(--fg2); text-decoration: none; }
.pf-social:hover { color: var(--ink); border-color: var(--ink); background: var(--panel); }
.pf-social:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

.pf-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; max-width: 520px; }
.pf-tag { font-family: ${MONO}; font-size: 12px; color: var(--fg2); padding: 5px 11px; border: 1px solid var(--lineStrong); border-radius: 999px; white-space: nowrap; }

@keyframes pf-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.pf-anim { animation: pf-rise .6s cubic-bezier(.2,.7,.2,1) both; }

/* ── 1) ≤1200px · 좁은 데스크톱/노트북 ───────────────────────── */
@media (max-width: 1200px) {
  .pf-pad { padding: 36px 44px 40px; }
  .pf-h1 { font-size: 48px !important; }
  .pf-photo { width: 280px !important; height: 300px !important; }
  .pf-grid { grid-template-columns: 56px 1fr 88px 150px 70px 22px; gap: 16px; }
}

/* ── 2) ≤1024px · 태블릿 가로 ─────────────────────────────────── */
@media (max-width: 1024px) {
  .pf-pad { padding: 34px 38px 38px; }
  .pf-h1 { font-size: 44px !important; }
  .pf-hero { gap: 36px !important; }
  .pf-photo { width: 248px !important; height: 272px !important; }
  .pf-grid { grid-template-columns: 52px 1fr 80px 132px 64px 20px; gap: 14px; }
}

/* ── 3) ≤880px · 태블릿 세로 (히어로 세로 스택, 스파크라인 숨김) ── */
@media (max-width: 880px) {
  .pf-hero { flex-direction: column-reverse; align-items: stretch !important; gap: 24px !important; }
  .pf-photo { width: 100% !important; height: 240px !important; }
  .pf-h1 { font-size: 42px !important; }
  .pf-grid { grid-template-columns: 48px 1fr 140px 64px 20px; gap: 14px; }
  .pf-col-spark { display: none; }
}

/* ── 4) ≤720px · 큰 휴대폰 (Discipline 열까지 숨김) ──────────────── */
@media (max-width: 720px) {
  .pf-pad { padding: 28px 24px 32px; }
  .pf-h1 { font-size: 36px !important; }
  .pf-photo { height: 220px !important; }
  .pf-grid { grid-template-columns: 40px 1fr 64px 20px; gap: 12px; }
  .pf-col-disc { display: none; }
}

/* ── 5) ≤560px · 휴대폰 (소셜 버튼 세로 풀폭) ────────────────────── */
@media (max-width: 560px) {
  .pf-pad { padding: 22px 18px 26px; }
  .pf-h1 { font-size: 30px !important; }
  .pf-hero { gap: 20px !important; }
  .pf-photo { height: 190px !important; }
  .pf-social-row { flex-direction: column; align-items: stretch !important; }
  .pf-social { justify-content: center; height: 42px; }
}

/* ── 6) ≤400px · 소형 휴대폰 ──────────────────────────────────── */
@media (max-width: 400px) {
  .pf-pad { padding: 18px 14px 22px; }
  .pf-h1 { font-size: 26px !important; }
  .pf-grid { grid-template-columns: 34px 1fr 52px 18px; gap: 10px; }
}

/* ── 0a) ≥1440px · 대형 데스크톱 ─────────────────────────────── */
@media (min-width: 1440px) {
  .pf-card { width: 1360px; }
  .pf-pad { padding: 48px 64px 52px; }
  .pf-h1 { font-size: 58px !important; }
  .pf-photo { width: 320px !important; height: 340px !important; }
  .pf-grid { grid-template-columns: 72px 1fr 108px 184px 84px 26px; gap: 24px; }
}

/* ── 0b) ≥1680px · 초대형 / 와이드 모니터 ─────────────────────── */
@media (min-width: 1680px) {
  .pf-card { width: 1480px; }
  .pf-pad { padding: 52px 72px 56px; }
  .pf-h1 { font-size: 64px !important; }
  .pf-photo { width: 344px !important; height: 364px !important; }
}

/* ── 0c) 초고해상도 (FHD~8K) · 카드 전체를 zoom으로 비례 확대 ──────
   가로 너비 + 세로 높이를 함께 만족할 때만 확대한다. 높이를 같이
   보지 않으면 와이드하지만 낮은 화면(예: 2560×1440)에서 카드가
   위아래로 잘린다(바깥 프레임이 overflow:hidden이라 안 보임). */
@media (min-width: 1920px) and (min-height: 1240px) { .pf-card { zoom: 1.15; } }  /* FHD 1080p */
@media (min-width: 2560px) and (min-height: 1480px) { .pf-card { zoom: 1.35; } }  /* QHD 1440p */
@media (min-width: 3440px) and (min-height: 1720px) { .pf-card { zoom: 1.60; } }  /* UltraWide */
@media (min-width: 3840px) and (min-height: 2040px) { .pf-card { zoom: 1.90; } }  /* 4K UHD */
@media (min-width: 5120px) and (min-height: 2680px) { .pf-card { zoom: 2.50; } }  /* 5K */
@media (min-width: 6016px) and (min-height: 3200px) { .pf-card { zoom: 3.10; } }  /* 6K */
@media (min-width: 7680px) and (min-height: 4000px) { .pf-card { zoom: 3.80; } }  /* 8K UHD */

@media (prefers-reduced-motion: reduce) {
  .pf-anim { animation: none; }
  .pf-chev, .pf-row, .pf-card, .pf-card * { transition: none; }
}
`;

export interface PortfolioProps {
  name?: string;
  email?: string;
  /** mono eyebrow above the headline */
  tagline?: string;
  /** headline; supports a highlighted span */
  headline?: ReactNode;
  /** intro paragraph */
  intro?: string;
  /** Portrait image URL; falls back to a placeholder block when omitted. */
  photoSrc?: string;
  projects?: Project[];
  /** footer availability label */
  availability?: string;
  /** social links */
  githubHref?: string;
  instagramHref?: string;
  /** tech stack badges shown under the intro */
  stack?: string[];
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Light by default. Only a past explicit toggle (persisted, and replayed by the
    inline script in index.html before paint) switches it to dark. */
function getInitialTheme(): "light" | "dark" {
  if (typeof document !== "undefined") {
    const t = document.documentElement.getAttribute("data-theme");
    if (t === "dark" || t === "light") return t;
  }
  return "light";
}

export default function Portfolio({
  name = "Hyeongrae RHO",
  email = "rhl9509@naver.com",
  tagline = "Full-stack & AI",
  headline = (
    <>
      인프라부터 AI까지,<br />혼자서{" "}
      <span style={{ background: V.hlBg, color: V.hlInk, padding: "0.02em 0.16em", borderRadius: 4, WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }}>끝까지</span>.
    </>
  ),
  intro = "인프라부터 프론트, 서버, 모델 연동까지 전체 흐름을 직접 설계하고 구현합니다. 기술의 경계를 나누지 않고 만듭니다.",
  photoSrc,
  projects = PROJECTS,
  availability = "2026 작업 의뢰 가능",
  githubHref = "https://github.com/rhl0509",
  instagramHref = "https://instagram.com/hyeongrae_r",
  stack = ["React", "TypeScript", "Next.js", "Python", "FastAPI", "Flask", "PostgreSQL", "MySQL", "AWS", "Linux", "Docker", "LLM / RAG"],
}: PortfolioProps) {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // persist only on an explicit toggle — auto-persisting on mount would freeze
  // the default into every visitor's storage on their first visit.
  const toggleTheme = () =>
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch {
        /* ignore (private mode / storage disabled) */
      }
      return next;
    });

  const monoLabel: CSSProperties = { fontFamily: MONO, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: V.fg3 };

  // Year range derived from project data (e.g. "2026—2026" collapses to "2026").
  const years = projects.map((p) => Number(p.year)).filter((y) => Number.isFinite(y));
  const yearRange = years.length
    ? Math.min(...years) === Math.max(...years)
      ? String(Math.min(...years))
      : `${Math.min(...years)}—${Math.max(...years)}`
    : "";

  return (
    <div className="pf-card" data-theme={theme} style={{ background: V.surface, border: "1px solid var(--card-border)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--card-shadow)", fontFamily: "'Pretendard Variable', Pretendard, system-ui, sans-serif", WebkitFontSmoothing: "antialiased", color: V.ink }}>
      <style>{STYLE}</style>
      <div className="pf-pad">
        {/* top bar */}
        <header className="pf-anim" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: V.logoBg, color: V.logoInk, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, letterSpacing: "-0.03em" }}>{initialsOf(name)}</div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
          </div>
          <nav className="pf-nav" style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 7, color: V.fg2 }}><Dot />Open to work</span>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </nav>
        </header>

        {/* hero */}
        <section className="pf-hero pf-anim" id="about" style={{ display: "flex", alignItems: "center", gap: 48, marginBottom: 44, animationDelay: ".06s" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: V.fg3, marginBottom: 16 }}>{tagline}</div>
            <h1 className="pf-h1" style={{ margin: 0, fontSize: 52, lineHeight: 1.08, fontWeight: 600, letterSpacing: "-0.03em" }}>{headline}</h1>
            <p style={{ margin: "20px 0 0", fontSize: 17, lineHeight: 1.55, color: V.fg2, maxWidth: 520, wordBreak: "keep-all" }}>{intro}</p>
            {stack.length > 0 && (
              <ul className="pf-tags" aria-label="기술 스택" style={{ listStyle: "none", padding: 0 }}>
                {stack.map((t) => (
                  <li key={t} className="pf-tag">{t}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="pf-photo" style={{ width: 300, height: 316, flex: "none", borderRadius: 18, overflow: "hidden", background: V.panel, border: "1px solid var(--lineStrong)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {photoSrc ? (
              <img src={photoSrc} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <span style={{ ...monoLabel, fontSize: 12 }}>내 사진</span>
            )}
          </div>
        </section>

        {/* social links */}
        <div className="pf-anim pf-social-row" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, animationDelay: ".09s" }}>
          <SocialButton href={githubHref} icon={<GitHubIcon />} label="GitHub" />
          <SocialButton href={instagramHref} icon={<InstagramIcon />} label="Instagram" />
        </div>

        {/* selected work */}
        <section id="work" className="pf-anim" style={{ animationDelay: ".12s" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Selected work</h2>
            <span style={{ fontFamily: MONO, fontSize: 12, color: V.fg3 }}>{String(projects.length).padStart(2, "0")} projects{yearRange ? ` · ${yearRange}` : ""}</span>
          </div>

          {/* index header */}
          <div className="pf-grid" style={{ padding: "0 8px 12px", borderBottom: "1px solid var(--lineStrong)", ...monoLabel }}>
            <span>No.</span><span>Project</span><span className="pf-col-spark" /><span className="pf-col-disc">Discipline</span><span style={{ textAlign: "right" }}>Year</span><span />
          </div>

          {/* scrolling rows */}
          <div className="pf-work-scroll" style={{ maxHeight: 246, overflowY: "auto", overflowX: "hidden", margin: "0 -8px", padding: "0 8px", WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%)", maskImage: "linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%)" }}>
            {projects.map((p) => {
              const cells = (
                <>
                  <span style={{ fontFamily: MONO, fontSize: 14, color: p.accent }}>{p.no}</span>
                  <div>
                    <div style={{ fontSize: 19, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 14, color: V.fg3, marginTop: 3 }}>{p.desc}</div>
                  </div>
                  <span className="pf-col-spark"><Sparkline points={p.spark} color={p.accent} /></span>
                  <span className="pf-col-disc" style={{ fontSize: 14, color: V.fg2 }}>{p.discipline}</span>
                  <span style={{ fontFamily: MONO, fontSize: 14, color: V.fg2, textAlign: "right" }}>{p.year}</span>
                  <span style={{ display: "flex", justifyContent: "flex-end" }}>{p.href ? <Chevron /> : null}</span>
                </>
              );
              // Only render a link when there is an actual destination; rows
              // without href are plain (no pointer, not focusable).
              return p.href ? (
                <a key={p.no} className="pf-row pf-grid" href={p.href} aria-label={`${p.name} — ${p.desc}, ${p.discipline}, ${p.year}`}>
                  {cells}
                </a>
              ) : (
                <div key={p.no} className="pf-row pf-grid">
                  {cells}
                </div>
              );
            })}
          </div>
        </section>

        {/* footer */}
        <footer className="pf-anim" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--line)", flexWrap: "wrap", gap: 12, animationDelay: ".18s" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: V.fg2 }}><Dot />{availability}</span>
          <a className="pf-link" href={`mailto:${email}`} style={{ fontFamily: MONO, fontSize: 14 }}>{email}</a>
        </footer>
      </div>
    </div>
  );
}

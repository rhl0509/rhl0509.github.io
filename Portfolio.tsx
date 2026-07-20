import React, { CSSProperties, ReactNode, useEffect, useState } from "react";

/* =====================================================================
   GAGYE — Designer Portfolio main page
   Responsive single-screen layout with an internally-scrolling project list.
   Colors are driven by CSS custom properties so light/dark themes swap by
   toggling [data-theme] — inline styles read them via var(--token).
   ===================================================================== */

const MONO = "'JetBrains Mono', ui-monospace, monospace";

/** Browser-chrome colours for <meta name="theme-color">.
    Must stay in step with the boot script in index.html, which paints the same
    values before React loads — this constant is the component-side copy. */
const THEME_COLOR = { light: "#ECEFF3", dark: "#08090B" } as const;

/** Theme-aware tokens. Every colour the component uses must live here — reaching
    past V for a raw var() is what lets the two themes drift apart. */
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
  cardBorder: "var(--card-border)",
  cardShadow: "var(--card-shadow)",
  /* status dot. Themed: one lime cannot clear 3:1 on both white and near-black. */
  signal: "var(--signal)",
} as const;

export interface Project {
  no: string;
  name: string;
  desc: string;
  /** what you did on it — not a design discipline */
  role: string;
  year: string;
  /** headline technologies, 2–3 max before the column wraps */
  stack: string[];
  /** Case-study or repo URL. Set it and the row's Link column grows a button
      that opens it in a new tab; leave it off and that cell stays empty. */
  href?: string;
}

/* Every entry here is a real, inspectable thing. The template shipped six
   invented projects; the last of them (Meridian Terminal — a trading workspace
   that was only ever a spec) is gone, so the list no longer claims anything that
   cannot be produced on request. Keep it that way: an entry earns its slot by
   existing, not by rounding the list out.
   The two hrefs both 404 for visitors — see each row's note. Every backing repo
   is private except crack's, and that one is a stale April snapshot with no
   README, so it is not linked either.
   `no` is display text, not an index — deleting from the top keeps 05…01
   contiguous, so nothing renumbers. Delete from the middle and it will. */
export const PROJECTS: Project[] = [
  /* real — RoadAeye/Road_A_Eye, a team project (AI-X final). Everything in
     stack is from the backend README: FastAPI 0.115 + SQLAlchemy 2.0 async +
     aiomysql, JWT (pyjwt) + bcrypt, a Next.js front on :3000, an AI server on
     :8001; db/schema holds ai_db / board_db / chat_db / member_db.
     KNOWN: the repo is private, so this 404s for anonymous visitors (as with 04).
     The URL points at /tree/develop on purpose: `main` holds only an "Initial
     commit", while the actual app lives on `develop` (apps/, db/, docs/; 12
     commits) — so a reader who does have access lands on the real work, not an
     empty repo. Making the repo public is what fixes the visitor 404. */
  { no: "05", name: "Road A Eye", desc: "고속도로 CCTV 기반 위험차량 감지·관제", role: "Team Lead", year: "2026", stack: ["Next.js", "FastAPI", "JWT", "DB 이중화", "ITS API"], href: "https://github.com/RoadAeye/Road_A_Eye/tree/develop" },
  /* real (D:\auto_agent). 62종 is counted, not quoted: 62 of the 63 top-level
     .md files carry a `name:` frontmatter (design-agents.md is the odd one),
     which matches the repo README's own figure.
     KNOWN: this href 404s for visitors. rhl0509/claude-agents is private, and
     GitHub answers 404 (not 403) for private repos so their existence stays
     hidden — so the link reads as broken, not as locked. It is here by the
     owner's explicit decision, made after that was verified; do not "fix" it by
     deleting the href. Flipping the repo to public is what makes it work, and
     the repo already reads as if it were (its README carries a git clone URL). */
  { no: "04", name: "AX-agent", desc: "Claude Code 서브에이전트 62종 + 훅 자동화", role: "Team Lead", year: "2026", stack: ["Anthropic API"], href: "https://github.com/rhl0509/claude-agents" },
  /* real (D:\stock_tracker) — FastAPI + React client + MySQL. The 머신러닝 half
     is XGBoost_v2/, and the three nouns in desc are what it actually pulls:
     시세 = pykrx adjusted OHLCV (collect_universe/collect_v2), 수급 =
     flow_history (collect_flow), 공시 = DART (collect_disclosure/dart_client).
     Those feed feature_v2 → train_v2 → predict_v2 → backtest_v2 →
     daily_recommend. Year from git: first commits 2026-06.
     No href: D:\stock_git is the deploy repo and it is private. */
  { no: "03", name: "AI Stock", desc: "시세·수급·공시 수집부터 예측·백테스트까지", role: "Portfolio", year: "2026", stack: ["Full-stack", "머신러닝"] },
  /* real (D:\expense_tracker) — actually Next.js 16 + FastAPI + MySQL, recorded
     here because the Stack cell now carries "Full-stack" instead of the tech
     list (owner's call). "AI API" is routes/expense_ai.py, which instantiates
     an Anthropic client. No href: the backend repo is private and the Next.js
     frontend its README points to (rhl0509/expense_frontend) does not exist on
     GitHub. */
  { no: "02", name: "AI 가계부", desc: "AI를 활용한 개인·가구 공유 가계부", role: "Portfolio", year: "2026", stack: ["Full-stack", "AI API"] },
  /* real (D:\crack), team project — MBC 2026 대보정보통신 선도교육 2조.
     desc/stack describe the local state: the 싱크홀·SAM2 half is not in the
     public repo, which was last pushed 2026-04-09. href deliberately omitted —
     A-Eye-2026/crack is public, but it has no README and the contributor graph
     reads rhl0509 2 of 25 commits. Linking it is the owner's call, not a
     default. */
  { no: "01", name: "crack", desc: "도로 균열·포트홀·싱크홀 탐지", role: "Team member", year: "2026", stack: ["Flask", "HTML", "SAM2"] },
];

/** Arrow, angled up-right rather than straight: ↗ is the established "leaves
    this page" direction, while → reads as "next / continue here". */
function ArrowIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
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

/** title repeats the accessible name on purpose: if the tooltip said "라이트 모드"
    (a state) while the label said "라이트 모드로 전환" (an action), voice control
    would match the tooltip and fail to find the button. */
function ThemeToggle({ theme, onToggle }: { theme: "light" | "dark"; onToggle: () => void }) {
  const label = theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환";
  return (
    <button
      type="button"
      className="pf-iconbtn"
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SocialButton({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  // no aria-label: the visible <span> already names the link, and an aria-label
  // holding the same string would only override it with itself.
  return (
    <a className="pf-social" href={href} target="_blank" rel="noopener noreferrer">
      {icon}
      <span>{label}</span>
      <span className="pf-sr">(새 창)</span>
    </a>
  );
}

const STYLE = `
.pf-card {
  /* contrast ratios below are against --surface / --panel in this theme */
  --ink: #0A0B0D;
  --fg2: #4B5563;        /* 7.6 / 7.0 */
  --fg3: #5B6472;        /* 6.0 / 5.6 — was #6B7280 (4.83 / 4.50: no headroom) */
  --line: rgba(0,0,0,0.06);
  --lineStrong: rgba(0,0,0,0.16);
  --panel: #F5F7FA;
  --surface: #FFFFFF;
  --hl-bg: #9CA3AF;
  --hl-ink: #0A0B0D;
  --logo-bg: #9CA3AF;
  --logo-ink: #0A0B0D;
  --signal: #65A30D;     /* 3.1 on white — #84CC16 is 1.98 here and washes out */
  --card-border: rgba(0,0,0,0.10);
  --card-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 24px 70px rgba(0,0,0,0.10);
  --scroll-thumb: rgba(0,0,0,0.16);
  --scroll-thumb-hover: rgba(0,0,0,0.28);

  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 16px;     /* card — nothing nested may exceed this */

  --dur-theme: 250ms;
  --dur-fast: 120ms;
  --ease-out: cubic-bezier(.2,.7,.2,1);

  width: min(1280px, 100%);
  margin-inline: auto;   /* #root is full-width now, so the card centres itself */
}
/* Dark tokens are screen-only. Print skips backgrounds by default, so a dark
   theme on paper becomes near-white text on nothing — in print this whole
   block simply never applies and the light tokens above take over. */
@media screen {
  .pf-card[data-theme="dark"], [data-theme="dark"] .pf-card {
    --ink: #F3F4F6;
    --fg2: #9CA3AF;        /* 7.5 / 7.0 */
    --fg3: #7F8795;        /* 5.3 / 4.9 — was #6B7280, i.e. the light value verbatim
                              (3.96 / 3.67: below AA. A missing override is valid CSS,
                              so nothing but a contrast check catches it.) */
    --line: rgba(255,255,255,0.08);
    --lineStrong: rgba(255,255,255,0.18);
    --panel: #16181D;
    --surface: #0E0F12;
    --hl-bg: #3F4651;
    --hl-ink: #F3F4F6;
    --logo-bg: #9CA3AF;
    --logo-ink: #0A0B0D;
    --signal: #84CC16;     /* 9.7 on near-black */
    --card-border: rgba(255,255,255,0.10);
    --card-shadow: 0 1px 2px rgba(0,0,0,0.40), 0 24px 70px rgba(0,0,0,0.55);
    --scroll-thumb: rgba(255,255,255,0.18);
    --scroll-thumb-hover: rgba(255,255,255,0.32);
  }
}

/* Theme swap tween. The duration is a custom property, not a literal: custom
   properties inherit but don't compete on specificity, so an element can dial
   it down without out-specifying this (0,2,0) selector. */
.pf-card, .pf-card * {
  transition:
    background-color var(--dur-theme) var(--ease-out),
    border-color     var(--dur-theme) var(--ease-out),
    color            var(--dur-theme) var(--ease-out),
    fill             var(--dur-theme) var(--ease-out),
    stroke           var(--dur-theme) var(--ease-out),
    box-shadow       var(--dur-theme) var(--ease-out);
}
/* hover feedback wants ~120ms; 250ms reads as lag */
.pf-row, .pf-iconbtn, .pf-social, .pf-link { --dur-theme: var(--dur-fast); }

.pf-pad { padding: 40px 56px 44px; }

/* visually hidden, still announced */
.pf-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

/* Internal scroll keeps the card a single screen tall; the mask fades the
   first and last rows out at the edges so the cut reads as intentional, not
   as a clipped layout. Kept in CSS (not inline) so print can unfold it. */
.pf-work-scroll {
  max-height: 246px;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  scroll-padding-block: 18px;
  /* bleed 8px past the text column so the row hover pill isn't clipped */
  margin: 0 -8px;
  padding: 0 8px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%);
}
/* the list scrolls, so it must be reachable by keyboard — none of its rows are
   focusable while the projects carry no href */
.pf-work-scroll:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; border-radius: var(--radius-sm); }

.pf-work-scroll::-webkit-scrollbar { width: 6px; }
.pf-work-scroll::-webkit-scrollbar-track { background: transparent; }
.pf-work-scroll::-webkit-scrollbar-thumb { background: var(--scroll-thumb); border-radius: 3px; }
.pf-work-scroll:hover::-webkit-scrollbar-thumb { background: var(--scroll-thumb-hover); }

/* Stack needs ~130px: "React · TypeScript" at 11px mono wraps below that, and a
   wrapped chip list makes row heights uneven. Role gives up the width.
   The last column is wider than the 32px button it holds on purpose: gap is
   uniform across the grid, so the only way to push Link away from Year is to
   pad its own column. The button is right-aligned, so the surplus lands on its
   left — 60px reads as a ~48px gap after Year, against 20px everywhere else.
   That distance is doing work: Link is the one interactive column. */
.pf-grid { display: grid; grid-template-columns: 64px 1fr 132px 132px 76px 60px; gap: 20px; align-items: center; }

.pf-row { padding: 16px 8px; border-bottom: 1px solid var(--line); border-radius: var(--radius-sm); color: inherit; }
/* the row is never the link — only .pf-visit is. A button nested inside a
   linked row would be interactive content inside an <a>: invalid HTML, and it
   breaks keyboard order and AT announcement. */
/* a.pf-visit, not .pf-visit: every row carries the button now, but only the ones
   with a live link may light up — highlighting a dead row invites a click that
   does nothing. (No backticks in this string: it is a template literal.) */
.pf-row:hover:has(a.pf-visit) { background: var(--panel); }

/* Visit button, on every row. The live one is an <a>; the href-less one is the
   -off variant: same footprint, no hover, no cursor, no focus — it holds the
   column's shape without pretending to be pressable. */
.pf-visit { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; flex: none; border-radius: var(--radius-sm); border: 1px solid var(--lineStrong); color: var(--fg3); text-decoration: none; }
a.pf-visit:hover { color: var(--ink); border-color: var(--ink); background: var(--surface); }
.pf-visit-off { border-color: var(--line); color: var(--fg3); opacity: .38; cursor: default; }

.pf-link { color: inherit; text-decoration: none; }
/* dim via color, not opacity: color is in the transition set above, so this
   eases like every other hover — opacity would snap. fg2 keeps AA headroom. */
.pf-link:hover { color: var(--fg2); }

.pf-iconbtn { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: var(--radius-md); border: 1px solid var(--lineStrong); background: transparent; color: var(--fg2); cursor: pointer; }
.pf-social { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 16px; border: 1px solid var(--lineStrong); border-radius: 999px; font-size: 14px; font-weight: 600; color: var(--fg2); text-decoration: none; }
.pf-iconbtn:hover, .pf-social:hover { color: var(--ink); border-color: var(--ink); background: var(--panel); }

/* one focus ring, offset varies by element */
.pf-card :is(.pf-visit, .pf-link, .pf-iconbtn, .pf-social):focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: var(--focus-offset, 2px);
}
.pf-link { --focus-offset: 3px; }

/* it's a <ul>: the resets live with the rest of its layout, not inline */
.pf-tags { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; margin: 24px 0 0; padding: 0; max-width: 520px; }
.pf-tag { font-family: ${MONO}; font-size: 12px; color: var(--fg2); padding: 5px 12px; border: 1px solid var(--lineStrong); border-radius: 999px; white-space: nowrap; }

/* per-project stack chips, in the column the fake sparkline used to occupy */
.pf-stack { display: flex; flex-wrap: wrap; gap: 4px; }
.pf-stack span { font-family: ${MONO}; font-size: 11px; color: var(--fg3); white-space: nowrap; }
.pf-stack span + span::before { content: "·"; margin-right: 4px; }

@keyframes pf-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.pf-anim { animation: pf-rise .6s var(--ease-out) both; }

/* selection mirrors the headline highlight — the same tested pair, so
   selected text keeps its contrast in both themes */
.pf-card ::selection { background: var(--hl-bg); color: var(--hl-ink); }

/* Layout values live here, not inline. Inline styles can't answer a media
   query, and CSS can only outrank them with !important — which is why this
   file used to carry fifteen of them. */
.pf-hero { display: flex; align-items: center; gap: 48px; margin-bottom: 44px; }
/* Rounded rect. This works because the portrait is a flat white-background ID
   photo: on the white card its edges just dissolve, and the border does the
   framing. (An earlier portrait had a circular black vignette whose square
   corners read as a grey box here — that one needed a circle to hide them. This
   image doesn't, so the frame is back to matching every other card.) */
.pf-photo { width: 300px; height: 316px; flex: none; border-radius: var(--radius-lg); overflow: hidden; background: var(--panel); border: 1px solid var(--lineStrong); display: flex; align-items: center; justify-content: center; }
.pf-social-row { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }

/* one rule replaces an eight-step font-size ladder; max deviation ~2px */
.pf-h1 { margin: 0; font-size: clamp(26px, 2.8vw + 16px, 64px); line-height: 1.18; font-weight: 600; letter-spacing: -0.03em; word-break: keep-all; }

/* ── 1) ≤1200px · 좁은 데스크톱/노트북 ───────────────────────── */
@media (max-width: 1200px) {
  .pf-pad { padding: 36px 44px 40px; }
  .pf-photo { width: 280px; height: 300px; }
  .pf-grid { grid-template-columns: 56px 1fr 126px 118px 70px 56px; gap: 16px; }
}

/* ── 2) ≤1024px · 태블릿 가로 ─────────────────────────────────── */
@media (max-width: 1024px) {
  .pf-pad { padding: 34px 38px 38px; }
  .pf-hero { gap: 36px; }
  .pf-photo { width: 248px; height: 272px; }
  .pf-grid { grid-template-columns: 52px 1fr 120px 104px 64px 52px; gap: 14px; }
}

/* ── 3) ≤880px · 태블릿 세로 (히어로 세로 스택, 스택 열 숨김) ──── */
@media (max-width: 880px) {
  .pf-hero { flex-direction: column-reverse; align-items: stretch; gap: 24px; }
  /* square, not full-bleed: the portrait is 1:1, and a full-width letterbox
     crops it to a band across the eyes */
  .pf-photo { width: 240px; height: 240px; align-self: center; }
  .pf-grid { grid-template-columns: 48px 1fr 140px 64px 52px; gap: 14px; }
  .pf-col-stack { display: none; }
}

/* ── 4) ≤720px · 큰 휴대폰 (Role 열까지 숨김) ───────────────────── */
@media (max-width: 720px) {
  .pf-pad { padding: 28px 24px 32px; }
  .pf-photo { width: 220px; height: 220px; }
  .pf-grid { grid-template-columns: 40px 1fr 64px 52px; gap: 12px; }
  .pf-col-role { display: none; }
  .pf-iconbtn { width: 44px; height: 44px; }   /* thumb target */
  .pf-visit { width: 44px; height: 44px; }     /* thumb target */
}

/* ── 5) ≤560px · 휴대폰 (소셜 버튼 세로 풀폭) ────────────────────── */
@media (max-width: 560px) {
  .pf-pad { padding: 22px 18px 26px; }
  .pf-hero { gap: 20px; }
  .pf-photo { width: 196px; height: 196px; }
  .pf-social-row { flex-direction: column; align-items: stretch; }
  .pf-social { justify-content: center; height: 44px; }
  /* the <br> in the headline is load-bearing: it stands in for the only space
     between "개발자에서," and "바이브가". Hiding it welds them into one token
     that word-break: keep-all refuses to split, and the card overflows.
     "AI 엔지니어로." is glued with &nbsp; instead of a second <br>: a hard
     break there fits wide screens but strands "설계하는" alone on tablets —
     the nbsp lets each width break at whichever space it needs while never
     splitting AI from 엔지니어로. */
}

/* ── 6) ≤400px · 소형 휴대폰 ──────────────────────────────────── */
@media (max-width: 400px) {
  .pf-pad { padding: 18px 14px 22px; }
  .pf-grid { grid-template-columns: 34px 1fr 52px 48px; gap: 10px; }
}

/* ── 0a) ≥1440px · 대형 데스크톱 ─────────────────────────────── */
@media (min-width: 1440px) {
  .pf-card { width: min(1360px, 100%); }
  .pf-pad { padding: 48px 64px 52px; }
  .pf-photo { width: 320px; height: 340px; }
  .pf-grid { grid-template-columns: 72px 1fr 148px 148px 84px 68px; gap: 24px; }
}

/* ── 0b) ≥1680px · 초대형 / 와이드 모니터 ─────────────────────── */
@media (min-width: 1680px) {
  .pf-card { width: min(1480px, 100%); }
  .pf-pad { padding: 52px 72px 56px; }
  .pf-photo { width: 344px; height: 364px; }
}

/* ── 0c) 초고해상도 (FHD~8K) · 카드 전체를 zoom으로 비례 확대 ──────
   가로 너비 + 세로 높이를 함께 만족할 때만 확대한다. 높이를 같이
   보지 않으면 와이드하지만 낮은 화면(예: 2560×1440)에서 카드가
   뷰포트보다 길어져 세로 스크롤이 생긴다(바깥 프레임은 overflow:auto)
   — "한 화면" 레이아웃이 깨진다. */
@media (min-width: 1920px) and (min-height: 1240px) { .pf-card { zoom: 1.15; } }  /* FHD 1080p */
@media (min-width: 2560px) and (min-height: 1480px) { .pf-card { zoom: 1.35; } }  /* QHD 1440p */
@media (min-width: 3440px) and (min-height: 1720px) { .pf-card { zoom: 1.60; } }  /* UltraWide */
@media (min-width: 3840px) and (min-height: 2040px) { .pf-card { zoom: 1.90; } }  /* 4K UHD */
@media (min-width: 5120px) and (min-height: 2680px) { .pf-card { zoom: 2.50; } }  /* 5K */
@media (min-width: 6016px) and (min-height: 3200px) { .pf-card { zoom: 3.10; } }  /* 6K */
@media (min-width: 7680px) and (min-height: 4000px) { .pf-card { zoom: 3.80; } }  /* 8K UHD */

/* ── 인쇄 · 채용 담당자의 "PDF로 저장" ──────────────────────────
   다크 토큰은 위의 @media screen 안에 있어 인쇄에선 라이트 값으로
   떨어진다. 여기서는 화면 전용 장치만 걷어낸다. */
@media print {
  .pf-card { --card-shadow: none; }  /* the inline box-shadow reads this var */
  /* unfold the internal scroll: paper has no scrollbar, so show every row */
  .pf-work-scroll { max-height: none; overflow: visible; -webkit-mask-image: none; mask-image: none; }
  .pf-iconbtn { display: none; }     /* theme toggle is meaningless on paper */
  .pf-anim { animation: none; }
}

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
  /** intro paragraph; supports explicit line breaks */
  intro?: ReactNode;
  /** Portrait image URL. Served from public/, so the path is root-relative.
      Source of truth is img/profile-source.png (a 1254² flat-white-background ID
      photo); public/profile.webp is its 700px webp derivative — a straight
      downscale, no crop, since the source is already square and centred. */
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

/** Whatever the boot script in index.html already resolved and painted with —
    a stored toggle if there is one, otherwise the OS preference. Re-deriving it
    here would risk disagreeing with the markup that is already on screen. */
function getInitialTheme(): "light" | "dark" {
  if (typeof document !== "undefined") {
    const t = document.documentElement.getAttribute("data-theme");
    if (t === "dark" || t === "light") return t;
  }
  return "light";
}

export default function Portfolio({
  name = "Hyeongrae Rho",
  email = "rhl9509@naver.com",
  tagline = "AI Engineering · Full-stack",
  headline = (
    <>
      코드를 짜던 개발자에서,<br />바이브가 아닌{" "}
      <span style={{ background: V.hlBg, color: V.hlInk, padding: "0.02em 0.16em", borderRadius: "var(--radius-xs)", WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }}>구조</span>를 설계하는 AI&nbsp;엔지니어로.
    </>
  ),
  intro = (
    <>
      보여주는 AI는 바이브로 충분합니다. 일하는 AI는 구조가 필요합니다.<br />매일의 업무 위에서 실제로 도는 상태, AX.<br />그걸 받치는 인프라부터 프론트까지, 풀스택으로 만듭니다.
    </>
  ),
  photoSrc = "/profile.webp",
  projects = PROJECTS,
  /* mirrored in public/og.svg's footer — change both, then `npm run og` */
  availability = "2026 채용·프로젝트·협업·문의 환영",
  githubHref = "https://github.com/rhl0509",
  instagramHref = "https://instagram.com/hyeongrae_r",
  /* Ordered to trace the intro's own claim — AX first, then the 인프라·서버·프론트
     that has to hold it up: AI, server, data, front, platform.
     AX leads by choice and is the one chip that is not a technology: it names the
     intro's claim rather than a tool.
     Grep-backed on this drive: Python / FastAPI (erp, stock_tracker,
     expense_tracker), Flask (crack + the public flask repos), MySQL (all four),
     Next.js + TypeScript (erp 16.2.10, expense_tracker 16.2.7), ML Pipeline
     (stock_tracker's scikit-learn retrain), GitHub Actions (erp, this repo).
     Windows / Linux / AWS are the owner's claim and deliberately not grep-gated:
     OS and cloud-console work leaves no dependency behind, so "no boto3" would
     only have proved the Python SDK is unused — not that AWS is.
     PostgreSQL stays out: zero usage, and unlike the above it is the kind of
     thing that would leave a driver behind if it were used. React is out because
     Next.js is React. Docker is out by request, though erp does ship one. */
  stack = ["AX", "ML Pipeline", "Python", "FastAPI", "Flask", "MySQL", "Next.js", "TypeScript", "HTML", "CSS", "Windows", "Linux", "AWS", "Notion", "GitHub Actions"],
}: PortfolioProps) {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // keep the browser chrome in step with the page
    document.getElementById("theme-color")?.setAttribute("content", THEME_COLOR[theme]);
  }, [theme]);

  // Follow live OS theme changes (sunset auto-dark, etc.) — but only while the
  // visitor has no explicit stored choice, the same precedence the boot script
  // applies at first paint.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      try {
        const s = localStorage.getItem("theme");
        if (s === "dark" || s === "light") return;
      } catch {
        /* unreadable storage — treat as no stored choice */
      }
      setTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

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

  return (
    <div className="pf-card" data-theme={theme} style={{ background: V.surface, border: `1px solid ${V.cardBorder}`, borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: V.cardShadow, fontFamily: "'Pretendard Variable', Pretendard, system-ui, sans-serif", WebkitFontSmoothing: "antialiased", color: V.ink }}>
      <style>{STYLE}</style>
      <main className="pf-pad">
        {/* top bar */}
        <header className="pf-anim" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: V.logoBg, color: V.logoInk, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, letterSpacing: "-0.03em" }} aria-hidden="true">{initialsOf(name)}</div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
          </div>
          {/* not a <nav>: it holds a status badge and a toggle, no navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14 }}>
            <span lang="en" style={{ display: "flex", alignItems: "center", gap: 8, color: V.fg2 }}><Dot />Open to work</span>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        {/* hero */}
        <section className="pf-hero pf-anim" id="about" style={{ animationDelay: ".06s" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* no fontWeight: only the 400 cut of JetBrains Mono is loaded, so the
                previous 500 was already silently matching down to 400 */}
            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: V.fg3, marginBottom: 16 }}>{tagline}</div>
            <h1 className="pf-h1">{headline}</h1>
            <p style={{ margin: "20px 0 0", fontSize: 17, lineHeight: 1.55, color: V.fg2, maxWidth: 520, wordBreak: "keep-all" }}>{intro}</p>
            {stack.length > 0 && (
              /* role="list" is not redundant: list-style none strips the list
                 semantics in Safari/VoiceOver, and this puts them back */
              <ul className="pf-tags" role="list" aria-label="기술 스택">
                {stack.map((t) => (
                  <li key={t} className="pf-tag">{t}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="pf-photo">
            <img src={photoSrc} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </section>

        {/* social links */}
        <div className="pf-anim pf-social-row" style={{ animationDelay: ".09s" }}>
          <SocialButton href={githubHref} icon={<GitHubIcon />} label="GitHub" />
          <SocialButton href={instagramHref} icon={<InstagramIcon />} label="Instagram" />
        </div>

        {/* selected work */}
        <section id="work" className="pf-anim" style={{ animationDelay: ".12s" }}>
          {/* the flex row held a project counter on the right; with it gone the
              heading is the only child and carries its own bottom margin. */}
          <h2 lang="en" style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>Selected work</h2>

          {/* index header */}
          <div className="pf-grid" lang="en" style={{ padding: "0 8px 12px", borderBottom: `1px solid ${V.lineStrong}`, ...monoLabel }}>
            <span>No.</span><span>Project</span><span className="pf-col-stack">Stack</span><span className="pf-col-role">Role</span><span style={{ textAlign: "center" }}>Year</span><span style={{ textAlign: "right" }}>Link</span>
          </div>

          {/* scrolling rows */}
          <div className="pf-work-scroll" role="group" tabIndex={0} aria-label={`Selected work — 프로젝트 ${projects.length}개, 스크롤 가능`}>
            {projects.map((p) => {
              const cells = (
                <>
                  <span style={{ fontFamily: MONO, fontSize: 14, color: V.fg3 }}>{p.no}</span>
                  <div>
                    <div style={{ fontSize: 19, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 14, color: V.fg3, marginTop: 4 }}>{p.desc}</div>
                  </div>
                  <span className="pf-col-stack pf-stack">
                    {p.stack.map((s) => <span key={s}>{s}</span>)}
                  </span>
                  <span className="pf-col-role" style={{ fontSize: 14, color: V.fg2 }}>{p.role}</span>
                  {/* centred, and the "Year" header above it must match. Both
                      were right-aligned, which lined their right edges up
                      exactly — but "YEAR" (29px) and "2026" (34px) are different
                      widths, so only that one edge touched and the pair read as
                      crooked. Centring only one of them would widen the gap, not
                      close it. Safe here because every year is four digits; if a
                      value ever isn't, right-align both instead — mono digits
                      are for column alignment, not centring. */}
                  <span style={{ fontFamily: MONO, fontSize: 14, color: V.fg2, textAlign: "center" }}>{p.year}</span>
                  {/* Link column. Only this button is interactive — the row is
                      never a link, so nothing nests inside anything.
                      Every row shows the button so the column reads as a column,
                      but a row with no href gets the dimmed, inert variant: a
                      live-looking control that goes nowhere is a broken promise.
                      It is aria-hidden because there is nothing to announce —
                      a screen reader meets the same "no link here" as a sighted
                      visitor, just without a phantom control in the tab order. */}
                  <span style={{ display: "flex", justifyContent: "flex-end" }}>
                    {p.href ? (
                      <a className="pf-visit" href={p.href} target="_blank" rel="noopener noreferrer">
                        <ArrowIcon />
                        <span className="pf-sr">{p.name} 링크 열기 (새 창)</span>
                      </a>
                    ) : (
                      <span className="pf-visit pf-visit-off" aria-hidden="true">
                        <ArrowIcon />
                      </span>
                    )}
                  </span>
                </>
              );
              return (
                <div key={p.no} className="pf-row pf-grid">
                  {cells}
                </div>
              );
            })}
          </div>
        </section>

        {/* footer */}
        <footer className="pf-anim" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 32, paddingTop: 24, borderTop: `1px solid ${V.line}`, flexWrap: "wrap", gap: 12, animationDelay: ".18s" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: V.fg2 }}><Dot />{availability}</span>
          <a className="pf-link" href={`mailto:${email}`} style={{ fontFamily: MONO, fontSize: 14 }}>{email}</a>
        </footer>
      </main>
    </div>
  );
}

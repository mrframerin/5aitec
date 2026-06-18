import type { Metadata } from "next";
import { AboutImage } from "./AboutImage";
import { AboutRuntimeGate } from "./AboutRuntimeGate";
import { aboutContent } from "./aboutContent";
import { CrtOverlay } from "../../components/CrtOverlay";

export const metadata: Metadata = {
  title: "About - 5AITEC",
  description:
    "Sai's first-person account of twelve years building in AR, commerce AI, deep tech, and the next bets.",
};

const featuredImages = [
  aboutContent.hero,
  aboutContent.film[1],
  aboutContent.film[4],
  aboutContent.film[7],
  {
    src: "/textures/jake_computer.webp",
    alt: "Sai wearing a headset in a dark glitch-style portrait.",
    desc: "Sai headset portrait",
    width: 1024,
    height: 1536,
  },
] as const;

export default function AboutPage() {
  return (
    <main className="about-page">
      <AboutRuntimeGate />
      <CrtOverlay scene="contact" opacity={0.32} zIndex={96} scrollReactive />
      <div className="about-monitor-glass" aria-hidden="true" />

      <header className="about-topbar" data-about-topbar>
        <a href="/" className="about-wordmark" aria-label="Go to homepage">
          5AITEC
        </a>
        <a href="/" className="about-close" aria-label="Close about page">
          <span aria-hidden="true">×</span>
        </a>
      </header>

      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-hero-main" data-reveal>
          <p className="about-label">About Sai</p>
          <h1 id="about-title">12 years. No plans to stop.</h1>
        </div>
        <div className="about-hero-copy" data-reveal>
          <p>
            I started building in Bangalore in 2014. Twelve years later I am still at
            it: different problems, same compulsion.
          </p>
        </div>
      </section>

      <section className="about-image-field" aria-label="Sai image field" data-reveal>
        {featuredImages.map((image, index) => (
          <figure className={`about-float about-float-${index + 1}`} key={image.src}>
            <AboutImage image={image} className="about-float-image" priority={index === 0} />
          </figure>
        ))}
      </section>

      <section className="about-stats" aria-label="Career stats" data-reveal>
        {aboutContent.stats.map((stat) => (
          <div key={stat.label}>
            <strong>{stat.num}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="about-timeline" aria-labelledby="timeline-title">
        <div className="about-section-kicker" data-reveal>
          <p className="about-label">Timeline</p>
          <h2 id="timeline-title">A few frames from the build log.</h2>
        </div>
        <div className="about-film-strip" data-film-strip>
          {aboutContent.film.map((item, index) => (
            <figure className="about-film-card" key={item.label}>
              <AboutImage image={item} className="about-film-image" />
              <figcaption>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="about-journey" aria-labelledby="journey-title">
        <div className="about-section-kicker" data-reveal>
          <p className="about-label">{aboutContent.credential}</p>
          <h2 id="journey-title">The journey, not the press release.</h2>
        </div>
        <div className="about-rows">
          {aboutContent.journey.map((chapter, index) => (
            <article className="about-row" key={chapter.title} data-reveal>
              <div className="about-row-year">{String(index + 1).padStart(2, "0")}</div>
              <div>
                <p className="about-label">{chapter.kicker}</p>
                <h3>{chapter.title}</h3>
              </div>
              <div className="about-row-copy">
                {chapter.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-interests" aria-labelledby="interests-title" data-reveal>
        <div>
          <p className="about-label">Outside the work</p>
          <h2 id="interests-title">{aboutContent.interests.title}</h2>
        </div>
        <div className="about-interest-list">
          {aboutContent.interests.items.map((item) => (
            <article key={item.label}>
              <span>{item.icon}</span>
              <h3>{item.label}</h3>
              <p>{item.line}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-spuddish" aria-labelledby="spuddish-title" data-reveal>
        <div>
          <p className="about-label">{aboutContent.spuddish.subtitle}</p>
          <h2 id="spuddish-title">{aboutContent.spuddish.title}</h2>
        </div>
        <div className="about-spuddish-copy">
          {aboutContent.spuddish.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <ul>
            {aboutContent.spuddish.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <a href={aboutContent.spuddish.ctaHref}>→ {aboutContent.spuddish.ctaLabel}</a>
        </div>
      </section>

      <section className="about-work" aria-labelledby="work-title">
        <div className="about-section-kicker" data-reveal>
          <p className="about-label">Working together</p>
          <h2 id="work-title">{aboutContent.howIWork.title}</h2>
          <p>{aboutContent.howIWork.framing}</p>
        </div>
        <div className="about-work-grid">
          {aboutContent.howIWork.cards.map((card, index) => (
            <article key={card.title} data-reveal>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-close-band" data-reveal>
        <p>{aboutContent.locationLine}</p>
        <h2>Still the most interesting time to build.</h2>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
html, body {
  min-height: 100%;
  height: auto !important;
  overflow-x: hidden;
  overflow-y: auto;
  background: #f7f3eb;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 94;
  pointer-events: none;
  opacity: 0.16;
  background:
    repeating-linear-gradient(0deg, rgba(36,24,15,0.1) 0 1px, transparent 1px 3px),
    repeating-linear-gradient(90deg, rgba(36,24,15,0.025) 0 1px, transparent 1px 4px);
  mix-blend-mode: multiply;
}

body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 95;
  pointer-events: none;
  opacity: 0.06;
  background-image:
    radial-gradient(circle, rgba(36,24,15,0.42) 0 1px, transparent 1.3px),
    radial-gradient(circle, rgba(255,255,255,0.8) 0 1px, transparent 1.3px);
  background-size: 41px 47px, 67px 61px;
  background-position: 0 0, 21px 31px;
  mix-blend-mode: multiply;
}

.about-page {
  --paper: #f7f3eb;
  --paper-2: #efe7da;
  --paper-3: #e7eef0;
  --paper-4: #ebe1d1;
  --ink: #21160f;
  --muted: rgba(36,24,15,0.62);
  --line: rgba(36,24,15,0.16);
  --surface: #fffaf1;
  --warm: #8b5e2a;
  min-height: 100vh;
  color: var(--ink);
  background:
    linear-gradient(90deg, rgba(36,24,15,0.07) 1px, transparent 1px),
    linear-gradient(180deg, rgba(36,24,15,0.045) 1px, transparent 1px),
    var(--paper);
  background-size: 92px 100%, 100% 86px, auto;
  font-family: var(--font-stix, "STIX Two Text", "Times New Roman", serif);
}

.about-page * { box-sizing: border-box; }

.about-monitor-glass {
  position: fixed;
  inset: -2%;
  z-index: 97;
  pointer-events: none;
  opacity: 0.34;
  background:
    radial-gradient(ellipse at 50% 12%, rgba(255,255,255,0.5), transparent 34%),
    radial-gradient(ellipse at 50% 50%, transparent 48%, rgba(36,24,15,0.1) 100%),
    linear-gradient(115deg, transparent 0 40%, rgba(255,255,255,0.18) 46%, transparent 54% 100%);
  mix-blend-mode: soft-light;
  transform: scale(1.02);
}

.about-topbar {
  position: fixed;
  z-index: 120;
  inset: 0 0 auto;
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: 18px clamp(22px, 4vw, 58px);
  color: var(--ink);
  transition: background 300ms ease-out, border-color 300ms ease-out;
}

.about-topbar.is-scrolled {
  background: rgba(247,243,235,0.9);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(16px);
}

.about-wordmark, .about-close, .about-label,
.about-stats span, .about-film-card figcaption, .about-row-year,
.about-interest-list span, .about-spuddish li, .about-work-grid span,
.about-placeholder-text {
  font-family: var(--font-stix, "STIX Two Text", "Times New Roman", serif);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.about-wordmark, .about-close { color: inherit; text-decoration: none; }

.about-wordmark {
  display: inline-flex;
  align-items: center;
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.16em;
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}

.about-wordmark:hover {
  opacity: 0.66;
  transform: translateY(-1px);
}

.about-close {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  color: #fffaf1;
  background: var(--ink);
  font-size: 24px;
  line-height: 1;
  letter-spacing: 0;
}

.about-label {
  margin: 0;
  color: var(--warm);
  font-size: 11px;
  line-height: 1.4;
}

.about-hero {
  min-height: 72svh;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  gap: clamp(36px, 8vw, 130px);
  align-items: end;
  padding: clamp(110px, 13vw, 156px) clamp(24px, 5vw, 72px) clamp(70px, 8vw, 120px);
}

.about-hero-main h1 {
  max-width: 920px;
  margin: 22px 0 0;
  font-size: clamp(52px, 6.4vw, 104px);
  line-height: 0.96;
  letter-spacing: 0;
  font-weight: 500;
}

.about-hero-copy {
  max-width: 520px;
  padding-bottom: 10px;
}

.about-hero-copy p,
.about-section-kicker > p:not(.about-label),
.about-row-copy p,
.about-spuddish-copy p,
.about-work-grid p,
.about-interest-list p {
  color: var(--muted);
  font-size: clamp(18px, 1.55vw, 24px);
  line-height: 1.36;
}

.about-image-field {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: clamp(150px, 16vw, 248px);
  gap: clamp(14px, 1.6vw, 26px);
  margin: 0 clamp(24px, 5vw, 72px) clamp(72px, 8vw, 120px);
  padding: clamp(30px, 4vw, 58px) 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  perspective: 1200px;
}

.about-float {
  position: relative;
  margin: 0;
  overflow: hidden;
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(36,24,15,0.13);
  background: rgba(255,250,241,0.64);
  transform:
    rotate(var(--rot, 0deg))
    translate3d(calc(var(--about-mx, 0) * var(--depth, 0) * 1px), calc(var(--about-my, 0) * var(--depth, 0) * 1px), 0);
  transition: transform 380ms ease-out, box-shadow 380ms ease-out;
  will-change: transform;
}

.about-float:hover {
  transform: rotate(0deg) translateY(-6px) scale(1.025);
  box-shadow: 0 34px 80px rgba(36,24,15,0.22);
  z-index: 6;
}

.about-float .about-image-shell {
  width: 100%;
  height: 100%;
  aspect-ratio: auto !important;
}
.about-float .about-image-shell img { width: 100%; height: 100%; object-fit: cover; transition: transform 700ms ease-out; }
.about-float:hover .about-image-shell img { transform: scale(1.05); }

.about-float-1 { grid-column: 4 / 10; grid-row: 1 / 3; --rot: 0deg;    --depth: 5; }
.about-float-2 { grid-column: 1 / 4;  grid-row: 1;     --rot: -2deg;   --depth: 15; }
.about-float-3 { grid-column: 10 / 13; grid-row: 1;    --rot: 2deg;    --depth: 12; }
.about-float-4 { grid-column: 1 / 4;  grid-row: 2;     --rot: 1.6deg;  --depth: 19; }
.about-float-5 { grid-column: 10 / 13; grid-row: 2;    --rot: -1.6deg; --depth: 16; }

.about-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-block: 1px solid var(--line);
}

.about-stats div {
  min-height: 210px;
  padding: clamp(24px, 4vw, 54px);
  border-right: 1px solid var(--line);
}

.about-stats strong {
  display: block;
  font-size: clamp(54px, 6.8vw, 112px);
  line-height: 0.86;
  font-weight: 600;
}

.about-stats span {
  display: block;
  max-width: 16ch;
  margin-top: 18px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.4;
}

.about-section-kicker {
  display: grid;
  grid-template-columns: minmax(180px, 0.42fr) minmax(0, 1fr);
  gap: clamp(28px, 6vw, 90px);
  padding: clamp(70px, 8vw, 120px) clamp(24px, 5vw, 72px) 34px;
}

.about-section-kicker h2,
.about-interests h2,
.about-spuddish h2,
.about-close-band h2 {
  margin: 0;
  font-size: clamp(42px, 5.7vw, 96px);
  line-height: 0.96;
  font-weight: 600;
  letter-spacing: 0;
}

.about-timeline {
  background: var(--paper-2);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.about-journey {
  background: var(--paper);
}

.about-interests {
  background: var(--paper-3);
}

.about-spuddish {
  background: var(--paper-4);
}

.about-work {
  background: var(--paper);
}

.about-film-strip {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  padding: 26px clamp(24px, 5vw, 72px) clamp(70px, 8vw, 110px);
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: grab;
}

.about-film-strip::-webkit-scrollbar { display: none; }
.about-film-strip.is-dragging { cursor: grabbing; }
.about-film-strip.is-dragging * { pointer-events: none; }

.about-film-card {
  flex: 0 0 clamp(220px, 22vw, 340px);
  margin: 0;
  overflow: hidden;
  border-radius: 18px;
  background: var(--surface);
}

.about-film-image { aspect-ratio: 4 / 5; }

.about-film-card figcaption {
  display: grid;
  gap: 8px;
  padding: 14px 16px 17px;
  font-size: 10px;
  line-height: 1.35;
}

.about-film-card figcaption span { color: var(--warm); }

.about-rows {
  margin: 0 clamp(24px, 5vw, 72px) clamp(80px, 9vw, 130px);
  border-top: 1px solid var(--line);
}

.about-row {
  display: grid;
  grid-template-columns: 120px minmax(220px, 0.55fr) minmax(0, 1fr);
  gap: clamp(24px, 5vw, 72px);
  padding: clamp(28px, 4vw, 52px) 0;
  border-bottom: 1px solid var(--line);
}

.about-row-year { color: var(--warm); font-size: 12px; }

.about-row h3 {
  margin: 14px 0 0;
  font-size: clamp(32px, 4vw, 62px);
  line-height: 0.95;
  font-weight: 600;
}

.about-row-copy p { margin: 0 0 16px; font-size: clamp(16px, 1.25vw, 20px); }

.about-interests,
.about-spuddish {
  display: grid;
  grid-template-columns: minmax(260px, 0.45fr) minmax(0, 1fr);
  gap: clamp(28px, 6vw, 90px);
  padding: clamp(76px, 9vw, 130px) clamp(24px, 5vw, 72px);
  border-top: 1px solid var(--line);
}

.about-interest-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid var(--line);
}

.about-interest-list article {
  min-height: 190px;
  padding: 22px 22px 28px 0;
  border-bottom: 1px solid var(--line);
}

.about-interest-list span { color: var(--warm); font-size: 11px; }
.about-interest-list h3 { margin: 30px 0 10px; font-size: clamp(24px, 2.6vw, 42px); line-height: 1; }
.about-interest-list p { margin: 0; font-size: 16px; }

.about-spuddish-copy ul {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 28px 0 0;
  padding: 0;
}

.about-spuddish-copy li {
  padding: 8px 10px;
  border: 1px solid var(--line);
  font-size: 10px;
}

.about-spuddish-copy a {
  display: inline-block;
  margin-top: 28px;
  color: var(--ink);
  font-family: var(--font-stix, "STIX Two Text", "Times New Roman", serif);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-decoration: none;
  border-bottom: 1px solid currentColor;
}

.about-work-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0 clamp(24px, 5vw, 72px) clamp(80px, 9vw, 130px);
  border-top: 1px solid var(--line);
  border-left: 1px solid var(--line);
}

.about-work-grid article {
  min-height: 340px;
  padding: 24px;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.about-work-grid span { color: var(--warm); font-size: 11px; }
.about-work-grid h3 { margin: 40px 0 18px; font-size: clamp(28px, 3vw, 46px); line-height: 0.96; }
.about-work-grid p { margin: 0; font-size: 16px; }

.about-close-band {
  padding: clamp(76px, 9vw, 130px) clamp(24px, 5vw, 72px);
  border-top: 1px solid var(--line);
}

.about-close-band p {
  color: var(--warm);
  font-family: var(--font-stix, "STIX Two Text", "Times New Roman", serif);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.about-close-band h2 { max-width: 960px; }

.about-image-shell {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(36,24,15,0.06);
}

.about-image-shell img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-placeholder-text {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 18px;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.45;
  text-align: center;
}

.about-image-shell.is-loaded:not(.is-placeholder) .about-placeholder-text { display: none; }

[data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 700ms ease-out, transform 700ms ease-out;
}

[data-reveal].is-visible { opacity: 1; transform: translateY(0); }

/* ---- micro-interactions (keep the page alive) ---- */
.about-page { overflow-x: clip; }

.about-close { transition: transform 320ms ease-out, background 320ms ease-out; }
.about-close:hover { transform: rotate(90deg); background: var(--warm); }

.about-film-card {
  transition: transform 380ms ease-out, box-shadow 380ms ease-out;
  box-shadow: 0 14px 30px rgba(36,24,15,0.08);
}
.about-film-card:hover { transform: translateY(-8px); box-shadow: 0 28px 60px rgba(36,24,15,0.16); }
.about-film-image img { transition: transform 600ms ease-out; }
.about-film-card:hover .about-film-image img { transform: scale(1.06); }
.about-film-card figcaption span { transition: color 320ms ease-out; }
.about-film-card:hover figcaption span { color: var(--ink); }

.about-stats div { transition: background 320ms ease-out; }
.about-stats div:hover { background: var(--surface); }
.about-stats strong { display: block; transform-origin: left bottom; transition: color 320ms ease-out, transform 320ms ease-out; }
.about-stats div:hover strong { color: var(--warm); transform: scale(1.04); }

.about-interest-list article { transition: background 320ms ease-out, padding-left 320ms ease-out; }
.about-interest-list article:hover { background: var(--surface); padding-left: 18px; }
.about-interest-list span { display: inline-block; transition: transform 320ms ease-out; }
.about-interest-list article:hover span { transform: translateY(-3px) scale(1.12); }

.about-work-grid article { transition: background 320ms ease-out, transform 320ms ease-out; }
.about-work-grid article:hover { background: var(--surface); transform: translateY(-4px); }

.about-spuddish-copy a { position: relative; border-bottom: none !important; }
.about-spuddish-copy a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 340ms ease-out;
}
.about-spuddish-copy a:hover::after { transform: scaleX(1); }

@media (prefers-reduced-motion: reduce) {
  .about-float,
  .about-float .about-image-shell img,
  .about-film-card,
  .about-film-image img,
  .about-stats strong,
  .about-close,
  .about-work-grid article,
  .about-interest-list article { transition: none; }
  .about-float { transform: rotate(var(--rot, 0deg)); }
}

@media (max-width: 980px) {
  .about-hero,
  .about-section-kicker,
  .about-row,
  .about-interests,
  .about-spuddish {
    grid-template-columns: 1fr;
  }
  .about-image-field {
    grid-template-columns: repeat(6, 1fr);
    grid-auto-rows: clamp(130px, 21vw, 200px);
  }
  .about-float-1 { grid-column: 1 / 7; grid-row: 1 / 3; }
  .about-float-2 { grid-column: 1 / 4; grid-row: 3; }
  .about-float-3 { grid-column: 4 / 7; grid-row: 3; }
  .about-float-4 { grid-column: 1 / 4; grid-row: 4; }
  .about-float-5 { grid-column: 4 / 7; grid-row: 4; }
  .about-stats, .about-work-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 620px) {
  .about-hero { padding-top: 96px; }
  .about-hero-main h1 { font-size: clamp(48px, 14vw, 76px); }
  .about-stats, .about-work-grid, .about-interest-list { grid-template-columns: 1fr; }
  .about-float { border-radius: 14px; }
  .about-image-field {
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: 150px;
  }
  .about-float-1 { grid-column: 1 / 3; grid-row: 1 / 3; }
  .about-float-2 { grid-column: 1; grid-row: 3; }
  .about-float-3 { grid-column: 2; grid-row: 3; }
  .about-float-4 { grid-column: 1; grid-row: 4; }
  .about-float-5 { grid-column: 2; grid-row: 4; }
}
`,
        }}
      />
    </main>
  );
}

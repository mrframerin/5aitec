import type { Metadata } from "next";
import content from "../../modules/home/content/home.json";
import type { HomeContent } from "../../modules/home/components/types";

const homeContent = content as HomeContent;
const anti = homeContent.antiPortfolio;

export const metadata: Metadata = {
  title: "Anti-Portfolio — 5aitec",
  description: anti?.subline,
};

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function AntiPortfolioPage() {
  if (!anti) return null;

  return (
    <main
      style={{
        background: "#0a0a0a",
        color: "#e8e3d6",
        minHeight: "100vh",
        padding: "60px 24px 120px",
        fontFamily: "'STIX Two Text', 'Times New Roman', serif",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderTop: "3px double #e8e3d6",
            borderBottom: "1px solid #e8e3d6",
            padding: "12px 0",
            fontSize: 12,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          <span>The Saitec Obituary</span>
          <span>Vol. I — Founder's Edition</span>
          <span>{today}</span>
        </header>

        <h1
          style={{
            fontSize: "clamp(56px, 9vw, 120px)",
            fontWeight: 700,
            textAlign: "center",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            margin: "48px 0 16px",
          }}
        >
          {anti.title}
        </h1>

        <p
          style={{
            textAlign: "center",
            fontStyle: "italic",
            fontSize: "clamp(16px, 1.6vw, 20px)",
            maxWidth: 720,
            margin: "0 auto 48px",
            opacity: 0.78,
            lineHeight: 1.5,
          }}
        >
          {anti.subline}
        </p>

        <div
          style={{
            borderTop: "1px solid #e8e3d6",
            borderBottom: "1px solid #e8e3d6",
            padding: "10px 0",
            textAlign: "center",
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: 56,
          }}
        >
          In Loving Memory of {anti.items.length} Ventures
        </div>

        <section
          style={{
            columnCount: 2,
            columnGap: 48,
            columnRule: "1px solid rgba(232, 227, 214, 0.25)",
          }}
        >
          {anti.items.map((item, i) => (
            <article
              key={item.name}
              style={{
                breakInside: "avoid",
                marginBottom: 40,
                paddingBottom: 24,
                borderBottom: "1px dashed rgba(232, 227, 214, 0.18)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    opacity: 0.55,
                  }}
                >
                  Obituary №{String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    padding: "3px 8px",
                    border: "1px solid #e8e3d6",
                    borderRadius: 2,
                  }}
                >
                  R.I.P.
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(26px, 3.2vw, 38px)",
                  fontWeight: 700,
                  lineHeight: 1.05,
                  margin: "0 0 12px",
                  letterSpacing: "-0.01em",
                }}
              >
                {item.name}
              </h2>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.55,
                  margin: 0,
                  opacity: 0.85,
                }}
              >
                <span
                  style={{
                    float: "left",
                    fontSize: "2.4em",
                    lineHeight: 0.85,
                    paddingRight: 6,
                    paddingTop: 4,
                    fontWeight: 700,
                  }}
                >
                  {item.oneLiner.charAt(0)}
                </span>
                {item.oneLiner.slice(1)}
              </p>
            </article>
          ))}
        </section>

        <footer
          style={{
            borderTop: "3px double #e8e3d6",
            marginTop: 32,
            paddingTop: 16,
            textAlign: "center",
            fontSize: 12,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            opacity: 0.7,
          }}
        >
          Failure is part of the process &nbsp;·&nbsp;{" "}
          <a
            href="/"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            Return to the living
          </a>
        </footer>
      </div>
    </main>
  );
}

import type { HomeContent } from "./types";

type A11yContentProps = {
  content: HomeContent;
};

export function A11yContent({ content }: A11yContentProps) {
  const aboutParagraphs = [
    ...content.about.intro.columns,
    ...content.about.whatWeBuild.paragraphs,
    content.about.clients.paragraph,
    content.about.serious.paragraph,
  ];

  return (
    <div id="json-content-layer">
      <button type="button" className="a11y-skip-to-content">
        Skip to content
      </button>

      <nav aria-label="Main navigation" className="a11y-hidden">
        <button type="button" aria-label="Shader logo, go to home page">
          Shader - Home
        </button>
        <ul>
          {content.navigation.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
        <a
          href={content.contact.bookCallUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Book a call on Cal.com, opens in new tab"
        >
          Book a call
        </a>
      </nav>

      <section aria-label="Hero" className="a11y-hidden" id="hero">
        <h1>{content.hero.title}</h1>
        <p>{content.hero.subtitle}</p>
      </section>

      <section aria-label="Selected Work" className="a11y-hidden" id="projects">
        <h2>{content.projects.title}</h2>
        <p>{content.projects.description}</p>
        <fieldset>
          <legend>Project carousel</legend>
          <button type="button" aria-label="Go to previous project in carousel">
            Previous project
          </button>
          <ul>
            {content.projects.items.map((project) => (
              <li key={project.uid}>
                <a href={project.url}>
                  {project.title} - {project.subtitle}
                </a>
                <p>{project.description}</p>
                {project.siteUrl ? (
                  <a
                    href={project.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit site
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
          <button type="button" aria-label="Go to next project in carousel">
            Next project
          </button>
        </fieldset>
      </section>

      <section aria-label="About Us" className="a11y-hidden" id="about-us">
        <h2>{content.about.title}</h2>
        {aboutParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <a
          href={content.contact.bookCallUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Book a call with Shader on Cal.com, opens in new tab"
        >
          {content.about.bookCallLabel}
        </a>
      </section>

      <section aria-label="Contact" className="a11y-hidden" id="contact">
        <h2>{content.contact.title}</h2>
        <p>{content.contact.intro}</p>
        <fieldset>
          <legend>General Enquiries</legend>
          <a
            aria-label={`Send email to ${content.contact.email}`}
            href={`mailto:${content.contact.email}`}
          >
            {content.contact.email}
          </a>
          <a
            href={content.contact.bookCallUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Book a call on Cal.com, opens in new tab"
          >
            Book a call
          </a>
        </fieldset>
        <fieldset>
          <legend>Visit us</legend>
          <address aria-label="Office address">
            {content.contact.address.street}
            <br />
            {content.contact.address.postalCode} {content.contact.address.city}
            <br />
            {content.contact.address.country}
          </address>
        </fieldset>
        <fieldset>
          <legend>Social</legend>
          <a
            href={content.contact.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href={content.contact.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            href={content.contact.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
          >
            X (Twitter)
          </a>
        </fieldset>
        <fieldset>
          <legend>Say Hi</legend>
          <p>I invest in things and friends I know. Submit a pitch.</p>
          <p>
            <a
              aria-label={`Send email to ${content.contact.ceoEmail}`}
              href={`mailto:${content.contact.ceoEmail}`}
            >
              I'm one email away,{" "}
              {content.contact.ceoEmail}
            </a>
          </p>
        </fieldset>
        <fieldset>
          <legend>Footer</legend>
          <a href="/accessibility-statement">Accessibility Statement</a>
        </fieldset>
      </section>
    </div>
  );
}

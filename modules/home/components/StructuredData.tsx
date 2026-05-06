import type { HomeContent } from "./types";

type StructuredDataProps = {
  content: HomeContent;
};

export function StructuredData({ content }: StructuredDataProps) {
  const organization = {
    "@context": "https://schema.org",
    "@id": content.document.canonical,
    "@type": "Organization",
    name: content.schema.organization.name,
    description: content.document.description,
    email: content.schema.organization.email,
    legalName: content.schema.organization.legalName,
    taxID: content.schema.organization.taxID,
    url: content.schema.organization.url,
    sameAs: [
      content.contact.social.instagram,
      content.contact.social.linkedin,
      content.contact.social.twitter,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: content.contact.email,
    },
    location: {
      "@type": "Place",
      name: content.schema.organization.legalName,
      address: {
        "@type": "PostalAddress",
        streetAddress: content.contact.address.street,
        addressLocality: content.contact.address.city,
        postalCode: content.contact.address.postalCode,
        addressCountry: content.contact.address.countryCode,
      },
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: content.schema.organization.name,
    url: content.document.canonical,
    alternateName: ["Shader", "Shader Sweden"],
    description:
      "Creative development studio specialized in interactive 3D and AI solutions.",
    publisher: {
      "@type": "Organization",
      "@id": content.document.canonical,
    },
  };

  const portfolio = {
    "@id": `${content.document.canonical}/work`,
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Portfolio",
    numberOfItems: content.projects.items.length,
    itemListElement: content.projects.items.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${content.document.canonical}${project.url}`,
      name: project.title,
    })),
  };

  return (
    <>
      {[organization, website, portfolio].map((item) => (
        <script
          key={item["@type"] + (item.name ?? "")}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}

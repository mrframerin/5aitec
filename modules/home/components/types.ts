export type HomeContent = {
  document: {
    lang: string;
    title: string;
    description: string;
    icon: string;
    stylesheet: string;
    canonical: string;
  };
  navigation: Array<{
    label: string;
    href: string;
  }>;
  hero: {
    title: string;
    subtitle: string;
  };
  projects: {
    title: string;
    description: string;
    items: Array<{
      uid: string;
      url: string;
      title: string;
      subtitle: string;
      siteUrl: string;
      description: string;
    }>;
  };
  about: {
    title: string;
    paragraphs: string[];
    bookCallLabel: string;
  };
  contact: {
    title: string;
    intro: string;
    email: string;
    ceoEmail: string;
    bookCallUrl: string;
    address: {
      street: string;
      postalCode: string;
      city: string;
      country: string;
      countryCode: string;
    };
    social: {
      linkedin: string;
      instagram: string;
      twitter: string;
    };
  };
  schema: {
    organization: {
      name: string;
      legalName: string;
      taxID: string;
      url: string;
      email: string;
    };
  };
};

export type RuntimeContent = {
  chunkBase: string;
  flightScript: string;
  chunks: string[];
};

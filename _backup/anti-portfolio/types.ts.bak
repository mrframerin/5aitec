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
    assets?: Record<string, string>;
  };
  projects: {
    title: string;
    description: string;
    assets?: Record<string, string>;
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
    intro: {
      sceneTitle: string;
      title: string;
      columns: string[];
      image: string;
    };
    whatWeBuild: {
      title: string;
      paragraphs: string[];
    };
    clients: {
      title: string;
      paragraph: string;
      images: Record<string, string>;
      logoCloud: {
        image: string;
        logos: string[];
      };
    };
    serious: {
      title: string;
      paragraph: string;
    };
    shredder: {
      title: string;
      image: string;
      model: string;
    };
    business: {
      title: string;
      subtitle: string;
    };
    goldenTie: {
      title: string;
      subtitle: string;
      awards: string;
      model: string;
    };
    bookCallLabel: string;
  };
  office?: { assets?: Record<string, string> };
  contactScene?: { assets?: Record<string, string> };
  bankScene?: { assets?: Record<string, string> };
  footer?: { images?: Record<string, string> };
  accessibility?: { images?: Record<string, string> };
  sharedAssets?: { images?: Record<string, string> };
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

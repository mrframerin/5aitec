import type { Metadata, Viewport } from "next";
import { HomeHead } from "../modules/home/components/HomeHead";
import content from "../modules/home/content/home.json";
import type { HomeContent } from "../modules/home/components/types";

const homeContent = content as HomeContent;

export const metadata: Metadata = {
  metadataBase: new URL(homeContent.document.canonical),
  title: homeContent.document.title,
  description: homeContent.document.description,
  alternates: {
    canonical: homeContent.document.canonical,
  },
  icons: {
    icon: homeContent.document.icon,
  },
  openGraph: {
    type: "website",
    siteName: "5aitec",
    title: homeContent.document.title,
    description: homeContent.document.description,
    url: homeContent.document.canonical,
    // Placeholder share image — swap for a purpose-built 1200×630 5aitec card.
    images: [{ url: "/textures/brand-logos/5aitec-03-vector.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: homeContent.document.title,
    description: homeContent.document.description,
    images: ["/textures/brand-logos/5aitec-03-vector.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={homeContent.document.lang}>
      <head>
        <HomeHead document={homeContent.document} />
      </head>
      <body>{children}</body>
    </html>
  );
}

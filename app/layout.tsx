import type { Metadata, Viewport } from "next";
import { HomeHead } from "../modules/home/components/HomeHead";
import content from "../modules/home/content/home.json";
import type { HomeContent } from "../modules/home/components/types";

const homeContent = content as HomeContent;

export const metadata: Metadata = {
  title: homeContent.document.title,
  description: homeContent.document.description,
  alternates: {
    canonical: homeContent.document.canonical,
  },
  icons: {
    icon: homeContent.document.icon,
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

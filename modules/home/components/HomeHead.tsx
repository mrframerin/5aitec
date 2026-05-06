import type { HomeContent } from "./types";

type HomeHeadProps = {
  document: HomeContent["document"];
};

export function HomeHead({ document }: HomeHeadProps) {
  return (
    <>
      <link rel="icon" href={document.icon} />
      <link rel="stylesheet" href={document.stylesheet} />
      <link rel="canonical" href={document.canonical} />
    </>
  );
}

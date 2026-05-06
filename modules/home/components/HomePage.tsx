import content from "../content/home.json";
import runtimeContent from "../content/runtime.json";
import { A11yContent } from "./A11yContent";
import { HomeContentScript } from "./HomeContentScript";
import { HomeRuntime } from "./HomeRuntime";
import { StructuredData } from "./StructuredData";
import type { HomeContent, RuntimeContent } from "./types";

const homeContent = content as HomeContent;
const runtime = runtimeContent as RuntimeContent;

export function HomePage() {
  return (
    <>
      <A11yContent content={homeContent} />
      <HomeContentScript content={homeContent} />
      <HomeRuntime runtime={runtime} />
      <StructuredData content={homeContent} />
    </>
  );
}

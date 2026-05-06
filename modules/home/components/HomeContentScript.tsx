import type { HomeContent } from "./types";

type HomeContentScriptProps = {
  content: HomeContent;
};

export function HomeContentScript({ content }: HomeContentScriptProps) {
  const serializedContent = JSON.stringify(content).replace(/</g, "\\u003c");

  return (
    <script
      id="home-content-json"
      dangerouslySetInnerHTML={{
        __html: `window.__SHADER_HOME_CONTENT__=${serializedContent};`,
      }}
    />
  );
}

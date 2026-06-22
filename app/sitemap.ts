import type { MetadataRoute } from "next";
import content from "../modules/home/content/home.json";

const BASE_URL = "https://5aitec.com";

type SitemapEntry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: SitemapEntry[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/skills", priority: 0.6, changeFrequency: "monthly" },
    { path: "/giving", priority: 0.5, changeFrequency: "monthly" },
    { path: "/anti-portfolio", priority: 0.4, changeFrequency: "yearly" },
  ];

  const projectItems = (content.projects?.items ?? []) as Array<{ url: string }>;
  const projectRoutes: SitemapEntry[] = projectItems.map((project) => ({
    path: project.url,
    priority: 0.7,
    changeFrequency: "monthly",
  }));

  // Dedupe by path so a repeated project uid can't emit duplicate <url> entries.
  const seen = new Set<string>();
  const routes = [...staticRoutes, ...projectRoutes].filter((route) => {
    if (seen.has(route.path)) return false;
    seen.add(route.path);
    return true;
  });

  return routes.map((route) => ({
    url: `${BASE_URL}${route.path === "/" ? "" : route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

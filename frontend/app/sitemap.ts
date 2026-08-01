import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const routes: {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
}[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/filmboxx", priority: 0.9, changeFrequency: "weekly" },
  { path: "/lounge", priority: 0.9, changeFrequency: "weekly" },
  { path: "/gymboxx", priority: 0.7, changeFrequency: "monthly" },
  { path: "/bowlboxx", priority: 0.7, changeFrequency: "monthly" },
  { path: "/services", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((route) => ({
    url: `${site.url}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

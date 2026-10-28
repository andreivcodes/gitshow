import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://git.show", changeFrequency: "weekly", priority: 1 },
    { url: "https://git.show/pp", changeFrequency: "yearly", priority: 0.3 },
    { url: "https://git.show/tc", changeFrequency: "yearly", priority: 0.3 },
  ];
}

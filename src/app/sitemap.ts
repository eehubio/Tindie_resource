import type { MetadataRoute } from "next";
import { getPublishDates } from "@/lib/queries";

const SITE_URL = "https://resource.tindie.com";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let dates: string[] = [];
  try {
    dates = await getPublishDates();
  } catch {
    dates = [];
  }

  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/directory`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/archive`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];

  const dated: MetadataRoute.Sitemap = dates.map((d) => ({
    url: `${SITE_URL}/archive?date=${d}`,
    lastModified: new Date(d + "T00:00"),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...core, ...dated];
}

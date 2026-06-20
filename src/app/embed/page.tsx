import { HomeBody } from "@/components/HomeBody";
import { getPublishedDiscoveries, getResources, getActiveRecommendation } from "@/lib/queries";

export const revalidate = 600; // ISR: cached on the global CDN, regenerated at most every 10 min

// Chrome-less version of the home page, intended to be embedded in tindie.com via <iframe>.
// No Tindie header/footer — the parent page provides its own.
export default async function EmbedPage() {
  let discoveries: any[] = [];
  let resources: any[] = [];
  let recommendation: any = null;
  try {
    [discoveries, resources, recommendation] = await Promise.all([
      getPublishedDiscoveries(6),
      getResources(),
      getActiveRecommendation(),
    ]) as any;
  } catch {
    // DB unreachable at build time — render empty; ISR will fill it in on the next revalidate.
  }
  return (
    <div style={{ background: "#fff" }}>
      <HomeBody resources={resources as any} topDiscoveries={(discoveries as any[]).slice(0, 6)} savedIds={[]} signedIn={false} recommendation={recommendation} chrome={false} />
    </div>
  );
}

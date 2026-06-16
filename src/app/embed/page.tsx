import { HomeBody } from "@/components/HomeBody";
import { getPublishedDiscoveries, getResources } from "@/lib/queries";

export const dynamic = "force-dynamic";

// Chrome-less version of the home page, intended to be embedded in tindie.com via <iframe>.
// No Tindie header/footer — the parent page provides its own.
export default async function EmbedPage() {
  const [discoveries, resources] = await Promise.all([
    getPublishedDiscoveries(6),
    getResources(),
  ]);
  return (
    <div style={{ background: "#fff" }}>
      <HomeBody resources={resources as any} topDiscoveries={(discoveries as any[]).slice(0, 6)} savedIds={[]} signedIn={false} chrome={false} />
    </div>
  );
}

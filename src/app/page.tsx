import { HomeBody } from "@/components/HomeBody";
import { getPublishedDiscoveries, getResources, getUserSaves, getActiveRecommendation } from "@/lib/queries";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  const [discoveries, resources, savedIds, recommendation] = await Promise.all([
    getPublishedDiscoveries(6),
    getResources(),
    userId ? getUserSaves(userId) : Promise.resolve([] as number[]),
    getActiveRecommendation(),
  ]);
  return <HomeBody resources={resources as any} topDiscoveries={(discoveries as any[]).slice(0, 6)} savedIds={savedIds} signedIn={!!userId} recommendation={recommendation} chrome />;
}

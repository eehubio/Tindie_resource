import Link from "next/link";
import { TindieHeader, TindieFooter } from "@/components/Chrome";
import { DiscoveryGrid } from "@/components/Discovery";
import { SubmitButton } from "@/components/PublicWidgets";
import { FeaturedThisWeek } from "@/components/HomeSections";
import { BrowseAndDirectory } from "@/components/DirectoryTabs";
import { HomeSearchProvider, HomeSearchInput } from "@/components/HomeSearch";
import { RecommendationBanner } from "@/components/RecommendationBanner";

// Shared home content. `chrome` controls whether the Tindie header/footer render.
// The /embed route passes chrome={false} so the page can be iframed into tindie.com cleanly.
export function HomeBody({ resources, topDiscoveries, savedIds, signedIn, recommendation, chrome = true }:
  { resources: any[]; topDiscoveries: any[]; savedIds: number[]; signedIn: boolean; recommendation?: any; chrome?: boolean }) {
  const featured = (resources || []).filter((r: any) => r.isFeatured).slice(0, 6).map((r: any) => ({ id: r.id, name: r.name, tag: r.capLabel, category: r.category, url: r.url, logo: r.logo }));
  return (
    <>
      {chrome && <TindieHeader />}
      <HomeSearchProvider>
      <div style={{ background: "#fafdfd" }}>
        <div className="wrap" style={{ padding: "30px 24px 24px" }}>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-.5px", color: "#2f3438" }}>Hardware Discovery</h1>
          <p style={{ fontSize: 15.5, color: "#6a7176", marginTop: 8, maxWidth: 640 }}>New products, tools, open-source projects, and trusted resources for hardware creators.</p>
          {/* Recommendation banner first, then the search row below it. */}
          <RecommendationBanner rec={recommendation || null} />
          <div className="hero-search-row" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <HomeSearchInput />
            <SubmitButton />
          </div>
        </div>
      </div>

      <div className="wrap">
        {featured.length > 0 && (
          <div style={{ paddingTop: 26 }}>
            <FeaturedThisWeek items={featured} />
          </div>
        )}

        <section style={{ padding: "26px 0 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <h2 style={{ fontSize: 21, fontWeight: 600, color: "#2f3438" }}>✦ Today&apos;s Hardware Discoveries</h2>
            <Link href="/archive" style={{ fontSize: 13.5, fontWeight: 600, color: "#1aa0ab" }}>View all discoveries →</Link>
          </div>
          <p style={{ color: "#8a9499", fontSize: 14, marginBottom: 18 }}>AI-curated daily picks: new products, tools, developer boards, and open-source projects.</p>
          <DiscoveryGrid items={topDiscoveries as any} />
        </section>

        <BrowseAndDirectory resources={resources} />
        <div style={{ height: 40 }} />
      </div>
      </HomeSearchProvider>
      {chrome && <TindieFooter />}
    </>
  );
}

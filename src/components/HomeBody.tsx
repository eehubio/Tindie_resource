import Link from "next/link";
import { TindieHeader, TindieFooter } from "@/components/Chrome";
import { DiscoveryGrid } from "@/components/Discovery";
import { SubmitButton } from "@/components/PublicWidgets";
import { FeaturedThisWeek } from "@/components/HomeSections";
import { BrowseAndDirectory } from "@/components/DirectoryTabs";

const HERO_CHIPS: [string, string, string][] = [["⬡", "Parts & Resources", "components"], ["✎", "Design & Develop", "tools"], ["🏭", "Manufacture", "manufacturing"], ["</>", "Learn & Share", "open-source"], ["◆", "Launch & Sell", "crowdfunding"]];

// Shared home content. `chrome` controls whether the Tindie header/footer render.
// The /embed route passes chrome={false} so the page can be iframed into tindie.com cleanly.
export function HomeBody({ resources, topDiscoveries, savedIds, signedIn, chrome = true }:
  { resources: any[]; topDiscoveries: any[]; savedIds: number[]; signedIn: boolean; chrome?: boolean }) {
  const featured = (resources || []).filter((r: any) => r.isFeatured).slice(0, 6).map((r: any) => ({ id: r.id, name: r.name, tag: r.capLabel, category: r.category, url: r.url, logo: r.logo }));
  return (
    <>
      {chrome && <TindieHeader />}
      <div style={{ background: "#fafdfd" }}>
        <div className="wrap" style={{ padding: "30px 24px 24px" }}>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-.5px", color: "#2f3438" }}>Resources for Hardware Creators</h1>
          <p style={{ fontSize: 15.5, color: "#6a7176", marginTop: 8, maxWidth: 640 }}>Discover trusted tools, platforms, manufacturing partners, and daily hardware discoveries for Tindie buyers and sellers.</p>
          <div className="hero-search-row" style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#fff", border: "1px solid #d6dee0", borderRadius: 9, padding: "3px 4px 3px 15px" }}>
              <span style={{ color: "#8a9499" }}>🔍</span>
              <input placeholder="Search resources…" style={{ flex: 1, border: 0, padding: "12px", fontSize: 15, outline: "none", background: "none" }} />
            </div>
            <SubmitButton />
          </div>
          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {HERO_CHIPS.map(([ic, label, cat]) => (
              <Link key={label} href={`/directory?cat=${cat}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, border: "1px solid #e0e6e7", background: "#fff", padding: "7px 12px", borderRadius: 8, color: "#1c6e7e" }}>
                <span style={{ color: "#22b8c4" }}>{ic}</span>{label}
              </Link>
            ))}
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
          <DiscoveryGrid items={topDiscoveries as any} savedIds={savedIds} signedIn={signedIn} />
        </section>

        <BrowseAndDirectory resources={resources} />
        <div style={{ height: 40 }} />
      </div>
      {chrome && <TindieFooter />}
    </>
  );
}

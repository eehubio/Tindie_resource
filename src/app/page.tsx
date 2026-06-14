import Link from "next/link";
import { TindieHeader, TindieFooter } from "@/components/Chrome";
import { DiscoveryGrid } from "@/components/Discovery";
import { SubmitButton } from "@/components/PublicWidgets";
import { FeaturedCards, BrowseFilterCard, FeaturedThisWeek } from "@/components/HomeSections";
import { DirectoryTabs } from "@/components/DirectoryTabs";
import { getPublishedDiscoveries, getResources, getUserSaves } from "@/lib/queries";
import { auth } from "@/lib/auth";
import { TAXONOMY } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  const [discoveries, resources, savedIds] = await Promise.all([
    getPublishedDiscoveries(6),
    getResources(),
    userId ? getUserSaves(userId) : Promise.resolve([] as number[]),
  ]);
  const topDiscoveries = (discoveries as any[]).slice(0, 6);
  const catCounts: Record<string, number> = {};
  resources.forEach((r) => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
  const HERO_CHIPS: [string, string, string][] = [["</>", "Open Source", "open-source"], ["✎", "Design Tools", "tools"], ["🏭", "Manufacturing", "manufacturing"], ["👥", "Crowdfunding & Marketplaces", "crowdfunding"], ["⬡", "Components", "components"]];

  return (
    <>
      <TindieHeader />
      <div style={{ background: "#fafdfd" }}>
        <div className="wrap" style={{ padding: "30px 24px 24px", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-.5px", color: "#2f3438" }}>Resources for Hardware Creators</h1>
            <p style={{ fontSize: 15.5, color: "#6a7176", marginTop: 8, maxWidth: 540 }}>Discover trusted tools, platforms, manufacturing partners, and daily hardware discoveries for Tindie buyers and sellers.</p>
            <div style={{ marginTop: 18, display: "flex", alignItems: "center", background: "#fff", border: "1px solid #d6dee0", borderRadius: 9, padding: "3px 4px 3px 15px", maxWidth: 540 }}>
              <span style={{ color: "#8a9499" }}>🔍</span>
              <input placeholder="Search resources, tools, boards, projects…" style={{ flex: 1, border: 0, padding: "12px", fontSize: 15, outline: "none", background: "none" }} />
            </div>
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {HERO_CHIPS.map(([ic, label, cat]) => (
                <Link key={label} href={`/directory?cat=${cat}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, border: "1px solid #e0e6e7", background: "#fff", padding: "7px 12px", borderRadius: 8, color: "#1c6e7e" }}>
                  <span style={{ color: "#22b8c4" }}>{ic}</span>{label}
                </Link>
              ))}
            </div>
          </div>
          <Mascot />
        </div>
        <div className="wrap" style={{ padding: "8px 24px 28px", display: "grid", gridTemplateColumns: "1fr 230px", gap: 18, alignItems: "start" }}>
          <FeaturedCards />
          <BrowseFilterCard />
        </div>
      </div>

      <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 30 }}>
        <main>
          <section style={{ padding: "26px 0 28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <h2 style={{ fontSize: 21, fontWeight: 600, color: "#2f3438" }}>✦ Today&apos;s Hardware Discoveries</h2>
              <Link href="/archive" style={{ fontSize: 13.5, fontWeight: 600, color: "#1aa0ab" }}>View all discoveries →</Link>
            </div>
            <p style={{ color: "#8a9499", fontSize: 14, marginBottom: 18 }}>AI-curated daily picks: new products, tools, developer boards, and open-source projects.</p>
            <DiscoveryGrid items={topDiscoveries as any} savedIds={savedIds} signedIn={!!userId} />
          </section>

          <section style={{ padding: "6px 0 28px" }}>
            <h2 style={{ fontSize: 21, fontWeight: 600, color: "#2f3438", marginBottom: 16 }}>Browse by category</h2>
            <div className="cat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 13 }}>
              {TAXONOMY.map((t) => (
                <Link key={t.id} href={`/directory?cat=${t.id}`} style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 11, padding: "18px 14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 11, background: `${t.col}1a`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: t.col }}>{t.ic}</div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: "#2f3438", lineHeight: 1.25 }}>{t.name}</h4>
                  <p style={{ fontSize: 11.5, color: "#8a9499" }}>{catCounts[t.id] || 0} resources</p>
                </Link>
              ))}
            </div>
          </section>

          <section style={{ padding: "6px 0 32px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <h2 style={{ fontSize: 21, fontWeight: 600, color: "#2f3438" }}>Curated Resource Directory</h2>
              <Link href="/directory" style={{ fontSize: 13.5, fontWeight: 600, color: "#1aa0ab" }}>View all resources →</Link>
            </div>
            <p style={{ color: "#8a9499", fontSize: 14, marginBottom: 18 }}>{resources.length}+ trusted platforms, tools, communities, and services for hardware creators.</p>
            <DirectoryTabs resources={resources} perTab={6} />
            <div style={{ textAlign: "center", marginTop: 20 }}><Link href="/directory" style={{ fontSize: 13.5, fontWeight: 600, color: "#1aa0ab" }}>See all {resources.length}+ resources →</Link></div>
          </section>
        </main>

        <aside style={{ paddingTop: 26 }}>
          <FeaturedThisWeek />
          <SubmitButton />
          <div style={{ fontSize: 11, color: "#8a9499", lineHeight: 1.5, padding: "12px 14px", background: "#f2f5f5", borderRadius: 8, marginTop: 16 }}>
            Editor&apos;s Picks and rankings are chosen by our team and are never paid placements. Tindie may earn a referral fee from some partner links; this does not affect rankings.
          </div>
        </aside>
      </div>
      <TindieFooter />
    </>
  );
}


function Mascot() {
  return (
    <div style={{ width: 270 }} className="hero-mascot">
      <svg viewBox="0 0 300 220" style={{ width: "100%", height: "auto" }}>
        <ellipse cx="150" cy="120" rx="135" ry="95" fill="#eef9fb" />
        {[[60,60],[110,40],[210,50],[250,90],[240,150],[60,150]].map(([x,y],i)=>(<g key={i}><rect x={x} y={y} width="22" height="22" rx="4" fill="none" stroke="#9fd0d6" strokeWidth="2"/><circle cx={x+11} cy={y+11} r="2.5" fill="#5bb8c2"/></g>))}
        <rect x="40" y="150" width="46" height="34" rx="3" fill="#c08a5a" /><rect x="214" y="150" width="46" height="34" rx="3" fill="#c08a5a" />
        <g transform="translate(120,70)">
          <ellipse cx="40" cy="70" rx="40" ry="44" fill="#7fb3c4" /><ellipse cx="40" cy="50" rx="30" ry="30" fill="#a7cfdc" />
          <ellipse cx="22" cy="30" rx="8" ry="14" fill="#7fb3c4" transform="rotate(-25 22 30)" /><ellipse cx="58" cy="30" rx="8" ry="14" fill="#7fb3c4" transform="rotate(25 58 30)" />
          <circle cx="31" cy="48" r="4.5" fill="#2b3a40" /><circle cx="49" cy="48" r="4.5" fill="#2b3a40" /><ellipse cx="40" cy="58" rx="5" ry="3.5" fill="#2b3a40" />
          <circle cx="78" cy="78" r="20" fill="none" stroke="#f2762e" strokeWidth="5" /><path d="M92 92l16 16" stroke="#f2762e" strokeWidth="7" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

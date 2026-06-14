import Link from "next/link";
import { TindieHeader, TindieFooter } from "@/components/Chrome";
import { DiscoveryGrid } from "@/components/Discovery";
import { getPublishDates, getDiscoveriesByDate, getUserSaves } from "@/lib/queries";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ArchivePage({ searchParams }: { searchParams: { date?: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  const dates = await getPublishDates();
  const active = searchParams.date && dates.includes(searchParams.date) ? searchParams.date : (dates[0] || new Date().toISOString().slice(0, 10));
  const [items, savedIds] = await Promise.all([
    getDiscoveriesByDate(active),
    userId ? getUserSaves(userId) : Promise.resolve([] as number[]),
  ]);

  return (
    <>
      <TindieHeader />
      <div className="wrap" style={{ paddingTop: 26 }}>
        <div style={{ fontSize: 13, color: "#8a9499", marginBottom: 14 }}><Link href="/" style={{ color: "#1aa0ab" }}>Resources</Link> › Daily Archive</div>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: "#2f3438" }}>Daily Hardware Discoveries — Archive</h2>
        <p style={{ color: "#8a9499", fontSize: 14, marginBottom: 18 }}>Each edition is balanced across categories. Browse by day.</p>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 20 }}>
          {dates.length === 0 && <div style={{ color: "#8a9499", fontSize: 14 }}>No published editions yet. Approve discoveries in the admin to populate the archive.</div>}
          {dates.map((d) => {
            const dt = new Date(d + "T00:00");
            const wd = dt.toLocaleDateString("en-US", { weekday: "short" });
            const day = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const on = d === active;
            return (
              <Link key={d} href={`/archive?date=${d}`} style={{ border: `1px solid ${on ? "#22b8c4" : "#ececec"}`, background: on ? "#eefafb" : "#fff", borderRadius: 9, padding: "10px 14px", textAlign: "center", minWidth: 78 }}>
                <div style={{ fontSize: 11, color: "#8a9499", textTransform: "uppercase" }}>{wd}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#2f3438" }}>{day}</div>
              </Link>
            );
          })}
        </div>
        <DiscoveryGrid items={items as any} savedIds={savedIds} signedIn={!!userId} />
      </div>
      <TindieFooter />
    </>
  );
}

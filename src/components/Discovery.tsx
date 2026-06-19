"use client";
import { useState } from "react";
import { taxName, RELATED_PRODUCTS } from "@/lib/taxonomy";

export type Discovery = {
  id: number; title: string; summary: string; why: string; category: string;
  sourceName: string; sourceUrl?: string | null; icon: string | null; chips: string[]; license: string | null;
  availability: string | null; relatedTags: string[]; isSponsored: boolean | null;
  relatedProducts?: { name: string; seller?: string; price?: string; url?: string }[] | null;
  isPick: boolean | null; saveCount: number | null; commentCount: number | null;
};

export function DiscoveryGrid({ items, savedIds, signedIn }: { items: Discovery[]; savedIds: number[]; signedIn: boolean }) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<Discovery | null>(null);

  const FILTERS = [["all","All"],["tools","Design & Develop"],["crowdfunding","Launch & Sell"],["open-source","Learn & Share"],["components","Parts & Resources"],["manufacturing","Manufacture"]];
  let shown = items.filter((d) => filter === "all" || d.category === filter);
  if (q) { const s = q.toLowerCase(); shown = shown.filter((d) => (d.title + d.summary + d.chips.join(" ") + d.sourceName).toLowerCase().includes(s)); }

  return (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {FILTERS.map(([id, label]) => {
          const cnt = id === "all" ? items.length : items.filter((d) => d.category === id).length;
          return <button key={id} onClick={() => setFilter(id)} style={pill(filter === id)}>{label} <span style={{ opacity: .6 }}>{cnt}</span></button>;
        })}
      </div>
      <div className="disc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {shown.map((d) => <DiscoveryCard key={d.id} d={d} saved={savedIds.includes(d.id)} signedIn={signedIn} onOpen={() => setDetail(d)} />)}
        {shown.length === 0 && <div style={{ gridColumn: "1/-1", color: "#8a9499", padding: 30, textAlign: "center", border: "1px dashed #ececec", borderRadius: 10 }}>No discoveries match.</div>}
      </div>
      {detail && <DetailDrawer d={detail} saved={savedIds.includes(detail.id)} signedIn={signedIn} onClose={() => setDetail(null)} />}
    </>
  );
}

function DiscoveryCard({ d, saved, signedIn, onOpen }: { d: Discovery; saved: boolean; signedIn: boolean; onOpen: () => void }) {
  const [isSaved, setSaved] = useState(saved);
  const [saves, setSaves] = useState(d.saveCount || 0);
  async function toggleSave(e: React.MouseEvent) {
    e.stopPropagation();
    if (!signedIn) { alert("Sign in to save discoveries."); return; }
    const res = await fetch("/api/discoveries/save", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ discoveryId: d.id }) });
    if (res.ok) { const j = await res.json(); setSaved(j.saved); setSaves((n) => n + (j.saved ? 1 : -1)); }
  }
  return (
    <div onClick={onOpen} style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 10, display: "flex", flexDirection: "column", cursor: "pointer" }}>
      <div style={{ padding: "15px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase", color: "#22b8c4" }}>{taxName(d.category)}</span>
          {d.isSponsored ? <span style={{ fontSize: 10, fontWeight: 600, background: "#fbf2dc", color: "#9a6b08", padding: "2px 7px", borderRadius: 4 }}>Sponsored</span>
            : d.isPick ? <span style={{ fontSize: 10, fontWeight: 600, background: "#fdebdf", color: "#c25a14", padding: "2px 7px", borderRadius: 4 }}>★ Tindie Pick</span> : null}
        </div>
        <h4 style={{ fontSize: 15.5, margin: "0 0 6px", color: "#2f3438", lineHeight: 1.3 }}>{d.title}</h4>
        <div style={{ fontSize: 11.5, color: "#8a9499", marginBottom: 9 }}><b style={{ color: "#5a6b72" }}>{d.sourceName}</b></div>
        <div style={{ fontSize: 13, color: "#6b7479", flex: 1, lineHeight: 1.5 }}>{flatten(d.summary)}</div>
        <div style={{ fontSize: 12, color: "#1c6e7e", background: "#eef7f8", borderRadius: 7, padding: "8px 10px", marginTop: 11 }}><b>Insights:</b> {flatten(d.why)}</div>
        <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 2, marginTop: 11, borderTop: "1px solid #ececec", paddingTop: 8 }}>
          <button onClick={toggleSave} style={act(isSaved)}>♡ <span>{saves}</span> Save</button>
          <button onClick={onOpen} style={act(false)}>💬 <span>{d.commentCount || 0}</span></button>
          {d.sourceUrl
            ? <a href={d.sourceUrl} target="_blank" rel="noreferrer" style={{ ...act(false), textDecoration: "none" }}>↗ Source</a>
            : <button onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(location.href); alert("Link copied"); }} style={act(false)}>↗ Share</button>}
        </div>
      </div>
    </div>
  );
}

function DetailDrawer({ d, saved, signedIn, onClose }: { d: Discovery; saved: boolean; signedIn: boolean; onClose: () => void }) {
  const [comments, setComments] = useState<{ authorName: string; tag: string | null; body: string }[]>([]);
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("");
  const [loaded, setLoaded] = useState(false);
  // Prefer products the editor manually added in the admin Review drawer (stored in DB).
  // Fall back to tag-based suggestions only if none were set.
  // relatedProducts may arrive as an array (normal) or, depending on driver, a JSON string. Handle both.
  const rawProducts: any = (d as any).relatedProducts;
  const productList: { name: string; seller?: string; price?: string; url?: string }[] =
    Array.isArray(rawProducts) ? rawProducts
    : (typeof rawProducts === "string" && rawProducts.trim().startsWith("["))
      ? (() => { try { return JSON.parse(rawProducts); } catch { return []; } })()
      : [];
  const manual = productList.map((p) => ({ t: p.name, s: p.seller || "", p: p.price || "", ic: "🛒", url: p.url || "" }));
  const fallback = (d.relatedTags || []).flatMap((k) => RELATED_PRODUCTS[k] || []).map((r: any) => ({ ...r, url: "" }));
  const rel = manual.length > 0 ? manual : fallback;
  if (!loaded) { setLoaded(true); fetch(`/api/discoveries/${d.id}/comments`).then((r) => r.ok ? r.json() : []).then((j) => setComments(j || [])).catch(() => {}); }

  async function post() {
    if (!body.trim()) return;
    const res = await fetch("/api/discoveries/comment", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ discoveryId: d.id, body, tag: tag || undefined }) });
    if (res.ok) { setComments((c) => [{ authorName: "you", tag: tag || null, body }, ...c]); setBody(""); setTag(""); }
    else { const j = await res.json().catch(() => ({})); alert(j.error || "Could not post"); }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 30 }} />
      <div style={{ position: "fixed", top: 0, right: 0, width: 520, maxWidth: "100vw", height: "100vh", background: "#fff", zIndex: 31, overflowY: "auto" }}>
        <div style={{ position: "sticky", top: 0, background: "#fff", borderBottom: "1px solid #ececec", padding: "16px 20px", display: "flex", gap: 10, alignItems: "center" }}>
          <h2 style={{ fontSize: 16, flex: 1, color: "#2f3438" }}>{taxName(d.category)}</h2>
          <button onClick={onClose} style={{ background: "none", border: 0, fontSize: 24, color: "#8a9499", cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", color: "#22b8c4", fontWeight: 600 }}>{taxName(d.category)}{d.isSponsored ? " · Sponsored" : d.isPick ? " · Tindie Pick" : ""}</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#2f3438", margin: "6px 0 4px" }}>{d.title}</div>
          <div style={{ fontSize: 12.5, color: "#8a9499", marginBottom: 16 }}><b>{d.sourceName}</b> · curated</div>
          <Block h="What it is"><Bullets text={d.summary} /></Block>
          <div style={{ background: "#eef7f8", borderRadius: 9, padding: "13px 15px", marginBottom: 18 }}><h3 style={h3()}>Insights</h3><Bullets text={d.why} fontSize={14} /></div>
          {d.sourceUrl && <a href={d.sourceUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: "#fff", background: "#22b8c4", borderRadius: 8, padding: "9px 16px", textDecoration: "none", marginBottom: 18 }}>Read original on {d.sourceName} ↗</a>}
          <Block h="At a glance"><p style={{ fontSize: 13, color: "#8a9499" }}>License: {d.license} · Availability: {d.availability}</p></Block>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{(d.chips || []).map((c) => <span key={c} style={{ fontSize: 11, background: "#f0f5f6", color: "#1c6e7e", padding: "3px 9px", borderRadius: 5 }}>{c}</span>)}</div>
          {rel.length > 0 && (
            <div style={{ border: "1px solid #ececec", borderRadius: 10, padding: 14, background: "#fafcfc", marginBottom: 20 }}>
              <h3 style={h3()}>Related products on Tindie</h3>
              <div style={{ fontSize: 11.5, color: "#8a9499", marginBottom: 10 }}>Turn this discovery into a sale — modules and tools makers already sell.</div>
              {rel.map((r) => {
                const inner = (
                  <>
                    <div style={{ width: 46, height: 46, borderRadius: 8, background: "#eef2f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{r.ic}</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: "#2f3438" }}>{r.t}</div><div style={{ fontSize: 11.5, color: "#8a9499" }}>{r.s}{r.p ? <> · <span style={{ fontWeight: 700, color: "#f2762e" }}>{r.p}</span></> : null}</div></div>
                    {r.url ? <span style={{ fontSize: 11, color: "#22b8c4", alignSelf: "center" }}>Visit ↗</span> : null}
                  </>
                );
                return r.url
                  ? <a key={r.t} href={r.url} target="_blank" rel="noreferrer" style={{ display: "flex", gap: 11, padding: "9px 0", borderTop: "1px solid #ececec", textDecoration: "none" }}>{inner}</a>
                  : <div key={r.t} style={{ display: "flex", gap: 11, padding: "9px 0", borderTop: "1px solid #ececec" }}>{inner}</div>;
              })}
            </div>
          )}
          <Block h="Community discussion">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share a technical note, experience or alternative…" style={{ width: "100%", border: "1px solid #ececec", borderRadius: 8, padding: 10, fontSize: 13.5, minHeight: 60, resize: "vertical", fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0" }}>
              {["Technical question","User experience","Alternative product","Manufacturing experience"].map((t) => (
                <span key={t} onClick={() => setTag(tag === t ? "" : t)} style={{ fontSize: 11.5, border: "1px solid #ececec", background: tag === t ? "#1c6e7e" : "#fff", color: tag === t ? "#fff" : "#8a9499", padding: "5px 10px", borderRadius: 16, cursor: "pointer" }}>{t}</span>
              ))}
            </div>
            <button onClick={post} style={{ background: "#22b8c4", color: "#fff", border: 0, borderRadius: 8, padding: "11px 16px", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>Post comment</button>
            <div style={{ marginTop: 8 }}>
              {comments.length === 0 ? <p style={{ fontSize: 13, color: "#8a9499", padding: "10px 0" }}>No comments yet — start the discussion.</p> :
                comments.map((c, i) => <div key={i} style={{ borderTop: "1px solid #ececec", padding: "12px 0", fontSize: 13.5 }}><div style={{ fontSize: 11.5, color: "#8a9499", marginBottom: 3 }}>@{c.authorName} {c.tag ? `· ${c.tag}` : ""}</div>{c.body}</div>)}
            </div>
          </Block>
        </div>
      </div>
    </>
  );
}

function Block({ h, children }: { h: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 18 }}><h3 style={h3()}>{h}</h3>{children}</div>;
}
// Renders text as bullet points when it contains explicit markers (•, newlines,
// or "- " line starts) or several sentences; otherwise as a single paragraph.
// Card view: flatten bullet-style text ("- a\n- b") into one clean line.
function flatten(text?: string | null, max = 180): string {
  let s = (text || "").trim();
  if (!s) return "";
  // strip leading bullet markers and collapse newlines into separators
  s = s.replace(/^\s*[-•]\s*/gm, "").replace(/\n+/g, " · ").replace(/\s{2,}/g, " ").trim();
  if (s.length > max) s = s.slice(0, max).replace(/[\s·]+\S*$/, "") + "…";
  return s;
}

function Bullets({ text, fontSize = 14.5 }: { text?: string | null; fontSize?: number }) {
  const raw = (text || "").trim();
  if (!raw) return null;
  let parts: string[] = [];
  if (/[•\n]|(?:^|\s)[-]\s/.test(raw)) {
    // Split on newlines and/or bullet markers, then strip any leading "- " / "• ".
    parts = raw
      .split(/\n+|(?:\s•\s)/)
      .flatMap((seg) => seg.split(/(?:^|\s)[-]\s+/))
      .map((s) => s.replace(/^\s*[-•]\s*/, "").trim())
      .filter(Boolean);
  } else {
    const sentences = raw.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length >= 2) parts = sentences.map((s) => s.trim());
  }
  if (parts.length <= 1) return <p style={{ fontSize, color: "#4a5358", lineHeight: 1.6 }}>{parts[0] || raw.replace(/^\s*[-•]\s*/, "")}</p>;
  return (
    <ul style={{ margin: 0, paddingLeft: 22, listStyleType: "disc", listStylePosition: "outside" }}>
      {parts.map((p, i) => <li key={i} style={{ fontSize, color: "#4a5358", lineHeight: 1.55, marginBottom: 6, display: "list-item" }}>{p}</li>)}
    </ul>
  );
}
const h3 = () => ({ fontSize: 13, textTransform: "uppercase" as const, letterSpacing: ".4px", color: "#1c6e7e", marginBottom: 6 });
const pill = (active: boolean) => ({ fontSize: 13, padding: "8px 14px", borderRadius: 8, border: "1px solid #ececec", background: active ? "#1c6e7e" : "#fff", color: active ? "#fff" : "#8a9499", cursor: "pointer", fontFamily: "inherit" });
const act = (on: boolean) => ({ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: on ? "#f2762e" : "#8a9499", background: "none", border: 0, cursor: "pointer", padding: "6px 9px", borderRadius: 6, fontFamily: "inherit" });

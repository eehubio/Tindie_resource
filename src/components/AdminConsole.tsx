"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DAILY_TARGET, taxName, TAXONOMY } from "@/lib/taxonomy";

type Disc = any; type Res = any; type Src = any; type Sub = any;
type Stats = { needsReview: number; scheduled: number; approvedToday: number; brokenLinks: number };

export function AdminConsole({ inbox, published, resources, sources, submissions, stats }:
  { inbox: Disc[]; published: Disc[]; resources: Res[]; sources: Src[]; submissions: Sub[]; stats: Stats }) {
  const router = useRouter();
  const [tab, setTab] = useState<"dash" | "inbox" | "dir" | "src" | "mod">("dash");
  const [busy, setBusy] = useState(false);

  async function call(url: string, body: any) {
    setBusy(true);
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (!res.ok) { alert("Action failed (check you are signed in as editor/admin)."); return false; }
    router.refresh(); // re-fetch server data so UI reflects DB
    return true;
  }
  // variant that returns the parsed JSON (used to fetch comments without forcing a refresh)
  async function callJson(url: string, body: any) {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) return null;
    return res.json().catch(() => null);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}>
      {/* sidebar */}
      <aside style={{ width: 220, background: "#0f343f", color: "#cfe1e6", flex: "none", padding: "0" }}>
        <div style={{ padding: "18px 20px", fontWeight: 700, fontSize: 18, color: "#fff", borderBottom: "1px solid #1d5163" }}>tindie<span style={{ color: "#f2762e" }}>.</span> <span style={{ fontSize: 11, color: "#7fa0a9", fontWeight: 400 }}>Admin</span></div>
        {[["dash", "📊 Dashboard"], ["inbox", `📥 Discovery Inbox (${inbox.length})`], ["dir", "📚 Resource Directory"], ["src", "🔗 Sources"], ["mod", `🛡️ Moderation (${submissions.length})`]].map(([k, label]) => (
          <div key={k} onClick={() => setTab(k as any)} style={{ padding: "11px 20px", fontSize: 13.5, cursor: "pointer", borderLeft: `3px solid ${tab === k ? "#f2762e" : "transparent"}`, background: tab === k ? "#16404d" : "transparent", color: tab === k ? "#fff" : "#cfe1e6" }}>{label}</div>
        ))}
        <div style={{ padding: "14px 20px", fontSize: 11, color: "#5f808a", marginTop: 20 }}>Connected to live database</div>
      </aside>

      {/* main */}
      <div style={{ flex: 1, background: "#eef1f2", minWidth: 0 }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #e3e9eb", padding: "14px 26px" }}>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: "#2b3a40" }}>Resources Admin {busy && <span style={{ fontSize: 12, color: "#8a9499", fontWeight: 400 }}>· saving…</span>}</h1>
        </div>
        <div style={{ padding: "24px 26px 60px" }}>
          {tab === "dash" && <Dashboard stats={stats} inbox={inbox} />}
          {tab === "inbox" && <Inbox inbox={inbox} published={published} call={call} callJson={callJson} />}
          {tab === "dir" && <Directory resources={resources} call={call} />}
          {tab === "src" && <Sources sources={sources} call={call} />}
          {tab === "mod" && <Moderation submissions={submissions} call={call} />}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ stats, inbox }: { stats: Stats; inbox: Disc[] }) {
  const complete = stats.approvedToday >= DAILY_TARGET;
  return (
    <>
      <div style={{ background: complete ? "#eaf6ee" : "#fdf2e0", border: `1px solid ${complete ? "#bfe6cf" : "#f0d99a"}`, color: complete ? "#268a52" : "#8a5d08", padding: "11px 15px", borderRadius: 8, fontSize: 13, marginBottom: 20 }}>
        {complete ? `✓ Today's edition is complete. ${stats.approvedToday} of ${DAILY_TARGET} approved.` : `⏰ Today's edition is not complete. ${stats.approvedToday} of ${DAILY_TARGET} approved · ${stats.needsReview} waiting in review.`}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 22 }}>
        <Stat k="Awaiting review" v={String(stats.needsReview)} c="#e0a020" />
        <Stat k="Approved today" v={`${stats.approvedToday} / ${DAILY_TARGET}`} c="#3ea76a" />
        <Stat k="Scheduled" v={String(stats.scheduled)} c="#7a5cff" />
        <Stat k="Broken links" v={String(stats.brokenLinks)} c="#d8506a" />
      </div>
      <div style={{ background: "#fff", border: "1px solid #e3e9eb", borderRadius: 8, padding: 18 }}>
        <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".5px", color: "#1d5163", marginBottom: 12 }}>Pipeline (live)</h3>
        <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
          {[["Needs Review", stats.needsReview, "#e0a020"], ["Approved today", stats.approvedToday, "#3ea76a"], ["Scheduled", stats.scheduled, "#7a5cff"]].map(([n, c, col]) => (
            <div key={n as string}><div style={{ width: 40, height: 40, borderRadius: "50%", background: col as string, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: 6 }}>{c as number}</div><div style={{ fontSize: 12, color: "#6b7d85" }}>{n as string}</div></div>
          ))}
        </div>
      </div>
    </>
  );
}
function Stat({ k, v, c }: { k: string; v: string; c: string }) {
  return <div style={{ background: "#fff", border: "1px solid #e3e9eb", borderRadius: 8, padding: 16 }}><div style={{ fontSize: 12, color: "#6b7d85", display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />{k}</div><div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{v}</div></div>;
}

function Inbox({ inbox, published, call, callJson }: { inbox: Disc[]; published: Disc[]; call: any; callJson: any }) {
  const [edit, setEdit] = useState<Disc | null>(null);
  const [view, setView] = useState<"review" | "published">("review");
  const [sel, setSel] = useState<number[]>([]);
  const list = view === "review" ? inbox : published;

  const toggle = (id: number) => setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const clearSel = () => setSel([]);
  const switchView = (v: "review" | "published") => { setView(v); clearSel(); };
  const allSel = list.length > 0 && list.every((d) => sel.includes(d.id));
  async function bulk(action: string, confirmMsg: string) {
    if (!sel.length) return;
    if (!confirm(confirmMsg.replace("{n}", String(sel.length)))) return;
    await call("/api/admin/discovery", { action, ids: sel });
    clearSel();
  }

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => switchView("review")} style={view === "review" ? subTabActive : subTab}>Needs Review ({inbox.length})</button>
        <button onClick={() => switchView("published")} style={view === "published" ? subTabActive : subTab}>Published ({published.length})</button>
      </div>

      {sel.length > 0 && (
        <div style={{ position: "sticky", top: 0, zIndex: 5, display: "flex", alignItems: "center", gap: 12, background: "#eefafb", border: "1px solid #b6e6ea", borderRadius: 9, padding: "10px 14px", marginBottom: 14 }}>
          <b style={{ fontSize: 13, color: "#176f7b" }}>{sel.length} selected</b>
          {view === "review"
            ? <>
                <button style={btnGhost} onClick={() => bulk("bulkApprove", "Publish {n} discovery(ies)?")}>Approve & publish</button>
                <button style={btnGhost} onClick={() => bulk("bulkReject", "Reject {n} discovery(ies)? They leave the review queue.")}>Reject</button>
              </>
            : <button style={btnGhost} onClick={() => bulk("bulkUnpublish", "Take {n} discovery(ies) offline? They return to the review queue.")}>Unpublish</button>}
          <button style={btnDanger} onClick={() => bulk("bulkDelete", "Permanently delete {n} discovery(ies) and their comments? This cannot be undone.")}>Delete</button>
          <button style={{ ...btnGhost, marginLeft: "auto" }} onClick={clearSel}>Clear</button>
        </div>
      )}

      <Table head={view === "review"
        ? [<input key="h" type="checkbox" checked={allSel} onChange={() => setSel(allSel ? [] : list.map((d) => d.id))} />, "Candidate", "Source", "Type", "AI", "Flag", ""]
        : [<input key="h" type="checkbox" checked={allSel} onChange={() => setSel(allSel ? [] : list.map((d) => d.id))} />, "Published item", "Source", "Type", "Comments", "", ""]}>
        {list.length === 0 ? <Empty cols={7} msg={view === "review" ? "All caught up — no items waiting for review. 🎉" : "No published discoveries yet."} /> :
          list.map((d) => (
            <tr key={d.id} style={sel.includes(d.id) ? { background: "#f3fbfc" } : undefined}>
              <Td><input type="checkbox" checked={sel.includes(d.id)} onChange={() => toggle(d.id)} /></Td>
              <Td><b>{d.title}</b></Td>
              <Td>{d.sourceName}</Td>
              <Td>{taxName(d.category)}</Td>
              {view === "review"
                ? <><Td><Score n={d.aiScore} /></Td>
                    <Td>{d.flag ? <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: d.flag === "risk" ? "#fbe9ed" : "#fdf2e0", color: d.flag === "risk" ? "#b0364f" : "#a8730a" }}>{d.flag}</span> : "—"}</Td></>
                : <><Td>💬 {d.commentCount ?? 0}</Td><Td>—</Td></>}
              {view === "review"
                ? <Td><button style={btnGhost} onClick={() => setEdit(d)}>Review</button></Td>
                : <Td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button style={btnGhost} onClick={() => setEdit(d)}>Manage</button>
                      <button style={btnGhost} onClick={() => { if (confirm(`Take "${d.title}" offline? It returns to the review queue and can be re-published later.`)) call("/api/admin/discovery", { id: d.id, action: "unpublish" }); }}>Unpublish</button>
                      <button style={btnDanger} onClick={() => { if (confirm(`Permanently delete "${d.title}"? This also deletes its comments and cannot be undone.`)) call("/api/admin/discovery", { id: d.id, action: "delete" }); }}>Delete</button>
                    </div>
                  </Td>}
            </tr>
          ))}
      </Table>
      {edit && <ReviewDrawer d={edit} mode={view} onClose={() => setEdit(null)} call={call} callJson={callJson} />}
    </>
  );
}
function ReviewDrawer({ d, mode, onClose, call, callJson }: { d: Disc; mode: "review" | "published"; onClose: () => void; call: any; callJson: any }) {
  const [title, setTitle] = useState(d.title);
  const [summary, setSummary] = useState(d.summary);
  const [why, setWhy] = useState(d.why);
  const [category, setCategory] = useState(d.category);
  const [license, setLicense] = useState(d.license ?? "");
  const [availability, setAvailability] = useState(d.availability ?? "");
  const [tags, setTags] = useState<string[]>(Array.isArray(d.relatedTags) ? d.relatedTags : []);
  const [tagInput, setTagInput] = useState("");
  const [products, setProducts] = useState<{ name: string; seller?: string; price?: string; url?: string }[]>(Array.isArray(d.relatedProducts) ? d.relatedProducts : []);
  const [pName, setPName] = useState(""); const [pSeller, setPSeller] = useState(""); const [pPrice, setPPrice] = useState(""); const [pUrl, setPUrl] = useState("");
  const [comments, setComments] = useState<any[] | null>(null);

  const fields = () => ({ title, summary, why, category, license, availability, relatedTags: tags, relatedProducts: products });

  async function saveOnly() { if (await call("/api/admin/discovery", { id: d.id, action: "update", fields: fields() })) onClose(); }
  async function approve() { await call("/api/admin/discovery", { id: d.id, action: "update", fields: fields() }); if (await call("/api/admin/discovery", { id: d.id, action: "approve" })) onClose(); }
  async function reject() { if (await call("/api/admin/discovery", { id: d.id, action: "reject" })) onClose(); }

  function addTag() { const t = tagInput.trim(); if (t && !tags.includes(t)) setTags([...tags, t]); setTagInput(""); }
  function addProduct() { if (!pName.trim()) return; setProducts([...products, { name: pName.trim(), seller: pSeller.trim() || undefined, price: pPrice.trim() || undefined, url: pUrl.trim() || undefined }]); setPName(""); setPSeller(""); setPPrice(""); setPUrl(""); }
  // simple tag-based product suggestions (placeholder pool; editor confirms before adding)
  const SUGGEST_POOL: Record<string, { name: string; seller: string; price: string }[]> = {
    AI: [{ name: "AI Dev Kit", seller: "makerlab", price: "$45" }],
    Routing: [{ name: "USB Logic Analyzer", seller: "dekuNukem", price: "$29" }],
    EDA: [{ name: "JTAG Debug Probe", seller: "tinytronics", price: "$19" }],
    LoRa: [{ name: "LoRa Module 868MHz", seller: "rfparts", price: "$12" }],
    sensor: [{ name: "BME680 Breakout", seller: "sensorshop", price: "$9" }],
  };
  const suggestions = tags.flatMap((t) => SUGGEST_POOL[t] || []).filter((s) => !products.some((p) => p.name === s.name));

  async function loadComments() {
    const r = await callJson("/api/admin/discovery", { id: d.id, action: "comments" });
    setComments(r?.comments ?? []);
  }
  async function delComment(cid: number) {
    if (!confirm("Delete this comment?")) return;
    await call("/api/admin/discovery", { id: d.id, action: "deleteComment", commentId: cid });
    setComments((prev) => (prev ? prev.filter((c) => c.id !== cid) : prev));
  }

  return (
    <Drawer onClose={onClose} title={mode === "review" ? "Review discovery" : "Manage discovery"}>
      <Field label="Title"><input value={title} onChange={(e) => setTitle(e.target.value)} style={inp} /></Field>
      <Field label="Category">
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={inp}>
          {TAXONOMY.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </Field>
      <Field label="What it is (AI summary — editable)"><textarea value={summary} onChange={(e) => setSummary(e.target.value)} style={{ ...inp, minHeight: 70, resize: "vertical" }} /></Field>
      <Field label="Why it matters for Tindie (editable)"><textarea value={why} onChange={(e) => setWhy(e.target.value)} style={{ ...inp, minHeight: 70, resize: "vertical" }} /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="License"><input value={license} onChange={(e) => setLicense(e.target.value)} style={inp} placeholder="e.g. Freemium / MIT" /></Field>
        <Field label="Availability"><input value={availability} onChange={(e) => setAvailability(e.target.value)} style={inp} placeholder="e.g. Live / Preorder" /></Field>
      </div>

      <Field label="Tags (At a glance)">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
          {tags.map((t) => <span key={t} style={{ fontSize: 11.5, background: "#eef5f6", color: "#1c6e7e", padding: "3px 9px", borderRadius: 12, display: "flex", gap: 5, alignItems: "center" }}>{t}<button onClick={() => setTags(tags.filter((x) => x !== t))} style={{ border: 0, background: "none", color: "#9aabb0", cursor: "pointer", padding: 0, fontSize: 13 }}>×</button></span>)}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} style={inp} placeholder="Add a tag, press Enter" />
          <button style={btnGhost} onClick={addTag}>Add</button>
        </div>
      </Field>

      <Field label="Related products on Tindie (manual)">
        {products.length > 0 && <div style={{ marginBottom: 8 }}>
          {products.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", border: "1px solid #ececec", borderRadius: 7, marginBottom: 6 }}>
              <div style={{ flex: 1, fontSize: 13 }}><b>{p.name}</b>{p.seller && <span style={{ color: "#8a9499" }}> · {p.seller}</span>}{p.price && <span style={{ color: "#f2762e", fontWeight: 600 }}> · {p.price}</span>}</div>
              <button style={btnDanger} onClick={() => setProducts(products.filter((_, x) => x !== i))}>Remove</button>
            </div>
          ))}
        </div>}
        {suggestions.length > 0 && <div style={{ background: "#f6fafb", border: "1px dashed #bcdde2", borderRadius: 7, padding: "8px 10px", marginBottom: 8 }}>
          <div style={{ fontSize: 11.5, color: "#1c6e7e", marginBottom: 5 }}>Suggested by tags (click to add):</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {suggestions.map((s, i) => <button key={i} style={{ ...btnGhost, fontSize: 11.5 }} onClick={() => setProducts([...products, s])}>+ {s.name} ({s.price})</button>)}
          </div>
        </div>}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr", gap: 6, marginBottom: 6 }}>
          <input value={pName} onChange={(e) => setPName(e.target.value)} style={inp} placeholder="Product name" />
          <input value={pSeller} onChange={(e) => setPSeller(e.target.value)} style={inp} placeholder="Seller" />
          <input value={pPrice} onChange={(e) => setPPrice(e.target.value)} style={inp} placeholder="$ price" />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={pUrl} onChange={(e) => setPUrl(e.target.value)} style={inp} placeholder="Tindie product URL (optional)" />
          <button style={btnGhost} onClick={addProduct}>Add product</button>
        </div>
      </Field>

      {/* Comments management */}
      <Field label="Community discussion">
        {comments === null
          ? <button style={btnGhost} onClick={loadComments}>Load comments ({d.commentCount ?? 0})</button>
          : comments.length === 0
            ? <div style={{ fontSize: 13, color: "#8a9499" }}>No comments.</div>
            : <div>{comments.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: 8, padding: "8px 10px", border: "1px solid #ececec", borderRadius: 7, marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#6b7d85" }}><b>{c.authorName}</b>{c.tag && <span style={{ marginLeft: 6, fontSize: 10.5, background: "#eef5f6", color: "#1c6e7e", padding: "1px 6px", borderRadius: 10 }}>{c.tag}</span>}</div>
                    <div style={{ fontSize: 13, color: "#2f3438", marginTop: 2 }}>{c.body}</div>
                  </div>
                  <button style={btnDanger} onClick={() => delComment(c.id)}>Delete</button>
                </div>
              ))}</div>}
      </Field>

      {mode === "review" && <div style={{ fontSize: 12, color: "#6b7d85", background: "#f3faf6", border: "1px solid #bfe6cf", borderRadius: 6, padding: "8px 11px", margin: "4px 0 8px" }}>✓ Summary originality check · ✓ no duplicate · {d.flag === "sponsored" ? "⚠ Sponsored — cannot also be an Editor's Pick" : "✓ no restricted category"}</div>}

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {mode === "review" ? <>
          <button style={{ ...btnGhost, flex: 1, borderColor: "#d8506a", color: "#d8506a" }} onClick={reject}>Reject</button>
          <button style={{ ...btnPrimary, flex: 1, background: "#3ea76a" }} onClick={approve}>Approve &amp; publish</button>
        </> : <>
          <button style={{ ...btnGhost, flex: 1 }} onClick={onClose}>Close</button>
          <button style={{ ...btnPrimary, flex: 1 }} onClick={saveOnly}>Save changes</button>
        </>}
      </div>
    </Drawer>
  );
}

function Directory({ resources, call }: { resources: Res[]; call: any }) {
  const [edit, setEdit] = useState<Res | null>(null);
  const [creating, setCreating] = useState(false);
  const [sel, setSel] = useState<number[]>([]);

  const toggle = (id: number) => setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const clearSel = () => setSel([]);
  async function bulk(action: string, confirmMsg: string) {
    if (!sel.length) return;
    if (!confirm(confirmMsg.replace("{n}", String(sel.length)))) return;
    await call("/api/admin/resource", { action, ids: sel });
    clearSel();
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: "#8a9499" }}>{resources.length} resources · grouped by category · use ▲▼ to set the order shown on the site</span>
        <button style={btnPrimary} onClick={() => setCreating(true)}>+ Add resource</button>
      </div>

      {sel.length > 0 && (
        <div style={{ position: "sticky", top: 0, zIndex: 5, display: "flex", alignItems: "center", gap: 12, background: "#eefafb", border: "1px solid #b6e6ea", borderRadius: 9, padding: "10px 14px", marginBottom: 14 }}>
          <b style={{ fontSize: 13, color: "#176f7b" }}>{sel.length} selected</b>
          <button style={btnGhost} onClick={() => bulk("bulkHide", "Hide {n} resource(s) from the public site? They stay in the database and can be unhidden later.")}>Hide</button>
          <button style={btnGhost} onClick={() => bulk("bulkUnhide", "Make {n} resource(s) visible on the public site again?")}>Unhide</button>
          <button style={btnDanger} onClick={() => bulk("bulkDelete", "Permanently delete {n} resource(s)? This cannot be undone.")}>Delete</button>
          <button style={{ ...btnGhost, marginLeft: "auto" }} onClick={clearSel}>Clear</button>
        </div>
      )}

      {TAXONOMY.map((t: any) => {
        const group = resources.filter((r) => r.category === t.id);
        if (group.length === 0) return null;
        const allSel = group.every((r) => sel.includes(r.id));
        return (
          <div key={t.id} style={{ marginBottom: 26 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#2f3438", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", background: t.col }}>{t.ic}</span>
              {t.name} <span style={{ fontSize: 12, fontWeight: 400, color: "#8a9499" }}>({group.length})</span>
            </h3>
            <Table head={[<input key="h" type="checkbox" checked={allSel} onChange={() => setSel((s) => allSel ? s.filter((x) => !group.some((r) => r.id === x)) : Array.from(new Set([...s, ...group.map((r) => r.id)])))} />, "#", "Resource", "Status", "Link", "Order", ""]}>
              {group.map((r, i) => (
                <tr key={r.id} style={sel.includes(r.id) ? { background: "#f3fbfc" } : undefined}>
                  <Td><input type="checkbox" checked={sel.includes(r.id)} onChange={() => toggle(r.id)} /></Td>
                  <Td>{i + 1}</Td>
                  <Td><b>{r.name}</b></Td>
                  <Td>{r.status === "hidden" ? <span style={{ color: "#a8730a" }}>Hidden</span> : "Active"}</Td>
                  <Td>{r.linkOk ? <span style={{ color: "#3ea76a" }}>● OK</span> : <span style={{ color: "#d8506a" }}>● Re-verify</span>}</Td>
                  <Td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button style={{ ...btnGhost, padding: "5px 9px", opacity: i === 0 ? 0.35 : 1 }} disabled={i === 0} onClick={() => call("/api/admin/resource", { id: r.id, action: "move", dir: "up" })}>▲</button>
                      <button style={{ ...btnGhost, padding: "5px 9px", opacity: i === group.length - 1 ? 0.35 : 1 }} disabled={i === group.length - 1} onClick={() => call("/api/admin/resource", { id: r.id, action: "move", dir: "down" })}>▼</button>
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      {r.linkOk ? <button style={btnGhost} onClick={() => setEdit(r)}>Edit</button> : <button style={btnPrimary} onClick={() => setEdit(r)}>Fix link</button>}
                      <button style={btnDanger} onClick={() => { if (confirm(`Delete resource "${r.name}"? This cannot be undone.`)) call("/api/admin/resource", { id: r.id, action: "delete" }); }}>Delete</button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          </div>
        );
      })}
      {edit && <ResourceDrawer r={edit} onClose={() => setEdit(null)} call={call} />}
      {creating && <ResourceDrawer r={null} onClose={() => setCreating(false)} call={call} />}
    </>
  );
}
function ResourceDrawer({ r, onClose, call }: { r: Res | null; onClose: () => void; call: any }) {
  const isNew = !r;
  const [name, setName] = useState(r?.name ?? "");
  const [url, setUrl] = useState(r?.url ?? "https://");
  const [category, setCategory] = useState(r?.category ?? "open-source");
  const [description, setDescription] = useState(r?.description ?? "");
  const [capLabel, setCapLabel] = useState(r?.capLabel ?? "Resource");
  const [logo, setLogo] = useState(r?.logo ?? "");
  const [isPick, setIsPick] = useState(!!r?.isPick);
  const [isPartner, setIsPartner] = useState(!!r?.isPartner);
  const [isFeatured, setIsFeatured] = useState(!!r?.isFeatured);

  async function save() {
    const fields = { name, url, category, description, capLabel, logo: logo || null, isPick, isPartner, isFeatured };
    const ok = isNew
      ? await call("/api/admin/resource", { action: "create", fields })
      : await call("/api/admin/resource", { id: r!.id, action: "update", fields });
    if (ok) onClose();
  }
  async function verify() { if (r && await call("/api/admin/resource", { id: r.id, action: "verify", url })) onClose(); }

  return (
    <Drawer onClose={onClose} title={isNew ? "Add resource" : "Edit resource"}>
      {!isNew && !r!.linkOk && <div style={{ background: "#fbeef1", border: "1px solid #f0bfca", color: "#b0364f", padding: "11px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>⚠ This link failed its last check. Update the URL and verify to restore it.</div>}
      <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} style={inp} placeholder="e.g. KiCad" /></Field>
      <Field label="Website URL"><input value={url} onChange={(e) => setUrl(e.target.value)} style={inp} placeholder="https://..." /></Field>
      <Field label="Category">
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={inp}>
          {TAXONOMY.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </Field>
      <Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inp, minHeight: 70, resize: "vertical" }} placeholder="One-line summary shown on the card" /></Field>
      <Field label="Capability label (small tag, e.g. Marketplace / Learning / Design Tools)"><input value={capLabel} onChange={(e) => setCapLabel(e.target.value)} style={inp} /></Field>
      <Field label="Logo path (optional, e.g. /logos/kicad.png — leave blank for colored initials)"><input value={logo} onChange={(e) => setLogo(e.target.value)} style={inp} placeholder="/logos/name.png" /></Field>
      <div style={{ display: "flex", gap: 18, margin: "4px 0 8px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#4a4f54", cursor: "pointer" }}>
          <input type="checkbox" checked={isPick} onChange={(e) => setIsPick(e.target.checked)} /> Editor&apos;s Pick
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#4a4f54", cursor: "pointer" }}>
          <input type="checkbox" checked={isPartner} onChange={(e) => setIsPartner(e.target.checked)} /> Partner
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#4a4f54", cursor: "pointer" }}>
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Featured this week
        </label>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button style={{ ...btnGhost, flex: 1 }} onClick={onClose}>Cancel</button>
        {!isNew && !r!.linkOk && <button style={{ ...btnPrimary, flex: 1, background: "#3ea76a" }} onClick={verify}>Verify &amp; restore</button>}
        <button style={{ ...btnPrimary, flex: 1 }} onClick={save}>{isNew ? "Create" : "Save"}</button>
      </div>
    </Drawer>
  );
}

function Sources({ sources, call }: { sources: Src[]; call: any }) {
  const [creating, setCreating] = useState(false);
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: "#8a9499" }}>{sources.length} sources</span>
        <button style={btnPrimary} onClick={() => setCreating(true)}>+ Add source</button>
      </div>
      <Table head={["Source", "Method", "Trust", "Cap", "Status", ""]}>
        {sources.map((s) => (
          <tr key={s.id}>
            <Td><b>{s.name}</b></Td><Td>{s.method}</Td>
            <Td style={{ color: s.trust === "High" ? "#3ea76a" : s.trust === "Low" ? "#d8506a" : "#e0a020", fontWeight: 600 }}>{s.trust}</Td>
            <Td>{s.dailyCap}/day</Td>
            <Td>{s.status === "active" ? <span style={{ color: "#3ea76a" }}>Active</span> : <span style={{ color: "#b0364f" }}>Paused</span>}</Td>
            <Td>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                {s.status === "active"
                  ? <button style={btnGhost} onClick={() => call("/api/admin/source", { id: s.id, action: "toggle" })}>Pause</button>
                  : <button style={btnPrimary} onClick={() => call("/api/admin/source", { id: s.id, action: "toggle" })}>Resume</button>}
                <button style={btnDanger} onClick={() => { if (confirm(`Delete source "${s.name}"? This cannot be undone.`)) call("/api/admin/source", { id: s.id, action: "delete" }); }}>Delete</button>
              </div>
            </Td>
          </tr>
        ))}
      </Table>
      {creating && <SourceDrawer onClose={() => setCreating(false)} call={call} />}
    </>
  );
}
function SourceDrawer({ onClose, call }: { onClose: () => void; call: any }) {
  const [name, setName] = useState("");
  const [method, setMethod] = useState("RSS");
  const [url, setUrl] = useState("https://");
  const [trust, setTrust] = useState("Medium");
  const [dailyCap, setDailyCap] = useState(2);
  async function save() {
    if (!name.trim()) { alert("Please enter a source name."); return; }
    if (await call("/api/admin/source", { action: "create", fields: { name, method, url, trust, dailyCap: Number(dailyCap) } })) onClose();
  }
  return (
    <Drawer onClose={onClose} title="Add source">
      <Field label="Source name"><input value={name} onChange={(e) => setName(e.target.value)} style={inp} placeholder="e.g. Hackster.io" /></Field>
      <Field label="Method">
        <select value={method} onChange={(e) => setMethod(e.target.value)} style={inp}>
          <option>RSS</option><option>API</option><option>Crawl</option>
        </select>
      </Field>
      <Field label="URL (feed or API endpoint)"><input value={url} onChange={(e) => setUrl(e.target.value)} style={inp} placeholder="https://..." /></Field>
      <Field label="Trust level">
        <select value={trust} onChange={(e) => setTrust(e.target.value)} style={inp}>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
      </Field>
      <Field label="Daily cap (max items/day)"><input type="number" value={dailyCap} onChange={(e) => setDailyCap(Number(e.target.value))} style={inp} min={1} /></Field>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button style={{ ...btnGhost, flex: 1 }} onClick={onClose}>Cancel</button>
        <button style={{ ...btnPrimary, flex: 1 }} onClick={save}>Create</button>
      </div>
    </Drawer>
  );
}

function Moderation({ submissions, call }: { submissions: Sub[]; call: any }) {
  return (
    <Table head={["Submission", "By", "Category", "Check", ""]}>
      {submissions.length === 0 ? <Empty cols={5} msg="No submissions pending review. 🎉" /> :
        submissions.map((s) => (
          <tr key={s.id}>
            <Td><b>{s.name}</b></Td><Td>{s.submittedBy}</Td><Td>{taxName(s.category || "")}</Td>
            <Td>{s.autoCheck === "ok" ? <span style={{ color: "#3ea76a" }}>Link OK</span> : <span style={{ color: "#a8730a" }}>Low-trust · check</span>}</Td>
            <Td><button style={{ ...btnGhost, marginRight: 6 }} onClick={() => call("/api/admin/submission", { id: s.id, action: "reject" })}>Reject</button><button style={btnPrimary} onClick={() => call("/api/admin/submission", { id: s.id, action: "approve" })}>Approve</button></Td>
          </tr>
        ))}
    </Table>
  );
}

/* primitives */
function Table({ head, children }: { head: React.ReactNode[]; children: React.ReactNode }) {
  return <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", border: "1px solid #e3e9eb", borderRadius: 8, overflow: "hidden" }}>
    <thead><tr>{head.map((h, i) => <th key={i} style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", color: "#6b7d85", padding: "11px 14px", borderBottom: "1px solid #e3e9eb", background: "#f8fafa", fontWeight: 600 }}>{h}</th>)}</tr></thead>
    <tbody>{children}</tbody></table>;
}
const Td = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => <td style={{ padding: "12px 14px", borderBottom: "1px solid #e3e9eb", fontSize: 13, ...style }}>{children}</td>;
const Empty = ({ cols, msg }: { cols: number; msg: string }) => <tr><td colSpan={cols} style={{ textAlign: "center", color: "#6b7d85", padding: 24 }}>{msg}</td></tr>;
const Score = ({ n }: { n: number }) => <span style={{ fontWeight: 700, fontSize: 13, padding: "3px 8px", borderRadius: 5, background: n >= 80 ? "#e7f5ee" : n >= 65 ? "#fdf8ec" : "#fbe9ed", color: n >= 80 ? "#268a52" : n >= 65 ? "#a8730a" : "#b0364f" }}>{n}</span>;
function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <>
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,52,63,.45)", zIndex: 20 }} />
    <div style={{ position: "fixed", top: 0, right: 0, width: 480, maxWidth: "100vw", height: "100vh", background: "#fff", zIndex: 21, overflowY: "auto" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e3e9eb", display: "flex", alignItems: "center" }}><h2 style={{ fontSize: 16, flex: 1 }}>{title}</h2><button onClick={onClose} style={{ background: "none", border: 0, fontSize: 22, color: "#6b7d85", cursor: "pointer" }}>×</button></div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  </>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 14 }}><label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".4px", color: "#6b7d85", fontWeight: 600, display: "block", marginBottom: 6 }}>{label}</label>{children}</div>;
}
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #e3e9eb", borderRadius: 6, fontSize: 13.5, outline: "none", fontFamily: "inherit" };
const btnGhost: React.CSSProperties = { background: "#fff", border: "1px solid #e3e9eb", color: "#1d5163", borderRadius: 6, padding: "6px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit" };
const btnPrimary: React.CSSProperties = { background: "#22b8c4", color: "#fff", border: 0, borderRadius: 6, padding: "7px 13px", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit" };
const btnDanger: React.CSSProperties = { background: "#fff", border: "1px solid #f0bfca", color: "#c2415f", borderRadius: 6, padding: "6px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit" };
const subTab: React.CSSProperties = { background: "#fff", border: "1px solid #e0e6e7", color: "#4a4f54", borderRadius: 8, padding: "8px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" };
const subTabActive: React.CSSProperties = { ...subTab, background: "#0f343f", color: "#fff", borderColor: "#0f343f" };

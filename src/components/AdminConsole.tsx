"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DAILY_TARGET, taxName, TAXONOMY } from "@/lib/taxonomy";

type Disc = any; type Res = any; type Src = any; type Sub = any;
type Stats = { needsReview: number; scheduled: number; approvedToday: number; brokenLinks: number };

export function AdminConsole({ inbox, resources, sources, submissions, stats }:
  { inbox: Disc[]; resources: Res[]; sources: Src[]; submissions: Sub[]; stats: Stats }) {
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
          {tab === "inbox" && <Inbox inbox={inbox} call={call} />}
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

function Inbox({ inbox, call }: { inbox: Disc[]; call: any }) {
  const [edit, setEdit] = useState<Disc | null>(null);
  return (
    <>
      <Table head={["Candidate", "Source", "Type", "AI", "Flag", ""]}>
        {inbox.length === 0 ? <Empty cols={6} msg="All caught up — no items waiting for review. 🎉" /> :
          inbox.map((d) => (
            <tr key={d.id}>
              <Td><b>{d.title}</b></Td>
              <Td>{d.sourceName}</Td>
              <Td>{taxName(d.category)}</Td>
              <Td><Score n={d.aiScore} /></Td>
              <Td>{d.flag ? <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: d.flag === "risk" ? "#fbe9ed" : "#fdf2e0", color: d.flag === "risk" ? "#b0364f" : "#a8730a" }}>{d.flag}</span> : "—"}</Td>
              <Td><button style={btnGhost} onClick={() => setEdit(d)}>Review</button></Td>
            </tr>
          ))}
      </Table>
      {edit && <ReviewDrawer d={edit} onClose={() => setEdit(null)} call={call} />}
    </>
  );
}
function ReviewDrawer({ d, onClose, call }: { d: Disc; onClose: () => void; call: any }) {
  const [title, setTitle] = useState(d.title);
  const [summary, setSummary] = useState(d.summary);
  const [why, setWhy] = useState(d.why);
  async function approve() { await call("/api/admin/discovery", { id: d.id, action: "update", fields: { title, summary, why } }); if (await call("/api/admin/discovery", { id: d.id, action: "approve" })) onClose(); }
  async function reject() { if (await call("/api/admin/discovery", { id: d.id, action: "reject" })) onClose(); }
  return (
    <Drawer onClose={onClose} title="Review discovery">
      <Field label="Title"><input value={title} onChange={(e) => setTitle(e.target.value)} style={inp} /></Field>
      <Field label="What it is (AI summary — editable)"><textarea value={summary} onChange={(e) => setSummary(e.target.value)} style={{ ...inp, minHeight: 70 }} /></Field>
      <Field label="Why it matters (editable)"><textarea value={why} onChange={(e) => setWhy(e.target.value)} style={{ ...inp, minHeight: 70 }} /></Field>
      <div style={{ fontSize: 12, color: "#6b7d85", background: "#f3faf6", border: "1px solid #bfe6cf", borderRadius: 6, padding: "8px 11px", marginBottom: 8 }}>✓ Summary originality check · ✓ no duplicate · {d.flag === "sponsored" ? "⚠ Sponsored — cannot also be an Editor's Pick" : "✓ no restricted category"}</div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button style={{ ...btnGhost, flex: 1, borderColor: "#d8506a", color: "#d8506a" }} onClick={reject}>Reject</button>
        <button style={{ ...btnPrimary, flex: 1, background: "#3ea76a" }} onClick={approve}>Approve &amp; publish</button>
      </div>
    </Drawer>
  );
}

function Directory({ resources, call }: { resources: Res[]; call: any }) {
  const [edit, setEdit] = useState<Res | null>(null);
  const [creating, setCreating] = useState(false);
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: "#8a9499" }}>{resources.length} resources</span>
        <button style={btnPrimary} onClick={() => setCreating(true)}>+ Add resource</button>
      </div>
      <Table head={["Resource", "Category", "Status", "Link", ""]}>
        {resources.map((r) => (
          <tr key={r.id}>
            <Td><b>{r.name}</b></Td>
            <Td>{taxName(r.category)}</Td>
            <Td>{r.status === "hidden" ? <span style={{ color: "#a8730a" }}>Hidden</span> : "Active"}</Td>
            <Td>{r.linkOk ? <span style={{ color: "#3ea76a" }}>● OK</span> : <span style={{ color: "#d8506a" }}>● Re-verify</span>}</Td>
            <Td>{r.linkOk ? <button style={btnGhost} onClick={() => setEdit(r)}>Edit</button> : <button style={btnPrimary} onClick={() => setEdit(r)}>Fix link</button>}</Td>
          </tr>
        ))}
      </Table>
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

  async function save() {
    const fields = { name, url, category, description, capLabel, logo: logo || null, isPick, isPartner };
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
  return (
    <Table head={["Source", "Method", "Trust", "Cap", "Status", ""]}>
      {sources.map((s) => (
        <tr key={s.id}>
          <Td><b>{s.name}</b></Td><Td>{s.method}</Td>
          <Td style={{ color: s.trust === "High" ? "#3ea76a" : s.trust === "Low" ? "#d8506a" : "#e0a020", fontWeight: 600 }}>{s.trust}</Td>
          <Td>{s.dailyCap}/day</Td>
          <Td>{s.status === "active" ? <span style={{ color: "#3ea76a" }}>Active</span> : <span style={{ color: "#b0364f" }}>Paused</span>}</Td>
          <Td>{s.status === "active" ? <button style={btnGhost} onClick={() => call("/api/admin/source", { id: s.id })}>Pause</button> : <button style={btnPrimary} onClick={() => call("/api/admin/source", { id: s.id })}>Resume</button>}</Td>
        </tr>
      ))}
    </Table>
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
function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", border: "1px solid #e3e9eb", borderRadius: 8, overflow: "hidden" }}>
    <thead><tr>{head.map((h) => <th key={h} style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", color: "#6b7d85", padding: "11px 14px", borderBottom: "1px solid #e3e9eb", background: "#f8fafa", fontWeight: 600 }}>{h}</th>)}</tr></thead>
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

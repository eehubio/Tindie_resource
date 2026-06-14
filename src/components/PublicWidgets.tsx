"use client";
import { useState } from "react";
import { TAXONOMY } from "@/lib/taxonomy";

export function SubscribeBox() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  async function go() {
    if (!/.+@.+\..+/.test(email)) { alert("Enter a valid email"); return; }
    const res = await fetch("/api/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    if (res.ok) setDone(true);
  }
  return (
    <div style={{ background: "linear-gradient(135deg,#1c6e7e,#155561)", borderRadius: 12, padding: 17, marginBottom: 16 }}>
      <h3 style={{ fontSize: 14.5, fontWeight: 600, color: "#fff", marginBottom: 13 }}>Weekly digest</h3>
      {done ? <div style={{ color: "#d4eef0", fontSize: 13, textAlign: "center", padding: "10px 0" }}>✓ You&apos;re in. Check your inbox to confirm.</div> : (
        <>
          <p style={{ fontSize: 12.5, color: "#d4eef0", marginBottom: 11 }}>The 12 best finds, once a week. No spam.</p>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: "100%", padding: "10px 12px", border: 0, borderRadius: 7, marginBottom: 8, fontSize: 13 }} />
          <button onClick={go} style={{ width: "100%", background: "#22b8c4", color: "#fff", border: 0, padding: 10, borderRadius: 7, fontWeight: 600, cursor: "pointer", fontSize: 13.5 }}>Subscribe</button>
        </>
      )}
    </div>
  );
}

export function SubmitButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(""); const [url, setUrl] = useState(""); const [cat, setCat] = useState(TAXONOMY[0].name); const [why, setWhy] = useState("");
  const [sent, setSent] = useState(false);
  async function submit() {
    if (!name.trim()) { alert("Add a resource name"); return; }
    const res = await fetch("/api/submit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, url, category: cat, why }) });
    if (res.ok) { setSent(true); setName(""); setUrl(""); setWhy(""); }
  }
  return (
    <>
      <div onClick={() => setOpen(true)} style={{ textAlign: "center", background: "#eef7f8", color: "#1c6e7e", padding: 11, borderRadius: 8, fontWeight: 600, fontSize: 13, border: "1px dashed #22b8c4", cursor: "pointer" }}>+ Suggest a resource</div>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 30 }} />
          <div style={{ position: "fixed", top: 0, right: 0, width: 460, maxWidth: "100vw", height: "100vh", background: "#fff", zIndex: 31, overflowY: "auto" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #ececec", display: "flex", alignItems: "center" }}>
              <h2 style={{ fontSize: 16, flex: 1, color: "#2f3438" }}>Suggest a resource</h2>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: 0, fontSize: 24, color: "#8a9499", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              {sent ? <p style={{ fontSize: 14, color: "#2f9d62" }}>✓ Submitted — our team will review it. Thanks!</p> : (
                <>
                  <p style={{ fontSize: 13.5, color: "#8a9499", marginBottom: 16 }}>Submissions are reviewed by our team before appearing in the directory.</p>
                  <Field label="Resource name"><input value={name} onChange={(e) => setName(e.target.value)} style={inp} /></Field>
                  <Field label="Website URL"><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" style={inp} /></Field>
                  <Field label="Category"><select value={cat} onChange={(e) => setCat(e.target.value)} style={inp}>{TAXONOMY.map((t) => <option key={t.id}>{t.name}</option>)}</select></Field>
                  <Field label="Why it belongs here"><textarea value={why} onChange={(e) => setWhy(e.target.value)} style={{ ...inp, minHeight: 70, resize: "vertical" }} /></Field>
                  <button onClick={submit} style={{ width: "100%", background: "#22b8c4", color: "#fff", border: 0, borderRadius: 8, padding: "11px 16px", fontWeight: 600, cursor: "pointer" }}>Submit for review</button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 13 }}><label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".4px", color: "#8a9499", fontWeight: 600, display: "block", marginBottom: 5 }}>{label}</label>{children}</div>;
}
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #ececec", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" };

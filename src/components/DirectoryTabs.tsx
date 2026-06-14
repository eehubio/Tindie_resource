"use client";
import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { TAXONOMY } from "@/lib/taxonomy";

const lbl = (bg: string, fg: string): React.CSSProperties => ({ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: bg, color: fg });

function Card({ r }: { r: any }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 11, padding: 15, display: "flex", flexDirection: "column", gap: 11 }}>
      <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
        <BrandLogo name={r.name} src={r.logo} size={40} />
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: 14, color: "#2f3438", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>{r.name}
            {r.isPick && <span style={lbl("#fff0e0", "#c25a14")}>★ Pick</span>}
            {r.isPartner && <span style={lbl("#e7f5ee", "#268a52")}>Partner</span>}
          </h4>
          <div style={{ fontSize: 12.5, color: "#8a9499", marginTop: 2 }}>{r.description}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 11, color: "#1aa0ab" }}>{r.url.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10.5, background: "#f0f5f6", color: "#1c6e7e", padding: "3px 8px", borderRadius: 5 }}>{r.capLabel}</span>
          <a href={r.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "#22b8c4", border: "1px solid #22b8c4", borderRadius: 6, padding: "5px 14px" }}>Visit</a>
        </div>
      </div>
    </div>
  );
}

export function DirectoryTabs({ resources, perTab = 6 }: { resources: any[]; perTab?: number }) {
  const [cat, setCat] = useState<string>("all");
  const tabs = [{ id: "all", name: "All" }, ...TAXONOMY.map((t) => ({ id: t.id, name: t.name }))];
  const filtered = cat === "all" ? resources : resources.filter((r) => r.category === cat);
  const shown = filtered.slice(0, perTab);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {tabs.map((t) => {
          const active = cat === t.id;
          const count = t.id === "all" ? resources.length : resources.filter((r) => r.category === t.id).length;
          return (
            <button key={t.id} onClick={() => setCat(t.id)}
              style={{
                fontSize: 12.5, fontWeight: 600, padding: "7px 13px", borderRadius: 8, cursor: "pointer",
                border: active ? "1px solid #1c6e7e" : "1px solid #e0e6e7",
                background: active ? "#1c6e7e" : "#fff",
                color: active ? "#fff" : "#4a4f54", fontFamily: "inherit",
              }}>
              {t.name} <span style={{ opacity: 0.7, fontWeight: 400 }}>{count}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 15 }}>
        {shown.map((r) => <Card key={r.id} r={r} />)}
      </div>
      {filtered.length === 0 && <p style={{ color: "#8a9499", fontSize: 14, textAlign: "center", padding: "30px 0" }}>No resources in this category yet.</p>}
    </div>
  );
}

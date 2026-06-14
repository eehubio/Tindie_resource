import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

/* ---- Three big featured cards (EEHub / Seeed Fusion / Sell on Tindie) ---- */
export function FeaturedCards() {
  const cards = [
    { tag: "Featured", name: "EEHub.io", logoText: "EEHub.io", desc: "Organize electronics projects, BOMs, schematics, and documentation in one collaborative workspace.", cta: "Explore", href: "https://eehub.io", urlLabel: "eehub.io", accent: "#22b8c4" },
    { tag: "Featured", name: "Seeed Studio Fusion", logoText: "Seeed Fusion", desc: "PCB fabrication, assembly, and small-batch manufacturing for makers and startups.", cta: "Get Quote", href: "https://www.seeedstudio.com/fusion.html", urlLabel: "fusion.seeedstudio.com", accent: "#0aa14b" },
    { tag: null, name: "Sell on Tindie", logoText: "Sell on Tindie", desc: "Launch your hardware products to a global community of makers, builders, and innovators.", cta: "Start Selling", href: "https://www.tindie.com/about/sell/", urlLabel: "tindie.com/about/sell", accent: "#f2762e", mascot: true },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
      {cards.map((c) => (
        <div key={c.name} style={{ position: "relative", background: "#fff", border: "1px solid #ececec", borderRadius: 12, padding: "22px 20px", display: "flex", flexDirection: "column" }}>
          {c.tag && <span style={{ position: "absolute", top: 0, left: 18, transform: "translateY(-50%)", background: "#22b8c4", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", padding: "3px 9px", borderRadius: 4 }}>{c.tag}</span>}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, minHeight: 40 }}>
            <BrandLogo name={c.logoText} size={34} />
            <span style={{ fontSize: 19, fontWeight: 700, color: c.accent }}>{c.name}</span>
          </div>
          <p style={{ fontSize: 13.5, color: "#6a7176", lineHeight: 1.5, flex: 1, marginBottom: 16 }}>{c.desc}</p>
          <a href={c.href} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", border: `1px solid ${c.accent}`, color: c.accent, borderRadius: 7, padding: "10px", fontWeight: 600, fontSize: 14, marginBottom: 10 }}>{c.cta}</a>
          <a href={c.href} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#1aa0ab" }}>{c.urlLabel} ↗</a>
        </div>
      ))}
    </div>
  );
}

/* ---- Right-column "Browse & Filter" navigation card ---- */
export function BrowseFilterCard() {
  const items: [string, string, string][] = [
    ["👤", "For Sellers", "/directory?aud=seller"],
    ["🛒", "For Buyers", "/directory?aud=buyer"],
    ["</>", "Open Source", "/directory?cat=open-source"],
    ["🏭", "Manufacturing", "/directory?cat=manufacturing"],
    ["👥", "Crowdfunding", "/directory?cat=crowdfunding"],
    ["⚙", "AI Tools", "/directory?cat=tools"],
  ];
  return (
    <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 12, padding: "16px 8px 8px" }}>
      <h3 style={{ fontSize: 14.5, fontWeight: 600, color: "#2f3438", margin: "0 12px 8px" }}>Browse &amp; Filter</h3>
      {items.map(([ic, label, href]) => (
        <Link key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 8, fontSize: 13.5, color: "#4a4f54" }}>
          <span style={{ width: 22, textAlign: "center", color: "#22b8c4" }}>{ic}</span>
          <span style={{ flex: 1 }}>{label}</span>
          <span style={{ color: "#c2c8cb" }}>›</span>
        </Link>
      ))}
    </div>
  );
}

/* ---- "Featured this week" sidebar list ---- */
export function FeaturedThisWeek() {
  const items = [
    { name: "Seeed Studio XIAO ESP32C6", tag: "New Board", tagBg: "#e4f3f5", tagFg: "#1c8290" },
    { name: "PCBWay 5-Layer PCB Promo", tag: "Manufacturing", tagBg: "#fff0e0", tagFg: "#c25a14" },
    { name: "KiCad 8.0 Released", tag: "Design Tools", tagBg: "#eef0ff", tagFg: "#4a6fd4" },
    { name: "Hackaday Prize 2024 Submissions Open", tag: "Open Source", tagBg: "#e7f5ee", tagFg: "#268a52" },
    { name: "ReekyU Quadruped Robot", tag: "Crowdfunding", tagBg: "#fbe9ef", tagFg: "#c2415f" },
  ];
  return (
    <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 12, padding: 17, marginBottom: 16 }}>
      <h3 style={{ fontSize: 14.5, fontWeight: 600, color: "#2f3438", marginBottom: 13 }}>Featured this week</h3>
      {items.map((it) => (
        <div key={it.name} style={{ display: "flex", gap: 11, padding: "9px 0", borderBottom: "1px solid #f0f2f2", alignItems: "center" }}>
          <BrandLogo name={it.name} size={42} radius={8} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#2f3438", lineHeight: 1.25 }}>{it.name}</div>
            <span style={{ display: "inline-block", marginTop: 4, fontSize: 10.5, padding: "2px 7px", borderRadius: 4, background: it.tagBg, color: it.tagFg }}>{it.tag}</span>
          </div>
        </div>
      ))}
      <Link href="/archive" style={{ display: "block", textAlign: "center", marginTop: 12, fontSize: 13, fontWeight: 600, color: "#1aa0ab" }}>View all featured →</Link>
    </div>
  );
}

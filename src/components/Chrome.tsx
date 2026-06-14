import Link from "next/link";

export function TindieHeader() {
  return (
    <>
      <header style={{ background: "#fff", borderBottom: "1px solid #ececec" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", gap: 22, padding: "13px 24px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 25, color: "#5b6066" }}>
            <svg width={42} height={34} viewBox="0 0 48 40"><g fill="none" stroke="#3a3f44" strokeWidth={2.4}><path d="M10 14c-3-2-6-7-5-10 3-1 7 2 9 5"/><path d="M30 13c2-3 6-7 9-6 1 3-2 7-5 9"/><ellipse cx="20" cy="22" rx="13" ry="12"/><circle cx="15" cy="20" r="2.2" fill="#3a3f44"/><circle cx="25" cy="20" r="2.2" fill="#3a3f44"/><path d="M20 24v3M16 28h8" strokeLinecap="round"/></g></svg>
            tindie
          </Link>
          <div style={{ flex: 1, display: "flex", maxWidth: 600, border: "1px solid #d4d8da", borderRadius: 5, overflow: "hidden" }}>
            <input placeholder="Search products" style={{ flex: 1, border: 0, padding: "11px 15px", fontSize: 14.5, outline: "none" }} />
            <button style={{ border: 0, background: "#22b8c4", color: "#fff", padding: "0 26px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Search</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14.5, color: "#5b6066", whiteSpace: "nowrap" }}>
            <a style={{ color: "#1aa0ab", fontWeight: 500 }}>Sell on Tindie</a>
            <Link href="/" style={{ color: "#22b8c4", fontWeight: 600 }}>Resources</Link>
            <Link href="/login">Log In</Link>
            <a style={{ border: "1px solid #d4d8da", borderRadius: 5, padding: "8px 16px" }}>Register</a>
            <a style={{ position: "relative" }}>🛒 Cart</a>
          </div>
        </div>
      </header>
      <nav style={{ background: "#fff", borderBottom: "1px solid #ececec", position: "sticky", top: 0, zIndex: 10 }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", gap: 26, padding: "13px 24px", overflowX: "auto", fontSize: 14.5, color: "#4a4f54" }}>
          {["All Products ▾","DIY Electronics ▾","3D Printing & CNC ▾","Camera Equipment","IoT & Smart Home ▾","Robots & Drones ▾","Sound ▾","Supplies ▾"].map((c) => (
            <a key={c} style={{ whiteSpace: "nowrap", cursor: "pointer" }}>{c}</a>
          ))}
          <a style={{ whiteSpace: "nowrap" }}>Flea Market <sup style={{ background: "#22b8c4", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3 }}>Beta</sup></a>
        </div>
      </nav>
    </>
  );
}

export function TindieFooter() {
  const cols: [string, string[]][] = [
    ["Company", ["About Tindie", "Tindie Blog", "Our Terms"]],
    ["Discover", ["Newest Products", "Popular Products", "On Sale", "Submit a Resource"]],
    ["Buying & Selling", ["Buy on Tindie", "Sell on Tindie", "Tindie Guarantee"]],
    ["Help", ["Community Forums"]],
  ];
  return (
    <footer style={{ background: "#f7f8f8", borderTop: "1px solid #ececec", marginTop: 40 }}>
      <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 30, padding: "40px 24px" }}>
        {cols.map(([h, items]) => (
          <div key={h}>
            <h4 style={{ color: "#2f3438", fontSize: 15, marginBottom: 13, fontWeight: 600 }}>{h}</h4>
            {items.map((i) => <a key={i} style={{ display: "block", padding: "5px 0", fontSize: 14, color: "#6a7176", cursor: "pointer" }}>{i}</a>)}
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #ececec" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 24px", fontSize: 13, color: "#8a9499" }}>
          <span>Join Us On</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            {[["#3b5998","f"],["#1da1f2","𝕏"],["#e1306c","◉"],["#6364ff","m"]].map(([bg, c]) => (
              <span key={c} style={{ width: 26, height: 26, borderRadius: "50%", background: bg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{c}</span>
            ))}
            <span style={{ color: "#8a9499", marginLeft: 8 }}>© 2026 Tindie, Inc.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

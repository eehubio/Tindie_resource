import { sql } from "drizzle-orm";
import { db } from "../src/db";
import { resources } from "../src/db/schema";
import * as fs from "fs";
import * as path from "path";

const OUT_DIR = path.join(process.cwd(), "public", "logos");

async function fetchBuffer(url: string): Promise<Buffer | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000); // 8s timeout per icon
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" }, signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    if (ab.byteLength < 100) return null;
    return Buffer.from(ab);
  } catch {
    return null;
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log("Loading resources from DB...");
  const all = await db.select().from(resources);
  console.log(`Found ${all.length} resources. Downloading icons...`);
  let saved = 0, skipped = 0, failed = 0;
  for (const r of all) {
    const logo = r.logo || "";
    if (!logo || logo.startsWith("/logos/") || !/^https?:\/\//.test(logo)) { skipped++; continue; }
    const buf = await fetchBuffer(logo);
    if (!buf) { console.log(`  x failed: ${r.name}`); failed++; continue; }
    const file = `${r.slug}.png`;
    fs.writeFileSync(path.join(OUT_DIR, file), buf);
    await db.update(resources).set({ logo: `/logos/${file}` }).where(sql`${resources.id} = ${r.id}`);
    console.log(`  ok ${r.name}`);
    saved++;
  }
  console.log(`\nDone. Saved ${saved}, skipped ${skipped}, failed ${failed}.`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });

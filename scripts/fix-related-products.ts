import { sql } from "drizzle-orm";
import { db } from "../src/db";

async function main() {
  console.log("Scanning discoveries for string-typed related_products...");
  const rows: any = await db.execute(sql`
    SELECT id, title, related_products
    FROM discoveries
    WHERE related_products IS NOT NULL
      AND jsonb_typeof(related_products) = 'string'
  `);
  const list = rows.rows ?? rows;
  console.log(`Found ${list.length} rows to fix.`);
  let fixed = 0;
  for (const r of list) {
    await db.execute(sql`
      UPDATE discoveries
      SET related_products = (related_products #>> '{}')::jsonb
      WHERE id = ${r.id}
    `);
    console.log(`  fixed #${r.id}  ${r.title}`);
    fixed++;
  }
  console.log(`\nDone. Fixed ${fixed} rows.`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { discoveries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TAXONOMY } from "@/lib/taxonomy";

const VALID_CATEGORIES = TAXONOMY.map((t) => t.id);

/**
 * POST /api/ingest/discovery
 *
 * External ingest endpoint — accepts pre-summarised discovery items
 * (e.g. from eetree pipeline or any third‑party scraper) and writes them
 * into the Tindie review queue (status = "needs_review").
 *
 * Auth:  Authorization: Bearer <INGEST_SECRET>
 *        INGEST_SECRET must be set in Vercel env vars.
 */
export async function POST(req: Request) {
  // ---- auth ----
  const auth = req.headers.get("authorization");
  const secret = process.env.TINDIE_INGEST_SECRET || process.env.INGEST_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Server misconfigured: INGEST_SECRET is not set" },
      { status: 500 }
    );
  }
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ---- parse body ----
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const summary = typeof body.summary === "string" ? body.summary.trim() : "";
  const why = typeof body.why === "string" ? body.why.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const sourceName = typeof body.sourceName === "string" ? body.sourceName.trim() : "";
  const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : "";
  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string").slice(0, 5) : [];

  // ---- validate ----
  const errors: string[] = [];
  if (!title) errors.push("title is required");
  if (!summary) errors.push("summary is required");
  if (!why) errors.push("why is required");
  if (!VALID_CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(", ")}`);
  }
  if (!sourceName) errors.push("sourceName is required");

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
  }

  // ---- dedupe by title ----
  const existing = await db
    .select({ id: discoveries.id })
    .from(discoveries)
    .where(eq(discoveries.title, title))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ ok: true, skipped: true, reason: "duplicate title" });
  }

  // ---- insert ----
  const today = new Date().toISOString().slice(0, 10);

  await db.insert(discoveries).values({
    title: title.slice(0, 200),
    summary: summary.slice(0, 500),
    why: why.slice(0, 500),
    category,
    sourceName,
    sourceUrl: sourceUrl || null,
    chips: tags,
    relatedTags: tags,
    relatedProducts: [],
    aiScore: 70,
    status: "needs_review",
    publishDate: today,
    imageLicense: "none",
  });

  return NextResponse.json({ ok: true, inserted: true });
}

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { trackRecommendation } from "@/lib/queries";

const schema = z.object({
  id: z.number(),
  kind: z.enum(["impression", "click"]),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { id, kind } = parsed.data;
  try {
    await trackRecommendation(id, kind);
  } catch {
    // Tracking is best-effort; never block the user on a failed count.
    return NextResponse.json({ ok: false });
  }
  return NextResponse.json({ ok: true });
}

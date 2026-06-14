export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { toggleSource } from "@/lib/queries";

const schema = z.object({ id: z.number() });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const status = await toggleSource(parsed.data.id);
  return NextResponse.json({ ok: true, status });
}

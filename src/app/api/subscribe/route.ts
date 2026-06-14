export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribe } from "@/lib/queries";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  await subscribe(parsed.data.email);
  return NextResponse.json({ ok: true });
}

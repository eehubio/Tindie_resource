export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { toggleSave } from "@/lib/queries";

const schema = z.object({ discoveryId: z.number() });

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Sign in to save" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const saved = await toggleSave(userId, parsed.data.discoveryId);
  return NextResponse.json({ ok: true, saved });
}

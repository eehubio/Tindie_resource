export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { addComment } from "@/lib/queries";

const schema = z.object({ discoveryId: z.number(), body: z.string().min(1).max(2000), tag: z.string().optional() });

export async function POST(req: Request) {
  const session = await auth();
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const name = (session?.user?.name || session?.user?.email || "anonymous") as string;
  await addComment(parsed.data.discoveryId, parsed.data.body, parsed.data.tag || null, name, (session?.user as any)?.id || null);
  return NextResponse.json({ ok: true });
}

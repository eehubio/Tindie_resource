export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { submitResource } from "@/lib/queries";

const schema = z.object({ name: z.string().min(1), url: z.string().optional(), category: z.string().optional(), why: z.string().optional() });

export async function POST(req: Request) {
  const session = await auth();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  await submitResource({ ...parsed.data, submittedBy: session?.user?.email || "anonymous" });
  return NextResponse.json({ ok: true });
}

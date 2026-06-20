export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { toggleSource, createSource, deleteSource, updateSource } from "@/lib/queries";

const schema = z.object({
  id: z.number().optional(),
  action: z.enum(["toggle", "create", "delete", "update"]).optional(),
  fields: z.record(z.any()).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { id, action, fields } = parsed.data;
  // Backwards compatible: no action + id => toggle (old Pause/Resume buttons)
  if ((action === "toggle" || !action) && id != null) {
    const status = await toggleSource(id);
    return NextResponse.json({ ok: true, status });
  }
  if (action === "create" && fields) { await createSource(fields as any); return NextResponse.json({ ok: true }); }
  if (action === "update" && id != null && fields) { await updateSource(id, fields as any); return NextResponse.json({ ok: true }); }
  if (action === "delete" && id != null) { await deleteSource(id); return NextResponse.json({ ok: true }); }
  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}

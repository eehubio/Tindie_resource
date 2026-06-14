export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { approveDiscovery, rejectDiscovery, updateDiscovery } from "@/lib/queries";

const schema = z.object({
  id: z.number(),
  action: z.enum(["approve", "reject", "update"]),
  fields: z.record(z.any()).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { id, action, fields } = parsed.data;
  if (action === "approve") await approveDiscovery(id);
  else if (action === "reject") await rejectDiscovery(id);
  else if (action === "update" && fields) await updateDiscovery(id, fields as any);
  return NextResponse.json({ ok: true });
}

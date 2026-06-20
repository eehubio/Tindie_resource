export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createRecommendation, updateRecommendation, deleteRecommendation } from "@/lib/queries";

const schema = z.object({
  id: z.number().optional(),
  action: z.enum(["create", "update", "delete"]),
  fields: z.record(z.any()).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { id, action, fields } = parsed.data;
  if (action === "create" && fields) await createRecommendation(fields as any);
  else if (action === "update" && id != null && fields) await updateRecommendation(id, fields as any);
  else if (action === "delete" && id != null) await deleteRecommendation(id);
  else return NextResponse.json({ error: "Bad request" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

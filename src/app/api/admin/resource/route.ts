export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyResource, updateResource, createResource } from "@/lib/queries";

const schema = z.object({
  id: z.number().optional(),
  action: z.enum(["verify", "update", "create"]),
  url: z.string().optional(),
  fields: z.record(z.any()).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { id, action, url, fields } = parsed.data;
  if (action === "verify" && id != null) await verifyResource(id, url);
  else if (action === "update" && id != null && fields) await updateResource(id, fields as any);
  else if (action === "create" && fields) await createResource(fields as any);
  else return NextResponse.json({ error: "Bad request" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

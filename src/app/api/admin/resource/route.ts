export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyResource, updateResource, createResource, deleteResource, moveResource, bulkDeleteResources, bulkSetResourceStatus } from "@/lib/queries";

const schema = z.object({
  id: z.number().optional(),
  ids: z.array(z.number()).optional(),
  action: z.enum(["verify", "update", "create", "delete", "move", "bulkDelete", "bulkHide", "bulkUnhide"]),
  url: z.string().optional(),
  fields: z.record(z.any()).optional(),
  dir: z.enum(["up", "down"]).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { id, ids, action, url, fields, dir } = parsed.data;
  if (action === "verify" && id != null) await verifyResource(id, url);
  else if (action === "update" && id != null && fields) await updateResource(id, fields as any);
  else if (action === "create" && fields) await createResource(fields as any);
  else if (action === "delete" && id != null) await deleteResource(id);
  else if (action === "move" && id != null && dir) await moveResource(id, dir);
  else if (action === "bulkDelete" && ids) await bulkDeleteResources(ids);
  else if (action === "bulkHide" && ids) await bulkSetResourceStatus(ids, "hidden");
  else if (action === "bulkUnhide" && ids) await bulkSetResourceStatus(ids, "active");
  else return NextResponse.json({ error: "Bad request" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

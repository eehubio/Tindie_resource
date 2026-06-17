export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { approveDiscovery, rejectDiscovery, updateDiscovery, getComments, deleteComment, unpublishDiscovery, deleteDiscovery } from "@/lib/queries";

const schema = z.object({
  id: z.number(),
  action: z.enum(["approve", "reject", "update", "comments", "deleteComment", "unpublish", "delete"]),
  fields: z.record(z.any()).optional(),
  commentId: z.number().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { id, action, fields, commentId } = parsed.data;
  if (action === "approve") await approveDiscovery(id);
  else if (action === "reject") await rejectDiscovery(id);
  else if (action === "update" && fields) await updateDiscovery(id, fields as any);
  else if (action === "comments") return NextResponse.json({ ok: true, comments: await getComments(id) });
  else if (action === "deleteComment" && commentId != null) await deleteComment(commentId);
  else if (action === "unpublish") await unpublishDiscovery(id);
  else if (action === "delete") await deleteDiscovery(id);
  return NextResponse.json({ ok: true });
}

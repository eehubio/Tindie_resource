export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { approveDiscovery, rejectDiscovery, updateDiscovery, getComments, deleteComment, unpublishDiscovery, deleteDiscovery, bulkApproveDiscoveries, bulkRejectDiscoveries, bulkUnpublishDiscoveries, bulkDeleteDiscoveries } from "@/lib/queries";

const schema = z.object({
  id: z.number().optional(),
  ids: z.array(z.number()).optional(),
  action: z.enum(["approve", "reject", "update", "comments", "deleteComment", "unpublish", "delete", "bulkApprove", "bulkReject", "bulkUnpublish", "bulkDelete"]),
  fields: z.record(z.any()).optional(),
  commentId: z.number().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { id, ids, action, fields, commentId } = parsed.data;
  if (action === "approve" && id != null) await approveDiscovery(id);
  else if (action === "reject" && id != null) await rejectDiscovery(id);
  else if (action === "update" && id != null && fields) await updateDiscovery(id, fields as any);
  else if (action === "comments" && id != null) return NextResponse.json({ ok: true, comments: await getComments(id) });
  else if (action === "deleteComment" && commentId != null) await deleteComment(commentId);
  else if (action === "unpublish" && id != null) await unpublishDiscovery(id);
  else if (action === "delete" && id != null) await deleteDiscovery(id);
  else if (action === "bulkApprove" && ids) await bulkApproveDiscoveries(ids);
  else if (action === "bulkReject" && ids) await bulkRejectDiscoveries(ids);
  else if (action === "bulkUnpublish" && ids) await bulkUnpublishDiscoveries(ids);
  else if (action === "bulkDelete" && ids) await bulkDeleteDiscoveries(ids);
  else return NextResponse.json({ error: "Bad request" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

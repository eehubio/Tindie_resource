import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  resources, discoveries, sources, submissions, comments, saves, subscribers,
} from "@/db/schema";

/* ---------------- public reads ---------------- */

export async function getPublishedDiscoveries(limit = 12) {
  return db.select().from(discoveries)
    .where(eq(discoveries.status, "published"))
    .orderBy(desc(discoveries.createdAt))
    .limit(limit);
}

export async function getDiscoveriesByDate(date: string) {
  return db.select().from(discoveries)
    .where(and(eq(discoveries.status, "published"), eq(discoveries.publishDate, date)))
    .orderBy(desc(discoveries.aiScore));
}

export async function getPublishDates(): Promise<string[]> {
  const rows = await db.selectDistinct({ d: discoveries.publishDate })
    .from(discoveries)
    .where(eq(discoveries.status, "published"));
  return rows.map((r) => r.d).filter(Boolean).sort().reverse() as string[];
}

export async function getDiscovery(id: number) {
  const rows = await db.select().from(discoveries).where(eq(discoveries.id, id)).limit(1);
  return rows[0] || null;
}

export async function getResources() {
  return db.select().from(resources)
    .where(eq(resources.status, "active"))
    .orderBy(desc(resources.isPick), resources.name);
}

export async function getComments(discoveryId: number) {
  return db.select().from(comments)
    .where(eq(comments.discoveryId, discoveryId))
    .orderBy(desc(comments.createdAt));
}

export async function deleteComment(commentId: number) {
  const rows = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
  const c = rows[0];
  if (!c) return;
  await db.delete(comments).where(eq(comments.id, commentId));
  await db.update(discoveries)
    .set({ commentCount: sql`GREATEST(${discoveries.commentCount} - 1, 0)` })
    .where(eq(discoveries.id, c.discoveryId));
}

/* ---------------- public writes ---------------- */

export async function addComment(discoveryId: number, body: string, tag: string | null, authorName: string, userId: string | null) {
  await db.insert(comments).values({ discoveryId, body, tag, authorName, userId });
  await db.update(discoveries)
    .set({ commentCount: sql`${discoveries.commentCount} + 1` })
    .where(eq(discoveries.id, discoveryId));
}

export async function toggleSave(userId: string, discoveryId: number) {
  const existing = await db.select().from(saves)
    .where(and(eq(saves.userId, userId), eq(saves.discoveryId, discoveryId))).limit(1);
  if (existing[0]) {
    await db.delete(saves).where(and(eq(saves.userId, userId), eq(saves.discoveryId, discoveryId)));
    await db.update(discoveries).set({ saveCount: sql`GREATEST(${discoveries.saveCount} - 1, 0)` }).where(eq(discoveries.id, discoveryId));
    return false;
  }
  await db.insert(saves).values({ userId, discoveryId });
  await db.update(discoveries).set({ saveCount: sql`${discoveries.saveCount} + 1` }).where(eq(discoveries.id, discoveryId));
  return true;
}

export async function getUserSaves(userId: string): Promise<number[]> {
  const rows = await db.select({ id: saves.discoveryId }).from(saves).where(eq(saves.userId, userId));
  return rows.map((r) => r.id);
}

export async function submitResource(data: { name: string; url?: string; category?: string; why?: string; submittedBy?: string }) {
  const flag = /cheap|free-?pcb|\.biz|\.xyz/i.test((data.url || "") + data.name) ? "flag" : "ok";
  await db.insert(submissions).values({ ...data, autoCheck: flag, status: "pending" });
}

export async function subscribe(email: string) {
  await db.insert(subscribers).values({ email }).onConflictDoNothing();
}

/* ---------------- admin reads ---------------- */

export async function getInbox(status = "needs_review") {
  return db.select().from(discoveries).where(eq(discoveries.status, status)).orderBy(desc(discoveries.aiScore));
}

export async function getAllResourcesAdmin() {
  return db.select().from(resources).orderBy(resources.name);
}

export async function getSources() {
  return db.select().from(sources).orderBy(sources.name);
}

export async function getPendingSubmissions() {
  return db.select().from(submissions).where(eq(submissions.status, "pending")).orderBy(desc(submissions.createdAt));
}

export async function getDashboardStats() {
  const today = new Date().toISOString().slice(0, 10);
  const [needs] = await db.select({ c: sql<number>`count(*)` }).from(discoveries).where(eq(discoveries.status, "needs_review"));
  const [scheduled] = await db.select({ c: sql<number>`count(*)` }).from(discoveries).where(eq(discoveries.status, "scheduled"));
  const [approvedToday] = await db.select({ c: sql<number>`count(*)` }).from(discoveries)
    .where(and(eq(discoveries.status, "published"), eq(discoveries.publishDate, today)));
  const [broken] = await db.select({ c: sql<number>`count(*)` }).from(resources).where(eq(resources.linkOk, false));
  return {
    needsReview: Number(needs?.c || 0),
    scheduled: Number(scheduled?.c || 0),
    approvedToday: Number(approvedToday?.c || 0),
    brokenLinks: Number(broken?.c || 0),
  };
}

/* ---------------- admin writes ---------------- */

export async function approveDiscovery(id: number) {
  const today = new Date().toISOString().slice(0, 10);
  await db.update(discoveries).set({ status: "published", publishDate: today }).where(eq(discoveries.id, id));
}
export async function rejectDiscovery(id: number) {
  await db.update(discoveries).set({ status: "rejected" }).where(eq(discoveries.id, id));
}
export async function updateDiscovery(id: number, fields: Partial<typeof discoveries.$inferInsert>) {
  await db.update(discoveries).set(fields).where(eq(discoveries.id, id));
}

export async function toggleSource(id: number) {
  const rows = await db.select().from(sources).where(eq(sources.id, id)).limit(1);
  if (!rows[0]) return;
  const next = rows[0].status === "active" ? "paused" : "active";
  await db.update(sources).set({ status: next }).where(eq(sources.id, id));
  return next;
}

export async function createSource(fields: { name: string; method?: string; url?: string; trust?: string; dailyCap?: number }) {
  await db.insert(sources).values({
    name: fields.name,
    method: fields.method || "RSS",
    url: fields.url || null,
    trust: fields.trust || "Medium",
    dailyCap: fields.dailyCap ?? 2,
    status: "active",
  });
}

export async function deleteSource(id: number) {
  await db.delete(sources).where(eq(sources.id, id));
}

export async function verifyResource(id: number, url?: string) {
  await db.update(resources)
    .set({ linkOk: true, isVerified: true, verifiedAt: new Date(), ...(url ? { url } : {}) })
    .where(eq(resources.id, id));
}
export async function updateResource(id: number, fields: Partial<typeof resources.$inferInsert>) {
  await db.update(resources).set(fields).where(eq(resources.id, id));
}

export async function deleteResource(id: number) {
  await db.delete(resources).where(eq(resources.id, id));
}

export async function createResource(fields: {
  name: string; url: string; category: string; description?: string;
  capLabel?: string; logo?: string; isPick?: boolean; isPartner?: boolean;
}) {
  const base = fields.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "resource";
  const slug = base + "-" + Date.now().toString(36);
  await db.insert(resources).values({
    slug,
    name: fields.name,
    url: fields.url || "https://",
    description: fields.description || "",
    category: fields.category || "open-source",
    capLabel: fields.capLabel || "Resource",
    logo: fields.logo || null,
    isPick: !!fields.isPick,
    isPartner: !!fields.isPartner,
    isVerified: false,
    linkOk: true,
    status: "active",
  });
}

export async function moderateSubmission(id: number, action: "approve" | "reject") {
  if (action === "reject") {
    await db.update(submissions).set({ status: "rejected" }).where(eq(submissions.id, id));
    return;
  }
  const rows = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
  const s = rows[0];
  if (!s) return;
  await db.update(submissions).set({ status: "approved" }).where(eq(submissions.id, id));
  // promote into the directory (hidden until an editor finalizes labels)
  const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) + "-" + id;
  await db.insert(resources).values({
    slug, name: s.name, url: s.url || "https://", description: s.why || "Submitted by the community.",
    category: s.category || "open-source", capLabel: "Community", isVerified: false, status: "hidden",
  }).onConflictDoNothing();
}

import { getInbox, getAllResourcesAdmin, getSources, getPendingSubmissions, getDashboardStats } from "@/lib/queries";
import { AdminConsole } from "@/components/AdminConsole";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [inbox, published, resources, sources, submissions, stats] = await Promise.all([
    getInbox("needs_review"),
    getInbox("published"),
    getAllResourcesAdmin(),
    getSources(),
    getPendingSubmissions(),
    getDashboardStats(),
  ]);
  return <AdminConsole inbox={inbox as any} published={published as any} resources={resources as any} sources={sources as any} submissions={submissions as any} stats={stats} />;
}

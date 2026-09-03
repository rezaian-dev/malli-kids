import { requireAdminPage } from "@/lib/auth/admin";
import { getAllArticles } from "./_lib/data";
import { AdminArticlesLanding } from "./_components/admin-articles-landing";

export default async function AdminArticles() {
  const admin = await requireAdminPage();

  const articles = await getAllArticles();

  return <AdminArticlesLanding articles={articles} />;
}

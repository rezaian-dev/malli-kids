import { requireAdminPage } from "@/lib/auth/admin";
import { getAllTags } from "@/lib/tags";
import { getAllArticles } from "./_lib/data";
import { AdminArticlesLanding } from "./_components/admin-articles-landing";

export default async function AdminArticles() {
  const admin = await requireAdminPage();

  const [articles, allTags] = await Promise.all([
    getAllArticles(),
    getAllTags(),
  ]);

  return <AdminArticlesLanding articles={articles} allTags={allTags} />;
}

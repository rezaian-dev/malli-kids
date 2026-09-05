"use client";

import { useState } from "react";
import type { AdminArticle } from "@/types";
import type { ContentTag } from "@/lib/tags";
import {
  ArticleEditor,
  EMPTY_ARTICLE_DRAFT,
  type ArticleDraft,
} from "./article-editor";
import { ArticleList } from "./article-list";

function draftFromArticle(article: AdminArticle): ArticleDraft {
  return {
    slug: article.slug,
    title: article.title,
    tag: article.tag,
    excerpt: article.excerpt,
    body: article.body ?? "",
    cover: article.cover ?? "",
    published: article.published,
    tags: article.tags,
    date: article.date,
  };
}

export function AdminArticlesLanding({
  articles,
  allTags,
}: {
  articles: AdminArticle[];
  allTags: ContentTag[];
}) {
  const [draft, setDraft] = useState<ArticleDraft | null>(null);
  // 🏷️ Owned here (not inside `ArticleEditor`) so a tag created while
  // editing one article is already in the picker the next time *any*
  // article is opened, without a full page reload.
  const [tags, setTags] = useState(allTags);

  if (draft) {
    return (
      <ArticleEditor
        initial={draft}
        allTags={tags}
        onTagCreated={(tag) =>
          setTags((current) =>
            // 🔁 `createTagAction` upserts server-side — re-submitting a
            // name that slugifies to an existing tag returns *that* tag, not
            // a new one. Without this check, the local list would grow a
            // second entry for the same slug (two identical chips) even
            // though the database itself never duplicated anything.
            current.some((t) => t.slug === tag.slug)
              ? current
              : [...current, tag],
          )
        }
        onTagRemoved={(slug) =>
          setTags((current) => current.filter((t) => t.slug !== slug))
        }
        onDone={() => setDraft(null)}
      />
    );
  }

  return (
    <ArticleList
      articles={articles}
      onNew={() => setDraft(EMPTY_ARTICLE_DRAFT)}
      onEdit={(article) => setDraft(draftFromArticle(article))}
    />
  );
}

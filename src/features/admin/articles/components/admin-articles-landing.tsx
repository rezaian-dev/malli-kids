"use client";

import { useState } from "react";
import type { AdminArticle } from "@/types";
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
    date: article.date,
  };
}

export function AdminArticlesLanding() {
  const [draft, setDraft] = useState<ArticleDraft | null>(null);

  if (draft) {
    return <ArticleEditor initial={draft} onDone={() => setDraft(null)} />;
  }

  return (
    <ArticleList
      onNew={() => setDraft(EMPTY_ARTICLE_DRAFT)}
      onEdit={(article) => setDraft(draftFromArticle(article))}
    />
  );
}

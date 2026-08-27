"use client";

import { useState } from "react";
import type { AdminArticle } from "@/types";
import type { ContentTag } from "@/lib/tags";
import { usePolling } from "@/hooks/use-polling";
import { notifyAdminMutation } from "@/lib/admin/live";
import { getAdminArticlesAction } from "../_lib/actions";
import {
  ArticleEditor,
  EMPTY_ARTICLE_DRAFT,
  type ArticleDraft,
} from "./article-editor";
import { ArticleList } from "./article-list";

const POLL_MS = 15_000;

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
  articles: initialArticles,
  allTags: initialTags,
}: {
  articles: AdminArticle[];
  allTags: ContentTag[];
}) {
  const [draft, setDraft] = useState<ArticleDraft | null>(null);
  // 📡 Live while browsing the list; paused while the editor is open so a
  // background tick can never surprise an in-progress draft.
  const [live, , refreshLive] = usePolling(
    getAdminArticlesAction,
    POLL_MS,
    { articles: initialArticles, tags: initialTags },
    !draft,
  );
  // 🏷️ Local tag edits (created/removed mid-edit) layer over the polled
  // list and reset once the editor closes — the next edit starts from
  // fresh server truth again.
  const [tagLayer, setTagLayer] = useState<ContentTag[] | null>(null);
  const tags = tagLayer ?? live.tags;

  function synced() {
    setTagLayer(null);
    refreshLive();
    notifyAdminMutation();
  }

  if (draft) {
    return (
      <ArticleEditor
        initial={draft}
        allTags={tags}
        onTagCreated={(tag) =>
          setTagLayer((current) => {
            const base = current ?? live.tags;
            // 🔁 `createTagAction` upserts server-side — re-submitting a
            // name that slugifies to an existing tag returns *that* tag, not
            // a new one. Without this check, the local list would grow a
            // second entry for the same slug (two identical chips) even
            // though the database itself never duplicated anything.
            return base.some((t) => t.slug === tag.slug)
              ? base
              : [...base, tag];
          })
        }
        onTagRemoved={(slug) =>
          setTagLayer((current) =>
            (current ?? live.tags).filter((t) => t.slug !== slug),
          )
        }
        onDone={() => {
          setDraft(null);
          synced();
        }}
      />
    );
  }

  return (
    <ArticleList
      articles={live.articles}
      onNew={() => setDraft(EMPTY_ARTICLE_DRAFT)}
      onEdit={(article) => setDraft(draftFromArticle(article))}
      onChanged={synced}
    />
  );
}

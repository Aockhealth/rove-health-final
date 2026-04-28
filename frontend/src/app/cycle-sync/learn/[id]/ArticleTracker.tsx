'use client';

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

interface ArticleTrackerProps {
  articleId: string;
  articleTitle: string;
  category: string;
}

export function ArticleTracker({ articleId, articleTitle, category }: ArticleTrackerProps) {
  const posthog = usePostHog();

  useEffect(() => {
    if (articleId && articleTitle) {
      posthog.capture('article_viewed', {
        article_id: articleId,
        article_title: articleTitle,
        category: category
      });
    }
  }, [articleId, articleTitle, category, posthog]);

  return null;
}

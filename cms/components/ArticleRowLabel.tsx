'use client';

import { useRowLabel } from '@payloadcms/ui';

export function ArticleRowLabel() {
  const { data, rowNumber } = useRowLabel<{ title?: string }>();
  return <span>{String((rowNumber ?? 0) + 1).padStart(2, '0')} · {data?.title || 'Untitled article'}</span>;
}

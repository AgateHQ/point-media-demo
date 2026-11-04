import config from '@payload-config';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import type { Metadata } from 'next';

import { ReaderPreview } from '../../../../../components/ReaderPreview';
import { LiveEditionPreview } from '../../../../../components/LiveEditionPreview';
import { PhonePreview } from '../../../../../components/PhonePreview';
import { toEditionContent } from '../../../../../lib/editionContent';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Edition preview · Point Media', robots: { index: false, follow: false } };

export default async function PreviewPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ live?: string; frame?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const live = query.live === '1';
  const development = process.env.NODE_ENV === 'development';
  const readerOrigin = process.env.READER_DEV_ORIGIN;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  const payload = await getPayload({ config });
  const edition = await payload.findByID({ collection: 'editions', id: Number(id), depth: 3, disableErrors: true, overrideAccess: false });
  if (!edition) notFound();
  if (query.frame !== '1') return <PhonePreview src={`/preview/editions/${id}?frame=1${live ? '&live=1' : ''}`} live={live} />;
  if (live) return <LiveEditionPreview initialData={edition} development={development} readerOrigin={readerOrigin} />;
  const publication = typeof edition.publication === 'object' ? edition.publication : null;
  if (!publication) notFound();
  if (!edition.articles?.length) return <main className="reader-preview-fallback">
    <p>{publication.name} · Edition preview</p><h1>No articles yet</h1>
    <p>Add and save your first article to open this edition in the reader.</p>
    <a href={`/admin/collections/editions/${edition.id}`}>Write your first article →</a>
  </main>;

  return <ReaderPreview content={toEditionContent(edition)} development={development} readerOrigin={readerOrigin} />;
}

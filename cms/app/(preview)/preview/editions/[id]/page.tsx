import config from '@payload-config';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import type { Metadata } from 'next';

import { ReaderPreview } from '../../../../../components/ReaderPreview';
import type { EditionContent } from '../../../../../../src/editionContent';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Edition preview · Point Media', robots: { index: false, follow: false } };

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  const payload = await getPayload({ config });
  const edition = await payload.findByID({ collection: 'editions', id: Number(id), depth: 3, disableErrors: true, overrideAccess: false });
  if (!edition) notFound();
  const publication = typeof edition.publication === 'object' ? edition.publication : null;
  if (!publication) notFound();
  const logo = typeof publication.logo === 'object' ? publication.logo : null;
  if (!edition.articles?.length) return <main className="reader-preview-fallback">
    <p>{publication.name} · Edition preview</p><h1>No articles yet</h1>
    <p>Add and save your first article to open this edition in the reader.</p>
    <a href={`/admin/collections/editions/${edition.id}`}>Write your first article →</a>
  </main>;

  const content: EditionContent = {
    id: edition.id,
    publication: { id: publication.id, name: publication.name, headline: publication.headline, logoUrl: logo?.url || undefined },
    startDate: edition.startDate, endDate: edition.endDate,
    articles: edition.articles.map((article, index) => {
      const image = article.mediaType === 'image' && typeof article.mainImage === 'object' ? article.mainImage : null;
      return {
        id: article.id || `${edition.id}-${index}`,
        title: article.title, body: article.body,
        imageUrl: image?.url || undefined, imageAlt: image?.alt,
        videoUrl: article.mediaType === 'video' ? article.videoUrl || undefined : undefined,
      };
    }),
  };
  return <ReaderPreview content={content} development={process.env.NODE_ENV === 'development'} readerOrigin={process.env.READER_DEV_ORIGIN} />;
}

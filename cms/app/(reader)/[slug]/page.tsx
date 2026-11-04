import config from '@payload-config';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import { cache, type CSSProperties } from 'react';
import type { Metadata } from 'next';
import { ReaderPreview } from '../../../components/ReaderPreview';
import { toEditionContent } from '../../../lib/editionContent';
import { findPublicationReader } from '../../../lib/publicationReader';
import { validPublicationSlug } from '../../../lib/publicationSlug';
import { publicationTheme } from '../../../../src/publicationTheme';
import styles from '../publication.module.css';

export const dynamic = 'force-dynamic';
const loadPublication = cache(async (slug: string) => findPublicationReader(await getPayload({ config }), slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = validPublicationSlug(slug) ? await loadPublication(slug) : null;
  return { title: result?.publication.name || 'Publication not found', description: result?.publication.headline };
}

export default async function PublicationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!validPublicationSlug(slug)) notFound();
  const result = await loadPublication(slug);
  if (!result) notFound();
  if (!result.edition?.articles?.length) return <main className={styles.page}>
    <section className={styles.empty} style={{ '--brand': publicationTheme(result.publication.brandColor).accent } as CSSProperties}>
      <p>{result.publication.name}</p><h1>Your next edition is on its way.</h1>
      <p>Check back soon for new articles.</p><a href="/publications">Explore publications →</a>
    </section>
  </main>;
  return <ReaderPreview content={{ ...toEditionContent(result.edition), mode: 'publication' }} development={process.env.NODE_ENV === 'development'} readerOrigin={process.env.READER_DEV_ORIGIN} />;
}

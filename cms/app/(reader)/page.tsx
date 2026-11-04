import config from '@payload-config';
import { getPayload } from 'payload';
import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { publicationTheme } from '../../../src/publicationTheme';
import styles from './publication.module.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Publications · Point Media' };

export default async function PublicationsPage() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: 'publications', sort: 'name', depth: 1, pagination: false, joins: false, overrideAccess: false });
  return <main className={styles.page}>
    <header className={styles.header}><h1>Find your daily read.</h1><a href="/admin">Editorial workspace ↗</a></header>
    <p className={styles.intro}>Independent publications. Fresh perspectives. Choose your next edition.</p>
    <div className={styles.grid}>
      {docs.filter(publication => publication.slug).map(publication => {
        const theme = publicationTheme(publication.brandColor);
        const logo = typeof publication.logo === 'object' ? publication.logo : null;
        return <a className={styles.card} key={publication.id} href={`/${publication.slug}`} style={{ '--brand': theme.accent, '--paper': theme.color, '--ink': theme.ink, '--link': theme.brand } as CSSProperties}>
          {logo?.url && <img src={logo.url} alt="" />}
          <h2>{publication.name}</h2><p>{publication.headline}</p><span>Read the edition →</span>
        </a>;
      })}
    </div>
    {!docs.length && <section className={styles.empty}><h2>Your first publication starts here.</h2><p>Create a publication and save an edition in the <a href="/admin">editorial workspace</a>.</p></section>}
  </main>;
}

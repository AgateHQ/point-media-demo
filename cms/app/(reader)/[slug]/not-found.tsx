import styles from '../publication.module.css';

export default function PublicationNotFound() {
  return <main className={styles.page}><section className={styles.empty}><h1>Publication not found.</h1><p>This address may have changed.</p><a href="/publications">Explore publications →</a></section></main>;
}

export function EditorialWelcome() {
  return <section className="editorial-welcome">
    <p className="editorial-eyebrow">Point Media · Editorial</p>
    <h2>Write and arrange your articles</h2>
    <p>Open an edition to write articles, choose their images or videos, and set the reading order. Preview the edition when you’re ready.</p>
    <div className="editorial-actions">
      <a className="editorial-button" href="/admin/collections/editions">Open articles &amp; editions →</a>
      <a href="/admin/collections/editions/create">Create an edition</a>
    </div>
  </section>;
}

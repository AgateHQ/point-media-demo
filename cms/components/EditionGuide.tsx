'use client';

import { useDocumentInfo } from '@payloadcms/ui';

export function EditionGuide() {
  const { id } = useDocumentInfo();
  return <section className="edition-guide">
    <div>
      <p className="editorial-eyebrow">Article workspace</p>
      <h2>Write this edition</h2>
      <p>Add your articles below. Publication and dates are in the edition details.</p>
    </div>
    <div className="edition-guide__preview">
      {id ? <a className="editorial-button" href={`/preview/editions/${id}`} target="_blank" rel="noopener noreferrer">Preview edition ↗</a>
        : <strong>Save this edition to enable preview.</strong>}
      <p>Save your changes before previewing.</p>
    </div>
  </section>;
}

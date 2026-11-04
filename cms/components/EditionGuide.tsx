'use client';

import { useDocumentInfo, useLivePreviewContext } from '@payloadcms/ui';
import { useEffect } from 'react';
import { phonePreview } from '../lib/preview';

export function EditionGuide() {
  const { id } = useDocumentInfo();
  const { breakpoint, isLivePreviewing, setBreakpoint, setIsLivePreviewing, setSize, setZoom, size, zoom } = useLivePreviewContext();
  useEffect(() => {
    if (breakpoint !== phonePreview.name) setBreakpoint(phonePreview.name);
    if (size.width !== phonePreview.width || size.height !== phonePreview.height) {
      setSize({ type: 'reset', value: { width: phonePreview.width, height: phonePreview.height } });
    }
    if (zoom !== 1) setZoom(1);
  }, [breakpoint, setBreakpoint, setSize, setZoom, size.width, size.height, zoom]);
  return <section className="edition-guide">
    <div>
      <p className="editorial-eyebrow">Article workspace</p>
      <h2>Write this edition</h2>
      <p>Add your articles below. Publication and dates are in the edition details.</p>
    </div>
    <div className="edition-guide__preview">
      {id ? <>
        <button className="editorial-button" type="button" onClick={() => setIsLivePreviewing(!isLivePreviewing)}>{isLivePreviewing ? 'Hide live preview' : 'Live preview'}</button>
        <a className="edition-saved-preview" href={`/preview/editions/${id}`} target="_blank" rel="noopener noreferrer">Saved preview ↗</a>
        <p>Live preview updates as you type. Save when you’re ready.</p>
      </> : <p>Save the edition once to enable live preview. Then see changes as you type, before saving again.</p>}
    </div>
  </section>;
}

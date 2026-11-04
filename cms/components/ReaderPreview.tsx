'use client';

import { useEffect, useRef, useState } from 'react';
import type { EditionContent } from '../../src/editionContent';

type ReaderHandle = { destroy: () => void | Promise<void>; update: (content: EditionContent) => void };
type ReaderModule = { mountEditionPreview: (target: HTMLElement, content: EditionContent) => Promise<ReaderHandle> };

export function ReaderPreview({ content, development, readerOrigin }: {
  content: EditionContent;
  development: boolean;
  readerOrigin?: string;
}) {
  const target = useRef<HTMLDivElement>(null);
  const handle = useRef<ReaderHandle | null>(null);
  const latestContent = useRef(content);
  latestContent.current = content;
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    let mounted: ReaderHandle | undefined;
    async function load() {
      try {
        let moduleUrl = '/reader/reader.js';
        if (development) {
          const origin = readerOrigin ? new URL(readerOrigin) : new URL(window.location.origin);
          if (!readerOrigin) origin.port = '5173';
          moduleUrl = new URL('/src/preview-entry.ts', origin).href;
        } else if (!document.querySelector('link[data-reader-styles]')) {
          await new Promise<void>((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet'; link.href = '/reader/reader.css'; link.dataset.readerStyles = '';
            link.onload = () => resolve(); link.onerror = () => { link.remove(); reject(new Error('Reader styles could not load')); };
            document.head.append(link);
          });
        }
        const reader = await import(/* webpackIgnore: true */ moduleUrl) as ReaderModule;
        if (cancelled || !target.current) return;
        const mountingContent = latestContent.current;
        mounted = await reader.mountEditionPreview(target.current, mountingContent);
        if (cancelled) await mounted.destroy();
        else {
          if (latestContent.current !== mountingContent) mounted.update(latestContent.current);
          handle.current = mounted;
          setStatus('ready');
        }
      } catch (error) {
        if (!cancelled) { console.error('Edition reader preview could not load', error); setStatus('error'); }
      }
    }
    void load();
    return () => { cancelled = true; handle.current = null; void mounted?.destroy(); };
  }, [development, readerOrigin]);

  useEffect(() => { handle.current?.update(content); }, [content]);

  return <>
    {status !== 'ready' && <section className="reader-preview-fallback" role="status">
      <p>{content.mode === 'publication' ? content.publication.name : 'Edition preview'}</p>
      <h1>{status === 'error' ? 'The reader couldn’t load' : 'Opening your edition…'}</h1>
      {status === 'error' && <>
        <p>{development ? 'Make sure the reader and CMS development servers are running, then refresh.' : 'Refresh the page to try again.'}</p>
        <button onClick={() => window.location.reload()}>Try again</button>
        {content.mode !== 'publication' && <a href={`/admin/collections/editions/${content.id}`}>Back to the editor</a>}
      </>}
    </section>}
    <div ref={target} id="reader-preview-root" />
  </>;
}

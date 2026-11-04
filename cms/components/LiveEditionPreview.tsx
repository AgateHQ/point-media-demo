'use client';

import { useEffect, useMemo, useState } from 'react';
import { toEditionContent } from '../lib/editionContent';
import { object, populateLiveEdition } from '../lib/liveEdition';
import { ReaderPreview } from './ReaderPreview';

export function LiveEditionPreview({ initialData, development, readerOrigin }: {
  initialData: unknown;
  development: boolean;
  readerOrigin?: string;
}) {
  const [data, setData] = useState(initialData);
  const [mediaError, setMediaError] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    let sequence = 0;
    let relationshipUpdate = '';
    const cache = new Map<string, unknown>();
    const origin = window.location.origin;
    function receive(event: MessageEvent) {
      const parent = window.parent !== window ? window.parent : window.opener;
      const message = object(event.data);
      if (!parent || event.source !== parent || event.origin !== origin
        || message.type !== 'payload-live-preview' || message.collectionSlug !== 'editions'
        || !message.data || typeof message.data !== 'object') return;
      clearTimeout(timer);
      controller?.abort();
      const current = ++sequence;
      const update = JSON.stringify(message.externallyUpdatedRelationship || null);
      if (update !== relationshipUpdate) { cache.clear(); relationshipUpdate = update; }
      timer = setTimeout(async () => {
        const requestController = new AbortController();
        controller = requestController;
        const pending = new Map<string, Promise<unknown>>();
        let failed = false;
        const next = await populateLiveEdition(message.data, (collection, id) => {
          const key = `${collection}:${id}`;
          if (cache.has(key)) return Promise.resolve(cache.get(key));
          if (!pending.has(key)) pending.set(key, fetch(`/api/${collection}/${encodeURIComponent(id)}?depth=1&joins=false`, {
            signal: requestController.signal,
            credentials: 'same-origin',
          }).then(async response => {
            if (!response.ok) throw new Error('Could not populate preview media');
            const doc: unknown = await response.json();
            cache.set(key, doc);
            return doc;
          }).catch(error => {
            if (error.name !== 'AbortError') failed = true;
            return undefined;
          }));
          return pending.get(key)!;
        });
        if (current === sequence && !requestController.signal.aborted) { setData(next); setMediaError(failed); }
      }, 120);
    }
    window.addEventListener('message', receive);
    // Payload's documented client-side Live Preview handshake.
    const parent = window.parent !== window ? window.parent : window.opener;
    parent?.postMessage({ type: 'payload-live-preview', ready: true }, origin);
    return () => { sequence++; clearTimeout(timer); controller?.abort(); window.removeEventListener('message', receive); };
  }, []);
  const content = useMemo(() => toEditionContent(data, true), [data]);
  return <>
    {mediaError && <p className="live-preview-media-error" role="status">Some preview media could not load. Your text is still updating.</p>}
    <ReaderPreview content={content} development={development} readerOrigin={readerOrigin} />
  </>;
}

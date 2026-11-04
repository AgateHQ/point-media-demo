'use client';

import { useEffect, useRef, useState } from 'react';
import { phonePreview } from '../lib/preview';

export function PhonePreview({ src, live }: { src: string; live: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const origin = window.location.origin;
    const parent = window.parent !== window ? window.parent : window.opener;
    // Keep Payload's live updates and ready handshake working through the phone frame.
    function receive(event: MessageEvent) {
      if (!live || event.origin !== origin || !event.data || typeof event.data !== 'object') return;
      if (event.source === frame.current?.contentWindow && event.data.type === 'payload-live-preview' && event.data.ready === true) {
        parent?.postMessage({ type: 'payload-live-preview', ready: true }, origin);
      } else if (parent && event.source === parent
        && (event.data.type === 'payload-live-preview' || event.data.type === 'payload-document-event')) {
        frame.current?.contentWindow?.postMessage(event.data, origin);
      }
    }
    window.addEventListener('message', receive);
    // Mount the iframe only once its ready message can be received.
    setListening(true);
    return () => window.removeEventListener('message', receive);
  }, [live]);

  return <main className="phone-preview">
    <iframe
      ref={frame}
      src={listening ? src : undefined}
      title={live ? 'Live edition phone preview' : 'Saved edition phone preview'}
      width={phonePreview.width}
      height={phonePreview.height}
    />
  </main>;
}

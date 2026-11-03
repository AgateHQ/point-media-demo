import type { ReactNode } from 'react';

import './preview.css';

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,700;1,800&family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" />
  </head><body>{children}</body></html>;
}

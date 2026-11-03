import type { CollectionConfig } from 'payload';

import { publicContentAccess } from './access';
import { serveExtensionlessSvg } from '../lib/serveExtensionlessSvg';

export const Media = (mediaDir: string): CollectionConfig => ({
  slug: 'media',
  access: publicContentAccess,
  admin: { useAsTitle: 'alt', group: 'Content' },
  upload: {
    staticDir: mediaDir,
    mimeTypes: ['image/*'],
    handlers: [serveExtensionlessSvg(mediaDir)],
  },
  fields: [{
    name: 'alt',
    label: 'Description / alt text',
    type: 'text',
    required: true,
  }],
});

import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { Editions } from './collections/Editions';
import { Editors } from './collections/Editors';
import { Media } from './collections/Media';
import { Publications } from './collections/Publications';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(process.cwd(), 'data');
const mediaDir = process.env.MEDIA_DIR || path.resolve(process.cwd(), 'media');
if (!process.env.DATABASE_URL) mkdirSync(dataDir, { recursive: true });
mkdirSync(mediaDir, { recursive: true });

const secret = process.env.PAYLOAD_SECRET || (process.env.NODE_ENV !== 'production'
  ? 'point-media-local-development-secret-change-for-production'
  : '');
if (!secret) throw new Error('Set PAYLOAD_SECRET before building or running the CMS in production.');

export default buildConfig({
  secret,
  admin: {
    user: 'editors',
    importMap: { baseDir: dirname },
    meta: { titleSuffix: '· Point Media' },
    components: { beforeDashboard: ['./components/EditorialWelcome#EditorialWelcome'] },
  },
  collections: [Editions, Publications, Media(mediaDir), Editors],
  editor: lexicalEditor({ features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()] }),
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URL || `file:${path.resolve(dataDir, 'payload.db')}` },
  }),
  sharp,
  graphQL: { disable: true },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  onInit: async (payload) => {
    // A real record keeps Payload preferences and document ownership working,
    // while the custom strategy admits every visitor without a login screen.
    const { totalDocs } = await payload.count({ collection: 'editors', overrideAccess: true });
    if (!totalDocs) await payload.create({
      collection: 'editors',
      data: { name: 'Shared editor' },
      overrideAccess: true,
    });
  },
});

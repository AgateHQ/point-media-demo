import type { CollectionConfig } from 'payload';

import { anyone } from './access';

export const Editors: CollectionConfig = {
  slug: 'editors',
  admin: { hidden: true, useAsTitle: 'name' },
  auth: {
    disableLocalStrategy: true,
    strategies: [{
      name: 'open-editor',
      authenticate: async ({ payload }) => {
        const { docs } = await payload.find({
          collection: 'editors',
          limit: 1,
          depth: 0,
          overrideAccess: true,
        });
        return { user: docs[0] ? { ...docs[0], collection: 'editors' as const } : null };
      },
    }],
  },
  access: {
    admin: anyone,
    read: anyone,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [{ name: 'name', type: 'text', required: true }],
};

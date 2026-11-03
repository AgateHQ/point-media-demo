import { APIError, type CollectionConfig } from 'payload';

import { publicContentAccess } from './access';

export const Publications: CollectionConfig = {
  slug: 'publications',
  access: publicContentAccess,
  lockDocuments: false,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'headline', 'updatedAt'],
    group: 'Content',
  },
  hooks: {
    beforeDelete: [async ({ id, req }) => {
      const editions = await req.payload.count({
        collection: 'editions',
        where: { publication: { equals: id } },
        req,
      });
      if (editions.totalDocs > 0) {
        throw new APIError('Delete this publication’s editions before deleting the publication.', 400);
      }
    }],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'headline', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'editions',
      type: 'join',
      collection: 'editions',
      on: 'publication',
      defaultSort: '-startDate',
      admin: {
        allowCreate: true,
        defaultColumns: ['title', 'startDate', 'endDate'],
        description: 'Save the publication, then create and open its editions here.',
      },
    },
  ],
};

import { APIError, type CollectionConfig } from 'payload';

import { publicContentAccess } from './access';
import { uniquePublicationSlug, validPublicationSlug } from '../lib/publicationSlug';
import { defaultBrandColor, normalizeHex } from '../../src/publicationTheme';

export const Publications: CollectionConfig = {
  slug: 'publications',
  access: publicContentAccess,
  lockDocuments: false,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'brandColor', 'updatedAt'],
    preview: ({ slug }) => typeof slug === 'string' && slug ? `/${slug}` : null,
    group: 'Content',
  },
  hooks: {
    beforeValidate: [async ({ data, originalDoc, req }) => {
      if (!data) return data;
      if (!data.slug && !originalDoc?.slug) {
        data.slug = await uniquePublicationSlug(data.name || originalDoc?.name || '', async slug => {
          const { totalDocs } = await req.payload.count({ collection: 'publications', where: { slug: { equals: slug } }, req });
          return totalDocs > 0;
        });
      } else if (data.slug === '' && originalDoc?.slug) data.slug = originalDoc.slug;
      if (data.brandColor) data.brandColor = normalizeHex(data.brandColor) || data.brandColor;
      return data;
    }],
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
    {
      name: 'slug', type: 'text', unique: true, index: true,
      validate: (value: unknown) => validPublicationSlug(value) || 'Use lowercase letters, numbers and single hyphens. This address must not be reserved (such as admin, api or preview).',
      admin: { description: 'Generated from the name on first save. The public reader lives at /your-slug. Renaming the publication keeps this address.' },
    },
    { name: 'headline', type: 'text', required: true },
    {
      name: 'brandColor', label: 'Brand colour', type: 'text', defaultValue: defaultBrandColor,
      validate: (value: unknown) => Boolean(normalizeHex(value)) || 'Enter a hex colour such as #2563eb or #369.',
      admin: { description: 'One hex colour generates the masthead, buttons, accents, paper and readable text colours.' },
    },
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

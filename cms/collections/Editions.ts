import type { CollectionConfig } from 'payload';
import { date } from 'payload/shared';

import { publicContentAccess } from './access';

export const Editions: CollectionConfig = {
  slug: 'editions',
  labels: { singular: 'Edition', plural: 'Articles & editions' },
  access: publicContentAccess,
  lockDocuments: false,
  defaultSort: '-startDate',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publication', 'startDate', 'endDate'],
    group: 'Editorial',
    description: 'Write your articles, arrange their reading order, and preview the finished edition.',
    preview: ({ id }) => id ? `/preview/editions/${id}` : null,
  },
  hooks: {
    beforeValidate: [({ data, originalDoc }) => {
      if (!data) return data;
      const start = data.startDate ?? originalDoc?.startDate;
      const end = data.endDate ?? originalDoc?.endDate;
      if (typeof start === 'string' && typeof end === 'string') data.title = `${start.slice(0, 10)} — ${end.slice(0, 10)}`;
      return data;
    }],
  },
  fields: [
    {
      name: 'articleGuide',
      type: 'ui',
      admin: { components: { Field: './components/EditionGuide#EditionGuide' } },
    },
    {
      name: 'articles',
      type: 'array',
      labels: { singular: 'Article', plural: 'Articles' },
      admin: {
        initCollapsed: false,
        className: 'edition-articles',
        description: 'Write your articles here. Use Collapse All to arrange them by dragging, then save and preview the edition.',
        components: { RowLabel: './components/ArticleRowLabel#ArticleRowLabel' },
      },
      fields: [
        { name: 'title', label: 'Article headline', type: 'text', required: true },
        { name: 'body', label: 'Article text', type: 'richText', required: true },
        {
          name: 'mediaType',
          label: 'Main media',
          type: 'radio',
          required: true,
          defaultValue: 'image',
          options: [{ label: 'Image', value: 'image' }, { label: 'Video link', value: 'video' }],
          admin: { layout: 'horizontal' },
        },
        {
          name: 'mainImage',
          type: 'upload',
          relationTo: 'media',
          admin: { condition: (_, siblingData) => siblingData.mediaType === 'image' },
          validate: (value: unknown, { siblingData }: { siblingData: { mediaType?: string } }) => siblingData.mediaType === 'image' && !value
            ? 'Choose a main image.' : true,
        },
        {
          name: 'videoUrl',
          label: 'Video URL',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData.mediaType === 'video',
            description: 'A full https:// link to a video, such as YouTube, Vimeo, or an MP4.',
          },
          validate: (value: string | null | undefined, { siblingData }: { siblingData: { mediaType?: string } }) => {
            if (siblingData.mediaType !== 'video') return true;
            try {
              const url = new URL(value ?? '');
              if (url.protocol === 'https:' || url.protocol === 'http:') return true;
            } catch { /* Show the same field error for missing or malformed URLs. */ }
            return 'Enter a full http:// or https:// video URL.';
          },
        },
      ],
    },
    { name: 'title', label: 'Edition', type: 'text', admin: { position: 'sidebar', readOnly: true, description: 'Named automatically from the edition dates.' } },
    { name: 'publication', type: 'relationship', relationTo: 'publications', required: true, index: true, admin: { position: 'sidebar' } },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' } },
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' } },
      validate: async (value, options) => {
        const result = await date(value, options);
        if (result !== true) return result;
        const start = (options.siblingData as { startDate?: string }).startDate;
        if (value && start && new Date(value) < new Date(start)) return 'End date must be on or after the start date.';
        return true;
      },
    },
  ],
};

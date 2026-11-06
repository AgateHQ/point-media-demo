import config from '@payload-config';
import { getPayload } from 'payload';
import { findPublicDiscoverArticles } from '../../../../lib/publicationReader';

export async function GET() {
  const payload = await getPayload({ config });
  return Response.json(await findPublicDiscoverArticles(payload), { headers: { 'Cache-Control': 'no-store' } });
}

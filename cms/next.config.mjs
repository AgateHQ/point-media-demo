import { withPayload } from '@payloadcms/next/withPayload';
import { fileURLToPath } from 'node:url';

export default withPayload({
  poweredByHeader: false,
  output: 'standalone',
  outputFileTracingRoot: fileURLToPath(new URL('..', import.meta.url)),
  // libsql chooses its platform binding with a computed require that Next's
  // file tracer cannot discover. Include the installed native package too.
  outputFileTracingIncludes: {
    '/*': ['../node_modules/@libsql/*/index.node', '../node_modules/@libsql/*/package.json'],
  },
});

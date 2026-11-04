# syntax=docker/dockerfile:1
ARG NODE_VERSION=24.22.1
FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY cms/package.json ./cms/package.json
RUN npm ci
COPY . .
# Dynamic pages do not read editorial data at build time. This disposable
# build secret is never used by the runtime image; set PAYLOAD_SECRET on Fly.
RUN PAYLOAD_SECRET=point-media-build-only-not-a-runtime-secret \
    DATABASE_URL=file:/tmp/point-media-build.db \
    MEDIA_DIR=/tmp/point-media-build-media \
    npm run build:cms

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=8080 \
    DATABASE_URL=file:/data/payload.db \
    MEDIA_DIR=/data/media
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates gosu \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=node:node /app/cms/.next/standalone ./
COPY --from=build --chown=node:node /app/cms/.next/static ./cms/.next/static
COPY --from=build --chown=node:node /app/cms/public ./cms/public
COPY --chmod=755 scripts/docker-entrypoint.sh /usr/local/bin/point-media-entrypoint
EXPOSE 8080
ENTRYPOINT ["point-media-entrypoint"]
CMD ["node", "cms/server.js"]

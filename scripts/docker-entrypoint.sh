#!/bin/sh
set -eu
: "${PAYLOAD_SECRET:?Set PAYLOAD_SECRET as a Fly secret before starting the app}"

# Fly mounts volumes owned by root. Prepare only the persistent directories,
# then run Next/Payload as the unprivileged node user.
mkdir -p /data/media
chown -R node:node /data
exec gosu node "$@"

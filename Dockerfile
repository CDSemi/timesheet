# Timesheet application image (WP4-T04): one pinned Node base, three build stages, a small non-root runtime.
#
# Base image: node:24.21.0-trixie-slim (Debian 13, matches .nvmrc 24.21.0), pinned by the digest of its multi-arch
# image INDEX (linux/amd64 and linux/arm64 resolve from it). Recorded 2026-10-05 with:
#   docker buildx imagetools inspect node:24.21.0-trixie-slim
# Never use a moving tag such as `latest`. Bump the tag and the digest together, and rebuild.
# better-sqlite3 13.0.3 ships N-API prebuilds for linux glibc, so no compiler is installed (see O13 in WP4-PLAN);
# fall back to bookworm-slim only if that prebuilt binding ever fails to load.
ARG NODE_IMAGE_DIGEST=sha256:8ec5d7557396cfe32d21c3f9c13072355ceab22b584578ca4bb28af31120cffe

FROM node:24.21.0-trixie-slim@${NODE_IMAGE_DIGEST} AS base
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# Build stage: development dependencies, then the server (tsc) and the client (Vite) into dist/. The image ships no source
# maps and no sourceMappingURL comments (WP4-A-01): tsc gets --sourceMap false, and vite.config.ts turns build.sourcemap
# off when BUILD_SOURCEMAPS=off. Local development keeps its maps.
FROM base AS build
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY tsconfig*.json vite.config.ts ./
COPY src ./src
RUN npm run build:server -- --sourceMap false \
    && BUILD_SOURCEMAPS=off npm run build:client

# Production dependencies only. Install scripts stay off: better-sqlite3 needs none (prebuilds ship in the package).
FROM base AS prod-deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev --ignore-scripts

# Runtime stage: dist/, production node_modules and package.json ("type": "module") only. The context excludes
# reference/inputs (the template workbook), handoff/, tests/, .claude/, .agents/, docs and every .env file.
FROM base AS runtime
ENV NODE_ENV=production \
    OUTBOUND_MODE=capture \
    HOST=0.0.0.0 \
    PORT=3000 \
    DATABASE_PATH=/data/timesheet.db \
    DATA_DIR=/data/private-data
# Fixed non-root identity. A bind-mounted /data must be owned by UID/GID 10001 on the host.
RUN groupadd --gid 10001 timesheet \
    && useradd --uid 10001 --gid 10001 --no-create-home --home-dir /nonexistent --shell /usr/sbin/nologin timesheet \
    && install --directory --owner 10001 --group 10001 --mode 0700 /data
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER 10001:10001
# Database, private files (PDFs, signatures, evidence) and the outbound capture directory live here and nowhere else;
# the root filesystem can run read-only with a /tmp tmpfs.
VOLUME ["/data"]
EXPOSE 3000
# Slim images have no curl: a Node one-liner asks /api/ready (schema applied and /data writable; no personal data).
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/ready', { signal: AbortSignal.timeout(4000) }).then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
STOPSIGNAL SIGTERM
CMD ["node", "dist/server/index.js"]

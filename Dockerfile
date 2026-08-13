# Build the variant selected in lisible.config.json, or the one passed as a
# build argument: docker build --build-arg LISIBLE_VARIANT=organique .
# Versions are pinned to match .bun-version and nixpacks.toml.
FROM oven/bun:1.3.11 AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
ARG LISIBLE_VARIANT=""
ENV LISIBLE_VARIANT=$LISIBLE_VARIANT
RUN bun scripts/run.ts build
# The checked in Caddyfile is a nixpacks template; fill its only placeholder.
RUN sed 's|{{.StaticFileRoot}}|/srv|' Caddyfile > Caddyfile.resolved

FROM caddy:2.11.4-alpine
COPY --from=build /app/Caddyfile.resolved /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
EXPOSE 80

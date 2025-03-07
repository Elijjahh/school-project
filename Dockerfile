FROM oven/bun:1.1.45-slim AS base

ENV NODE_ENV=production

WORKDIR /src
COPY bun.lockb package.json ./
RUN bun install

COPY . .
RUN bun db:generate
RUN bun run build

CMD [ "bun", "docker-start" ]
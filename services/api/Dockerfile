# Base stage
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

# Install dependencies
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build stage
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter @mcp/api run build

# Production stage
FROM node:22-slim AS api
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/services/api/node_modules /app/services/api/node_modules
COPY --from=prod-deps /app/mcp/node_modules /app/mcp/node_modules
COPY --from=build /app/services/api/dist /app/services/api/dist
COPY --from=build /app/services/api/package.json /app/services/api/package.json
COPY --from=build /app/mcp/prisma /app/mcp/prisma

WORKDIR /app/services/api
EXPOSE 4000
CMD ["npm", "start"]

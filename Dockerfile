# Shared image for every service. Select one with: --build-arg SERVICE=<name>
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
COPY services ./services
RUN npm ci
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine
ARG SERVICE
ENV NODE_ENV=production SERVICE=${SERVICE}
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/services ./services
USER node
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=10 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" > /dev/null || exit 1
CMD ["sh", "-c", "exec node services/${SERVICE}/dist/index.js"]

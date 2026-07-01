FROM node:22-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/api-server build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]

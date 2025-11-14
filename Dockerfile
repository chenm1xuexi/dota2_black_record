# 如果你想进一步减小镜像体积和提高安全性
FROM node:20-alpine AS builder

# 使用 .npmrc 文件配置（更优雅）
RUN echo "registry=https://registry.npmmirror.com" > ~/.npmrc

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 分离依赖安装层，提高缓存效率
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

RUN echo "registry=https://registry.npmmirror.com" > ~/.npmrc
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# 添加超时重试机制
RUN pnpm install --frozen-lockfile --prod || \
    (sleep 5 && pnpm install --frozen-lockfile --prod)

COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/trpc/system.health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
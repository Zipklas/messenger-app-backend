# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci

# Копируем весь исходный код
COPY . .

# Генерируем Prisma Client (ОБЯЗАТЕЛЬНО перед build, иначе TS выдаст ошибки)
RUN npx prisma generate --config .config/prisma.ts

# Собираем NestJS проект
RUN npm run build

# ==========================================
# Stage 2: Runner (Production)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Копируем только необходимые файлы из builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.config ./.config

# Не запускаем от root пользователя (безопасность)
USER node

EXPOSE 3000

CMD ["node", "dist/apps/api/src/main.js"]
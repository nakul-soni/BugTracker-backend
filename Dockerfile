# ---------- Build Stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files first for Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema and generate Prisma Client
COPY prisma ./prisma
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

# Copy application source code
COPY . .

# Build NestJS application
RUN npm run build


# ---------- Production Stage ----------
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy dependency files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client in production image
RUN npx prisma generate

# Copy compiled application from builder
COPY --from=builder /app/dist ./dist

# NestJS default port
EXPOSE 3000

# Start application
CMD ["node", "dist/main"]
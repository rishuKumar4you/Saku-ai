FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Prisma schema first
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy rest of source code
COPY . .

# Build argument for backend URL
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# Build the application
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]


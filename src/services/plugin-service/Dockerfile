FROM oven/bun:1 as base
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate

EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]

FROM oven/bun:1

WORKDIR /app

# Copy root workspace files
COPY package.json bun.lockb ./

# Copy dependent packages
COPY packages/types ./packages/types
COPY packages/db ./packages/db
COPY packages/lib ./packages/lib
COPY packages/nemo ./packages/nemo
COPY packages/nemo-worker ./packages/nemo-worker

RUN bun install --frozen-lockfile --production

ENTRYPOINT ["bun", "run", "packages/nemo-worker/index.ts"]
FROM oven/bun:1

WORKDIR /app

COPY . ./

# Build front end project
RUN bun install --frozen-lockfile
RUN cd /app/packages/website && bun run build
# Serve built files under static/
RUN mkdir -p /app/packages/server/static && cp -r  /app/packages/website/dist/* /app/packages/server/static

WORKDIR /app/packages/server

ENTRYPOINT ["bun", "run", "index.ts"]
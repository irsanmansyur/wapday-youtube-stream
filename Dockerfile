FROM oven/bun AS build
WORKDIR /app

# Salin package.json + lockfile
COPY package.json bun.lock ./

# Install semua dependenci production saja
RUN bun install --production --no-cache

# Salin source
COPY . .


# Build Bun bundle
RUN bun build \
	--target bun \
	--minify-whitespace \
	--minify-syntax \
	--outfile ./dist/index.js \
	index.ts



# ===== Runtime =====
FROM oven/bun:alpine
WORKDIR /app

# Salin hasil build + node_modules + bun cache
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production

CMD ["bun", "dist/index.js"]

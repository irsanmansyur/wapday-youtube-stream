FROM oven/bun AS build

WORKDIR /app
COPY package.json ./
RUN bun install
COPY . .

RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun-linux-x64 \
	--outfile server \
	index.ts

FROM debian:bookworm-slim

RUN apt-get update && \
	apt-get install -y ffmpeg curl && \
	curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
	-o /usr/local/bin/yt-dlp && \
	chmod +x /usr/local/bin/yt-dlp && \
	apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/server server

EXPOSE 3000
CMD ["./server"]

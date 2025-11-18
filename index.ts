import cluster from "node:cluster";
import process from "node:process";
import { youtubeInfo } from "./service";

function Serve() {
	return Bun.serve({
		port: Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000,
		async fetch(req) {
			const url = new URL(req.url);
			const video = url.searchParams.get("url");
			const bitrate = url.searchParams.get("br") || "128";
			if (!video) {
				return new Response("Masukkan ?url=link_youtube", { status: 400 });
			}
			return youtubeInfo(video, +bitrate);
		},
	});
}

if (cluster.isPrimary) {
	for (let i = 0; i < +(Bun.env.SCALE || "2"); i++) cluster.fork();
} else {
	Serve();
	console.log(`Worker ${process.pid} started`);
}

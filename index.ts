import cluster from "node:cluster";
import process from "node:process";

async function pumpReadableToSink(
	readable: ReadableStream<Uint8Array>,
	sink: Bun.FileSink,
) {
	const reader = readable.getReader();

	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		sink.write(value);
	}

	sink.end();
}

export async function downloadAudio(
	url: string,
	audioBitrate = "192k",
): Promise<Response> {
	// yt-dlp fetch raw audio as stdout
	const ytdlp = Bun.spawn({
		cmd: ["yt-dlp", "-o", "-", "-f", "bestaudio", url],
		stdout: "pipe",
		stderr: "inherit",
	});

	// ffmpeg encode mp3
	const ffmpeg = Bun.spawn({
		cmd: [
			"ffmpeg",
			"-analyzeduration",
			"0",
			"-probesize",
			"32",
			"-i",
			"pipe:0",
			"-vn",
			"-acodec",
			"libmp3lame",
			"-b:a",
			audioBitrate,
			"-f",
			"mp3",
			"pipe:1",
		],
		stdin: "pipe",
		stdout: "pipe",
		stderr: "inherit",
	});

	// pump raw audio into ffmpeg
	pumpReadableToSink(ytdlp.stdout, ffmpeg.stdin);

	// return stream response
	return new Response(ffmpeg.stdout, {
		headers: {
			"Content-Type": "audio/mpeg",
			"Content-Disposition": `attachment; filename="audio_${audioBitrate}.mp3"`,
		},
	});
}

function Serve() {
	return Bun.serve({
		port: Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000,
		async fetch(req) {
			const url = new URL(req.url);
			const video = url.searchParams.get("url");
			const bitrate = url.searchParams.get("br") || "192k";

			if (!video) {
				return new Response("Masukkan ?url=link_youtube", { status: 400 });
			}

			return downloadAudio(video, bitrate);
		},
	});
}

if (cluster.isPrimary) {
	for (let i = 0; i < +(Bun.env.SCALE || "2"); i++) cluster.fork();
} else {
	Serve();
	console.log(`Worker ${process.pid} started`);
}

const yt = require("@vreden/youtube_scraper");
export async function youtubeInfo(url: string, audioBitrate = 128) {
	const audioBitrates = [92, 128, 256, 320];
	if (!audioBitrates.includes(audioBitrate)) {
		audioBitrate = 128;
	}

	// 1. Get the MP3 data (results should be a Buffer)
	const results = await yt.ytmp3(url, audioBitrate);

	// 2. Ambil stream data dari URL tersebut
	const mp3Url = results.download.url;
	const mp3Stream = await getStreamFromUrl(mp3Url);
	// 3. Kembalikan Stream dalam Response API (PENTING untuk streaming API)
	return new Response(mp3Stream, {
		status: 200,
		headers: {
			"Content-Type": "audio/mpeg", // Tipe konten MP3
			"Content-Disposition": `attachment; filename="audio.mp3"`, // Opsional: meminta browser untuk mengunduh
		},
	});
}

/**
 * Mengambil konten dari URL dan mengembalikannya sebagai Web ReadableStream.
 *
 * @param downloadUrl URL sumber data file (misalnya, URL MP3).
 * @returns Promise yang diselesaikan dengan ReadableStream dari konten file.
 */
export async function getStreamFromUrl(
	downloadUrl: string,
): Promise<ReadableStream<Uint8Array>> {
	try {
		// 1. Lakukan permintaan HTTP GET ke URL
		const response = await fetch(downloadUrl);

		// 2. Periksa status respons
		if (!response.ok) {
			throw new Error(
				`Gagal mengambil data dari URL: ${response.status} ${response.statusText}`,
			);
		}

		// 3. Pastikan body respons ada dan merupakan stream
		if (!response.body) {
			throw new Error("Body respons kosong.");
		}

		// 4. response.body adalah ReadableStream<Uint8Array> yang Anda butuhkan
		return response.body;
	} catch (error) {
		console.error("Terjadi kesalahan saat mengambil stream dari URL:", error);
		throw error;
	}
}

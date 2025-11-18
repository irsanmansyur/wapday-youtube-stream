const yt = require("@vreden/youtube_scraper");
export async function youtubeInfo(url: string, audioBitrate = 128) {
	const audioBitrates = [92, 128, 256, 320];
	if (!audioBitrates.includes(audioBitrate)) {
		audioBitrate = 128;
	}
	const results = await yt.ytmp3(url, audioBitrate);
	console.log(results);
	return new Response(results, {});
}

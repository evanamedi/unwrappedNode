import { jsonResponse } from "./handleData";

export function getTopArtists(data) {
	const artists = data.reduce((acc, entry) => {
		if (entry.artistName) {
			acc[entry.artistName] = (acc[entry.artistName] || 0) + 1;
		}
		return acc;
	}, {});

	const sortedArtists = Object.entries(artists).sort(([, a], [, b]) => b - a);

	return jsonResponse(sortedArtists);
}

export function getTopTracks(data) {
	const tracks = data.reduce((acc, entry) => {
		if (entry.trackName) {
			acc[entry.trackName] = (acc[entry.trackName] || 0) + 1;
		}
		return acc;
	}, {});

	const sortedTracks = Object.entries(tracks).sort(([, a], [, b]) => b - a);

	return jsonResponse(sortedTracks);
}

export function getListeningTrends(data) {
	const trends = data.reduce((acc, entry) => {
		const date = entry.date.toISOString().split("T")[0];
		acc[date] = (acc[date] || 0) + 1;
		return acc;
	}, {});

	return jsonResponse(trends);
}

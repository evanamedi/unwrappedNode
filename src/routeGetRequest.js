function routeGetRequest(pathname, data) {
	switch (pathname) {
		case "/top_artists":
			return getTopArtists(data);
		case "/top_tracks":
			return getTopTracks(data);
		case "/listening_trends":
			return getListeningTrends(data);
		default:
			return jsonResponse({ error: "Endpoint Not Found" }, 404);
	}
}

export { routeGetRequest };

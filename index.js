function getTopArtists(data) {
	const artists = data.reduce((acc, entry) => {
		if (entry.artistName) {
			acc[entry.artistName] = (acc[entry.artistName] || 0) + 1;
		}
		return acc;
	}, {});

	const sortedArtists = Object.entries(artists).sort(([, a], [, b]) => b - a);

	return jsonResponse(sortedArtists);
}

function getTopTracks(data) {
	const tracks = data.reduce((acc, entry) => {
		if (entry.trackName) {
			acc[entry.trackName] = (acc[entry.trackName] || 0) + 1;
		}
		return acc;
	}, {});

	const sortedTracks = Object.entries(tracks).sort(([, a], [, b]) => b - a);

	return jsonResponse(sortedTracks);
}

function getListeningTrends(data) {
	const trends = data.reduce((acc, entry) => {
		const date = entry.date.toISOString().split("T")[0];
		acc[date] = (acc[date] || 0) + 1;
		return acc;
	}, {});

	return jsonResponse(trends);
}

async function handleUpload(request) {
	const formData = await request.formData();
	const file = formData.get("file");

	if (!file) {
		return jsonResponse({ error: "No file uploaded" }, 400);
	}

	const data = JSON.parse(await file.text());
	const cleanedData = cleanAndOrganizeData(data);
	const sessionKey = generateSessionKey();

	await storeData(sessionKey, cleanedData);

	return jsonResponse({
		message: "File uploaded and data processed",
		sessionKey,
	});
}

function cleanAndOrganizeData(data) {
	return data
		.map((entry) => processEntry(entry))
		.filter((entry) => entry !== null)
		.sort((a, b) => a.date - b.date);
}

function processEntry(entry) {
	const normalizedEntry = normalizeKeys(entry);

	const trackName = findField(normalizedEntry, ["track", "name"]);
	const artistName = findField(normalizedEntry, ["artist", "name"]);
	const albumName = findField(normalizedEntry, ["album", "name"]);
	const msPlayed = findField(normalizedEntry, ["ms", "played"]);
	const date = findField(normalizedEntry, ["ts"]) || findField(normalizedEntry, ["endtime"]);

	if (!trackName || !artistName || !albumName || !msPlayed || !date) {
		return null;
	}

	return {
		trackName,
		artistName,
		albumName,
		msPlayed: parseInt(msPlayed, 10),
		date: new Date(date),
	};
}

function normalizeKeys(obj) {
	const normalized = {};
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			normalized[key.toLowerCase()] = obj[key];
		}
	}
	return normalized;
}

function findField(entry, keys) {
	for (const key in entry) {
		if (keys.every((k) => key.includes(k))) {
			const value = entry[key];
			if (value !== null && value !== "") {
				return value;
			}
		}
	}
	return null;
}

async function storeData(sessionKey, data) {
	await DATA_STORAGE.put(sessionKey, JSON.stringify(data));
}

async function retrieveData(sessionKey) {
	const data = await DATA_STORAGE.get(sessionKey, "json");
	return data;
}

function generateSessionKey() {
	return Math.random().toString(36).substr(2, 9);
}

function jsonResponse(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

async function handleRequest(request) {
	const url = new URL(request.url);

	if (request.method === "POST" && url.pathname === "/upload") {
		return await handleUpload(request);
	}

	if (request.method === "GET") {
		const sessionKey = url.searchParams.get("sessionKey");
		if (!sessionKey) {
			return jsonResponse({ error: "Session key is required" }, 400);
		}

		const data = await retrieveData(sessionKey);
		if (!data) {
			return jsonResponse({ error: "Session not found" }, 400);
		}

		return routeGetRequest(url.pathname, data);
	}

	return jsonResponse({ error: "Not Found" }, 404);
}

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

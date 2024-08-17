export async function handleUpload(request) {
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

export function cleanAndOrganizeData(data) {
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

export async function storeData(sessionKey, data) {
	await DATA_STORAGE.put(sessionKey, JSON.stringify(data));
}

export async function retrieveData(sessionKey) {
	const data = await DATA_STORAGE.get(sessionKey, "json");
	return data;
}

export function generateSessionKey() {
	return Math.random().toString(36).substr(2, 9);
}

export function jsonResponse(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

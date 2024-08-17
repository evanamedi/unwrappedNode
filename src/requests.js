import { handleUpload } from "./handleData.js";
import { routeGetRequest } from "./routeGetRequest";

export async function handleRequest(request) {
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

const { getTopArtists } = require("../src/getData");

const testData = [
	{
		trackName: "Track A",
		artistName: "Artist X",
		albumName: "Album 1",
		msPlayed: 240000,
		date: new Date("2022-01-01T10:00:00Z"),
	},
	{
		trackName: "Track B",
		artistName: "Artist Y",
		albumName: "Album 2",
		msPlayed: 300000,
		date: new Date("2022-01-01T11:00:00Z"),
	},
	{
		trackName: "Track A",
		artistName: "Artist X",
		albumName: "Album 1",
		msPlayed: 180000,
		date: new Date("2022-01-01T12:00:00Z"),
	},
	{
		trackName: "Track C",
		artistName: "Artist Z",
		albumName: "Album 3",
		msPlayed: 60000,
		date: new Date("2022-01-02T10:00:00Z"),
	},
	{
		trackName: "Track D",
		artistName: "Artist Y",
		albumName: "Album 2",
		msPlayed: 500000,
		date: new Date("2022-01-02T11:00:00Z"),
	},
];

describe("getTopArtists", () => {
	test("should return the correct count of top artists", async () => {
		const response = getTopArtists(testData);
		const result = await response.json();

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(3);
		expect(result).toEqual(
			expect.arrayContaining([
				["Artist X", 2],
				["Artist Y", 2],
				["Artist Z", 1],
			])
		);
	});

	test("should handle an empty dataset", async () => {
		const response = getTopArtists([]);
		const result = await response.json();

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(0);
	});

	test("should handle a dataset with one entry", async () => {
		const response = getTopArtists([testData[0]]);
		const result = await response.json();

		expect(result).toEqual([["Artist X", 1]]);
	});
});

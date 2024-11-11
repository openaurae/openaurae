import { describe, expect, it } from "bun:test";

import { parseBuildingAndRoom } from "./migration";

describe("test parsing room name", () => {
	it("should parse building and room", () => {
		const actual = parseBuildingAndRoom("60_G-PS02_Corridor (Comms)_Env");

		expect(actual).toEqual({
			building: "60",
			room: "G-PS02 Corridor (Comms)",
		});
	});

	it("should parse value including '.'", () => {
		const actual = parseBuildingAndRoom("60_G.25_MSM_Central_Env");

		expect(actual).toEqual({
			building: "60",
			room: "G.25 MSM Central",
		});
	});

	it("should parse value without _Env suffix", () => {
		const actual = parseBuildingAndRoom("Staging Lab_Corner B");

		expect(actual).toEqual({
			building: "Staging Lab",
			room: "Corner B",
		});
	});

	it("should parse value including space and underscores", () => {
		const actual = parseBuildingAndRoom("69_G.61_Collaboration Area_Env");

		expect(actual).toEqual({
			building: "69",
			room: "G.61 Collaboration Area",
		});
	});

	it("should parse default room name to null", () => {
		const actual = parseBuildingAndRoom("Pièce par défaut");

		expect(actual).toEqual({
			building: null,
			room: null,
		});
	});

	it("should parse empty room name to null", () => {
		const actual = parseBuildingAndRoom("");

		expect(actual).toEqual({
			building: null,
			room: null,
		});
	});
});

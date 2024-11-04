import { describe, expect, it } from "bun:test";

import { chunks } from "./array";

describe("test chunks()", () => {
	it("should work on empty arrays", () => {
		const actual = chunks([]);

		expect(actual).toEqual([]);
	});

	it("should work on arrays whose length is a multiple of the chunk size", () => {
		const actual = chunks([1, 2, 3, 4, 5, 6], 2);

		expect(actual).toEqual([
			[1, 2],
			[3, 4],
			[5, 6],
		]);
	});

	it("should work on arrays whose length is equals to the chunk size", () => {
		const actual = chunks([1, 2, 3, 4], 4);

		expect(actual).toEqual([[1, 2, 3, 4]]);
	});

	it("should work on arrays whose length is smaller than the chunk size", () => {
		const actual = chunks([1, 2, 3, 4], 10);

		expect(actual).toEqual([[1, 2, 3, 4]]);
	});

	it("should work on arrays whose length is larger than the chunk size and not a multiple", () => {
		const actual = chunks([1, 2, 3, 4, 5], 3);

		expect(actual).toEqual([
			[1, 2, 3],
			[4, 5],
		]);
	});
});

export * from "./date";

export function isNil(value: unknown): boolean {
	return value === undefined || value === null;
}

export function isNotNil(value: unknown): boolean {
	return !isNil(value);
}

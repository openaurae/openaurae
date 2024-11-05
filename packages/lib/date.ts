import { format, getTime, startOfDay } from "date-fns";

export function extractDate(date: Date): Date {
	return startOfDay(date);
}

export function toTimestamp(value?: string | Date | null): number | null {
	return value ? getTime(value) : null;
}

export function dateFromSecs(seconds: number): Date {
	return new Date(seconds * 1000);
}

export function dateToSecs(date?: Date | null): number | null {
	const t = toTimestamp(date);

	return t ? t / 1000 : null;
}

export function formatDateTime(value?: string | Date | null): string {
	return value ? format(value, "yyyy-MM-dd HH:mm:ss") : "";
}

export function formatDate(value?: string | Date | null): string {
	return value ? format(value, "yyyy-MM-dd") : "";
}

export function formatTime(value?: string | Date | null): string {
	return value ? format(value, "HH:mm:ss") : "";
}

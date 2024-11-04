import { formatDateTime } from "./date";

export type LogEvent = {
	label: string;
	level: "info" | "warn" | "error";
	message: string;
};

// TODO: use logging library such as winston to persist error logs.
export function log({ label, level, message }: LogEvent): void {
	const time = formatDateTime(new Date());

	console.log(`${time} ${level} [${label}] ${message}`);
}

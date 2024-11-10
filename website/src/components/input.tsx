import { format } from "date-fns";
import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";

export type DateTimeInputProps = ComponentProps<"input"> & {
	dateTime: Date;
	onDateTimeUpdated: (value: Date) => void;
};

export function DateTimeInput({
	dateTime,
	onDateTimeUpdated,
	...props
}: DateTimeInputProps) {
	return (
		<Input
			type="datetime-local"
			value={formatTimeInput(dateTime)}
			onChange={(e) => {
				onDateTimeUpdated(new Date(e.target.value));
			}}
			{...props}
		/>
	);
}

function formatTimeInput(date: Date): string {
	return format(date, "yyyy-MM-dd'T'HH:mm");
}

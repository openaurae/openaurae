import { format } from "date-fns";
import type { ComponentProps } from "react";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export type DateTimeInputProps = ComponentProps<"input"> & {
	dateTime: Date;
	onDateTimeUpdated: (value: Date) => void;
};

const schema = z.coerce.date();

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
				const { data: date, success } = schema.safeParse(e.target.value);

				if (!success || !date) {
					toast({ title: "Invalid Date format" });
					return;
				}
				onDateTimeUpdated(date);
			}}
			{...props}
		/>
	);
}

function formatTimeInput(date: Date): string {
	return format(date, "yyyy-MM-dd'T'HH:mm");
}

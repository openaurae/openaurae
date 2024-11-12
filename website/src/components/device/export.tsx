import { subMonths } from "date-fns";
import { Loader2 } from "lucide-react";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { DateRange } from "react-day-picker";
import { Link } from "react-router-dom";

import { DatePickerWithRange } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useDevice } from "@/hooks/use-device";
import type { Device } from "@openaurae/types";

export function ExportReadings({
	device,
	children,
}: { device: Device; children: ReactNode }) {
	const { preSignReadings } = useDevice(device.id);

	const lastRecord = useMemo(() => {
		return device.last_record ? new Date(device.last_record) : new Date();
	}, [device]);

	const [date, setDate] = useState<DateRange | undefined>({
		from: subMonths(lastRecord, 1),
		to: lastRecord,
	});

	const [preSignedUrl, setPreSignedUrl] = useState<string>("");
	const [open, setOpen] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const updateUrl = useCallback(
		async (date: DateRange | undefined) => {
			if (!date?.from || !date?.to) {
				return;
			}

			setLoading(true);
			setDate(date);

			setPreSignedUrl(await preSignReadings(date as DateRange));
			setLoading(false);
		},
		[preSignReadings],
	);

	useEffect(() => {
		setLoading(true);
		updateUrl(date).then(() => setLoading(false));
	}, [date, updateUrl]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger onClick={() => setOpen(true)}>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Export Device Readings</DialogTitle>
					<DialogDescription>
						Download device readings within the specified time range as a csv
						file.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="flex gap-4 items-center">
						<span className="text-sm font-semibold">Time Range</span>
						<DatePickerWithRange date={date} onDateSelected={updateUrl} />
					</div>
				</div>
				<DialogFooter>
					<Link download to={preSignedUrl}>
						<Button disabled={loading || !preSignedUrl}>
							{loading && <Loader2 className="animate-spin" />}Export
						</Button>
					</Link>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

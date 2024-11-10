import type { Sensor } from "@openaurae/types";
import { Loader2 } from "lucide-react";
import { type ReactNode, useState } from "react";

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

export function UnpairSensor({
	sensor,
	children,
	closeInfoCard,
}: { children: ReactNode; sensor: Sensor; closeInfoCard: () => void }) {
	const { deleteSensor } = useDevice(sensor.device);
	const [open, setOpen] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger onClick={() => setOpen(true)}>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Unpair Sensor</DialogTitle>
					<DialogDescription>
						Sensor will stop sending readings to the MQTT broker and the related
						sensor record will be deleted from the database.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						disabled={loading}
						variant="destructive"
						onClick={async () => {
							setLoading(true);
							await deleteSensor(sensor.id);
							setLoading(false);
							setOpen(false);
							closeInfoCard();
						}}
					>
						{loading && <Loader2 className="animate-spin" />} Confirm Unpair
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

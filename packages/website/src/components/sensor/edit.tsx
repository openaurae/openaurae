import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDevice } from "@/hooks/use-device";
import {
	type Sensor,
	type UpdateSensor,
	UpdateSensorSchema,
} from "@openaurae/types";
import { toast } from "sonner";

export function EditSensor({
	sensor,
	children,
}: { sensor: Sensor; children: ReactNode }) {
	const { updateSensor } = useDevice(sensor.device);
	const [open, setOpen] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const form = useForm<UpdateSensor>({
		resolver: zodResolver(UpdateSensorSchema),
		defaultValues: {
			...sensor,
		},
	});

	async function onSubmit(values: UpdateSensor) {
		setLoading(true);

		try {
			await updateSensor(sensor.id, values);
			form.reset();
			setOpen(false);
		} catch (e: unknown) {
			toast("Error Adding Sensor", {
				description:
					e instanceof AxiosError ? e.response?.data : "Unexpected error",
			});
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger onClick={() => setOpen(true)}>{children}</DialogTrigger>

			<DialogContent className="w-[400px]">
				<DialogHeader>
					<DialogTitle>Edit Sensor Information</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="px-6 py-4 grid gap-6"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} value={field.value || undefined} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter className="mt-8">
							<Button disabled={loading}>
								{loading && <Loader2 className="animate-spin" />} Submit
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

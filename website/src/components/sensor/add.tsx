import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDevice } from "@/hooks/use-device";
import { toast } from "@/hooks/use-toast";
import { formatSensorType } from "@/lib/utils";
import {
	type AddZigbeeSensor,
	AddZigbeeSensorSchema,
	ZigbeeSensorTypeSchema,
} from "@openaurae/types";
import { Loader2 } from "lucide-react";

export function AddSensor({
	deviceId,
	children,
}: { deviceId: string; children: ReactNode }) {
	const { addZigbeeSensor } = useDevice(deviceId);
	const [open, setOpen] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const form = useForm<AddZigbeeSensor>({
		resolver: zodResolver(AddZigbeeSensorSchema),
		defaultValues: {
			type: "zigbee_temp",
		},
	});

	async function onSubmit(values: AddZigbeeSensor) {
		setLoading(true);

		try {
			await addZigbeeSensor(values);
			form.reset();
			setOpen(false);
		} catch (e: unknown) {
			const message =
				e instanceof AxiosError ? e.response?.data : "Unexpected error";
			toast({ title: "Error Adding Sensor", description: message });
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger onClick={() => setOpen(true)}>{children}</DialogTrigger>

			<DialogContent className="w-[400px]">
				<DialogHeader>
					<DialogTitle>Add Sensor</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="px-6 py-4 grid gap-6"
					>
						<FormField
							control={form.control}
							name="id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Id <span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Type <span className="text-red-500">*</span>
									</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select sensor type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{ZigbeeSensorTypeSchema.options.map((type) => (
												<SelectItem key={type} value={type}>
													{formatSensorType(type)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
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

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
import { useDevices } from "@/hooks/use-device";
import {
	type AddDevice,
	AddDeviceSchema,
	type DeviceType,
} from "@openaurae/types";
import { toast } from "sonner";

export function AddNewDevice({
	type,
	children,
}: { type: DeviceType; children: ReactNode }) {
	const { addDevice } = useDevices({ type });
	const [open, setOpen] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const form = useForm<AddDevice>({
		resolver: zodResolver(AddDeviceSchema),
		defaultValues: {
			type,
		},
	});

	async function onSubmit(values: AddDevice) {
		setLoading(true);

		try {
			await addDevice(values);
			form.reset();
			setOpen(false);
		} catch (e: unknown) {
			const message =
				e instanceof AxiosError ? e.response?.data : "Unexpected error";
			toast("Error Adding Device", {
				description: message,
			});
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild onClick={() => setOpen(true)}>{children}</DialogTrigger>

			<DialogContent className="w-[400px]">
				<DialogHeader>
					<DialogTitle>Add Device</DialogTitle>
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
									<FormLabel>
										Name <span className="text-red-500">*</span>
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
							name="latitude"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Latitude</FormLabel>
									<FormControl>
										<Input {...field} value={field.value ?? undefined} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="longitude"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Longitude</FormLabel>
									<FormControl>
										<Input {...field} value={field.value ?? undefined} />
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

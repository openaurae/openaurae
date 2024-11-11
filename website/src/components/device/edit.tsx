import { zodResolver } from "@hookform/resolvers/zod";
import {
	type Device,
	type UpdateDevice,
	UpdateDeviceSchema,
} from "@openaurae/types";
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

export function EditDevice({
	device,
	children,
}: { device: Device; children: ReactNode }) {
	const { updateDevice } = useDevice(device.id);
	const [open, setOpen] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const form = useForm<UpdateDevice>({
		resolver: zodResolver(UpdateDeviceSchema),
		defaultValues: {
			...device,
		},
	});

	async function onSubmit(values: UpdateDevice) {
		setLoading(true);

		await updateDevice(values);

		setLoading(false);
		setOpen(false);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger onClick={() => setOpen(true)}>{children}</DialogTrigger>
			<DialogContent className="w-[400px]">
				<DialogHeader>
					<DialogTitle>Edit Device Information</DialogTitle>
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
										<Input {...field} />
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
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button disabled={loading}>
								{loading && <Loader2 className="animate-spin" />} Save
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

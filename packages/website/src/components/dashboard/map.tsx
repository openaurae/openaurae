import { AnimatePresence, motion } from "framer-motion";
import { type ComponentProps, useMemo, useState } from "react";
import { Marker, Map as ReactMap, type ViewState } from "react-map-gl";

import { DefaultSection } from "@/components/default";
import { DeviceOverview } from "@/components/device/card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevices } from "@/hooks/use-device";
import { cn, formatDeviceType } from "@/lib/utils";
import { getOne } from "@openaurae/lib";
import { type DeviceType, DeviceTypeSchema } from "@openaurae/types";

export type MapViewPort = Pick<ViewState, "longitude" | "latitude" | "zoom">;

export type DevicesMapProps = {
	mapStyle: string;
	viewPort: MapViewPort;
	height?: string | number;
};

export const DevicesMap = ({ viewPort, mapStyle, height }: DevicesMapProps) => {
	const { devices, isLoading, error } = useDevices();
	const [viewState, setViewState] = useState<MapViewPort>(viewPort);
	const [deviceId, setDeviceId] = useState<string | null>(null);

	const selectedDevice = useMemo(() => {
		if (!devices || !deviceId) {
			return null;
		}

		return getOne(devices, (device) => device.id === deviceId);
	}, [devices, deviceId]);

	if (error) {
		return <DefaultSection message="Error loading devices." />;
	}

	if (isLoading || !devices) {
		return <Skeleton className="w-full h-full rounded-2xl" />;
	}

	return (
		<ReactMap
			{...viewState}
			minZoom={11}
			maxZoom={19}
			mapboxAccessToken="pk.eyJ1IjoibW9uYXNoYXVyYWUiLCJhIjoiY2pyMGJqbzV2MDk3dTQ0bndqaHA4d3hzeSJ9.TDvqYvsmY1DHhE8N8_UbFg"
			style={{ width: "100%", height: height ?? "100%" }}
			mapStyle={mapStyle}
			onMove={(e) => setViewState(e.viewState)}
			onZoom={(e) => setViewState(e.viewState)}
		>
			{devices
				.filter((device) => device.longitude && device.latitude)
				.map((device) => (
					<Marker
						style={{ cursor: "pointer" }}
						key={device.id}
						longitude={device.longitude ?? 0}
						latitude={device.latitude ?? 0}
						onClick={() => {
							setDeviceId(device.id);
						}}
					>
						<Pin type={device.type} />
					</Marker>
				))}
			<Card className="absolute w-[120px] h-[120px] right-5 top-5 grid justify-center items-center gap-4 py-4">
				{DeviceTypeSchema.options.map((type) => (
					<div className="w-full flex gap-2 items-center mx-auto" key={type}>
						<div
							className={cn(
								"h-2.5 w-2.5 shrink-0 rounded-[2px]",
								pinColors[type],
							)}
						/>
						{formatDeviceType(type)}
					</div>
				))}
			</Card>

			{selectedDevice && (
				<AnimatePresence mode={"wait"}>
					<motion.div
						initial="initialState"
						animate="animateState"
						exit="exitState"
						transition={{
							type: "tween",
							duration: 0.5,
						}}
						variants={{
							initialState: {
								opacity: 0,
							},
							animateState: {
								opacity: 1,
							},
							exitState: {
								opacity: 0,
							},
						}}
					>
						<DeviceOverview
							key={selectedDevice.id}
							className="absolute bottom-10 left-5"
							clickable={false}
							closeable
							device={selectedDevice}
							onClose={() => setDeviceId(null)}
						/>
					</motion.div>
				</AnimatePresence>
			)}
		</ReactMap>
	);
};

const pinColors: Record<DeviceType, string> = {
	air_quality: "bg-sky-600",
	zigbee: "bg-lime-600",
	nemo_cloud: "bg-slate-600",
};

const Pin = ({
	className,
	type,
	...props
}: ComponentProps<"div"> & { type: DeviceType }) => {
	return (
		<div
			{...props}
			className={cn("h-4 w-4 rounded-full", pinColors[type], className)}
		/>
	);
};

import { type VariantProps, cva } from "class-variance-authority";
import type {
	ComponentProps,
	ComponentType,
	ReactNode,
	SVGAttributes,
} from "react";

import { iconsVariants } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const iotCardVariants = cva("min-w-sm shadow-md", {
	variants: {
		status: {
			active: "bg-gradient-to-br from-blue-50 via-blue-50/40 to-blue-100",
			inactive: "bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100",
		},
	},
	defaultVariants: {
		status: "active",
	},
});

export type IoTCardProps = VariantProps<typeof iotCardVariants> &
	ComponentProps<"div"> & {
		clickable?: boolean;
	};

export function IoTCard({
	className,
	children,
	status,
	clickable = false,
	...props
}: IoTCardProps) {
	return (
		<Card
			className={cn(
				iotCardVariants({ status, className }),
				clickable
					? "cursor-pointer transition ease-in-out delay-150 hover:scale-105 duration-300"
					: null,
			)}
			{...props}
		>
			{children}
		</Card>
	);
}

export function IoTCardHeader({
	className,
	children,
	title,
}: ComponentProps<"div"> & {
	title: string;
}) {
	return (
		<CardHeader className={cn("space-y-1", className)}>
			<div className="flex items-center justify-between">
				<CardTitle className="text-xl font-semibold">{title}</CardTitle>
				{children}
			</div>
		</CardHeader>
	);
}

export function IoTCardActions({ className, children }: ComponentProps<"div">) {
	return (
		<div className={cn("flex items-center gap-4", className)}>{children}</div>
	);
}

export type IoTCardActionProps<P extends object> = {
	Icon: ComponentType<P>;
	tooltip: string;
};

export function IoTCardAction({
	tooltip,
	children,
}: { tooltip: string; children: ReactNode }) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger
					asChild
					className={iconsVariants({ variant: "action" })}
				>
					{children}
				</TooltipTrigger>
				<TooltipContent>
					<p>{tooltip}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

const iotCardContentVariants = cva("grid items-center", {
	variants: {
		size: {
			sm: "grid-cols-1 gap-1",
			md: "grid-cols-2 gap-2",
		},
	},
	defaultVariants: {
		size: "sm",
	},
});

export function IoTCardContent({
	size,
	className,
	children,
}: VariantProps<typeof iotCardContentVariants> & ComponentProps<"div">) {
	return (
		<CardContent
			className={cn(iotCardContentVariants({ size }), "space-y-1", className)}
		>
			{children}
		</CardContent>
	);
}

export function IoTCardItem<P extends object>({
	label,
	Icon,
	children,
}: {
	label: string;
	Icon: ComponentType<SVGAttributes<P>>;
	children: ReactNode;
}) {
	return (
		<div className="flex items-center space-x-2">
			<Icon className={iconsVariants({ variant: "label" })} />
			<div className="text-sm">
				<span className="font-medium">{label}</span>
				<div className="text-gray-600">{children}</div>
			</div>
		</div>
	);
}

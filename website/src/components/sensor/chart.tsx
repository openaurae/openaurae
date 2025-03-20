import type { CSSProperties, ReactNode } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from "recharts";

import { DefaultSection } from "@/components/default";
import { Card } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useSensorReadings } from "@/hooks/use-device";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatHourMinutes, formatTime, isNotNil } from "@openaurae/lib";
import {
	type MetricName,
	type Reading,
	type Sensor,
	metricsMetadata,
} from "@openaurae/types";

export type SensorMetricChartProps = {
	sensor: Sensor;
	start: Date;
	end: Date;
	metricNames: MetricName[];
	className?: string;
};

export function SensorMetricChart({
	className,
	sensor,
	start,
	end,
	metricNames,
}: SensorMetricChartProps) {
	const { toast } = useToast();
	const { readings, isLoading, error } = useSensorReadings({
		sensor,
		start,
		end,
	});

	if (error || metricNames.length === 0) {
		toast({ title: "Error", description: "Error getting sensor metrics" });

		return <DefaultSection message="Error getting emtrics." />;
	}

	if (isLoading || !readings) {
		return (
			<Card className={cn("w-full h-full", className)}>
				<Skeleton className="w-full h-full" />
			</Card>
		);
	}

	const valueType = metricsMetadata[metricNames[0]].type;

	const filtered = readings.filter((reading) =>
		metricNames.some((metricName) => isNotNil(reading[metricName])),
	);

	if (filtered.length === 0 || valueType === "string") {
		return <DefaultSection message="No sensor readings." />;
	}

	const Chart = valueType === "number" ? MetricsLineChart : MetricsBarChart;

	return (
		<Card className={cn("w-full h-full", className)}>
			<Chart
				className="w-full min-h-[300px] max-h-[380px]"
				readings={filtered}
				metricNames={metricNames}
			/>
		</Card>
	);
}

function transformBoolValues(
	reading: Reading,
	metricsNames: MetricName[],
): Record<string, unknown> {
	const result: Record<string, unknown> = { ...reading };

	for (const name of metricsNames) {
		result[name] = result[name] === true ? 1 : 0.1;
	}

	return result;
}

function MetricsBarChart({
	readings,
	metricNames,
	className,
}: {
	readings: Reading[];
	metricNames: MetricName[];
	className?: string;
}) {
	const data = readings.map((reading) =>
		transformBoolValues(reading, metricNames),
	);

	return (
		<ChartContainer className={className} config={chartConfig(metricNames)}>
			<BarChart
				accessibilityLayer
				data={data}
				margin={{
					top: 20,
					bottom: 16,
					left: 50,
					right: 50,
				}}
			>
				<CartesianGrid vertical={false} />

				<XAxis
					dataKey="time"
					tickLine={false}
					axisLine={false}
					tickMargin={10}
					minTickGap={32}
					tickFormatter={(value) => {
						const date = new Date(value);
						return formatHourMinutes(date);
					}}
				/>
				<YAxis domain={[0, 1.2]} type="number" hide />
				{metricNames.map((metricName) => (
					<Bar
						key={metricName}
						dataKey={metricName}
						fill={`var(--color-${metricName})`}
						radius={2}
					/>
				))}

				{metricNames.length > 1 && (
					<ChartLegend content={<ChartLegendContent />} />
				)}

				<ChartTooltip
					cursor={false}
					content={
						<ChartTooltipContent
							className="w-[180px]"
							nameKey="time"
							labelFormatter={formatTooltipLabel}
							formatter={(value, name) =>
								formatTooltipContent(value === 1, name as MetricName)
							}
						/>
					}
				/>
			</BarChart>
		</ChartContainer>
	);
}

function MetricsLineChart({
	readings,
	metricNames,
	className,
}: {
	readings: Reading[];
	metricNames: MetricName[];
	className?: string;
}) {
	return (
		<ChartContainer className={className} config={chartConfig(metricNames)}>
			<LineChart
				accessibilityLayer
				data={readings}
				margin={{
					top: 20,
					bottom: 20,
					left: 50,
					right: 50,
				}}
			>
				<CartesianGrid vertical={false} />
				<XAxis
					dataKey="time"
					tickLine={false}
					axisLine={false}
					tickMargin={10}
					minTickGap={32}
					tickFormatter={(value) => {
						const date = new Date(value);
						return formatHourMinutes(date);
					}}
				/>
				<YAxis
					axisLine={false}
					domain={[
						(dataMin: number) => Math.floor(dataMin * 0.99),
						(dataMax: number) => Math.ceil(dataMax * 1.01),
					]}
					tickLine={false}
					tickMargin={10}
					type="number"
					tickCount={10}
					width={10}
				/>
				{metricNames.map((metricName) => (
					<Line
						key={metricName}
						dataKey={metricName}
						type="monotone"
						dot={false}
						stroke={`var(--color-${metricName})`}
						strokeWidth={1.5}
					/>
				))}

				{metricNames.length > 1 && (
					<ChartLegend content={<ChartLegendContent />} />
				)}

				<ChartTooltip
					content={
						<ChartTooltipContent
							className="w-[180px]"
							nameKey="time"
							labelFormatter={formatTooltipLabel}
							formatter={(value, name) =>
								formatTooltipContent(
									value as number | boolean,
									name as MetricName,
								)
							}
						/>
					}
				/>
			</LineChart>
		</ChartContainer>
	);
}

function chartConfig(metricNames: MetricName[]): ChartConfig {
	const config: Partial<Record<MetricName, { label: string; color: string }>> =
		{};

	metricNames.forEach((metricName, index) => {
		const color = `hsl(var(--chart-${index + 1}))`;
		const { displayName } = metricsMetadata[metricName];

		config[metricName] = {
			label: displayName,
			color,
		};
	});

	return config;
}

function formatTooltipLabel(value: string): ReactNode {
	const date = new Date(value);

	return (
		<div className="flex justify-between items-center">
			<span>
				{date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					year: "numeric",
				})}
			</span>
			<span>{formatTime(date)}</span>
		</div>
	);
}

function formatTooltipContent(
	value: number | boolean,
	name: MetricName,
): ReactNode {
	const { displayName, unit, type } = metricsMetadata[name];

	return (
		<>
			<div
				className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
				style={
					{
						"--color-bg": `var(--color-${name})`,
					} as CSSProperties
				}
			/>
			{displayName}
			<div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
				{type === "number" ? Number(value).toFixed(2) : value.toString()}
				<span className="font-normal text-muted-foreground">{unit}</span>
			</div>
		</>
	);
}

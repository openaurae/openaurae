import { Card } from "@/components/ui/card";

export function DefaultSection({ message }: { message: string }) {
	return (
		<Card className="w-full h-full bg-slate-200/40 grid justify-center items-center">
			<p className="text-lg text-muted-foreground">{message}</p>
		</Card>
	);
}

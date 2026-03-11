"use client";

interface ProgressBarProps {
	current: number;
	total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
	const percentage = (current / total) * 100;

	return (
		<div className="mb-8">
			<div className="flex items-center justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
				<span>Step {current} of {total}</span>
				<span>{Math.round(percentage)}%</span>
			</div>
			<div
				className="mt-2 h-1 w-full overflow-hidden rounded-full"
				style={{ background: "var(--muted)" }}
			>
				<div
					className="h-full rounded-full transition-all duration-500 ease-out"
					style={{
						width: `${percentage}%`,
						background: "var(--primary)",
					}}
				/>
			</div>
		</div>
	);
}

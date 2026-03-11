"use client";

interface ProgressBarProps {
	step: number;
	total: number;
}

export function ProgressBar({ step, total }: ProgressBarProps) {
	return (
		<div
			style={{
				height: 2,
				background: "var(--border-light)",
				position: "sticky",
				top: 0,
				zIndex: 20,
			}}
		>
			<div
				style={{
					height: "100%",
					background: "var(--accent)",
					width: `${(step / total) * 100}%`,
					transition: "width 0.4s ease",
				}}
			/>
		</div>
	);
}

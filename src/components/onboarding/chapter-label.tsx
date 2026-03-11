"use client";

interface ChapterLabelProps {
	chapter: string;
	step: number;
	total: number;
}

export function ChapterLabel({ chapter, step, total }: ChapterLabelProps) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 8,
				marginBottom: 32,
			}}
		>
			<span
				style={{
					fontSize: 11,
					letterSpacing: "0.14em",
					textTransform: "uppercase",
					color: "var(--accent)",
					fontFamily: "var(--font-body), sans-serif",
					fontWeight: 500,
				}}
			>
				{chapter}
			</span>
			<span
				style={{
					width: 3,
					height: 3,
					borderRadius: "50%",
					background: "var(--border)",
					display: "inline-block",
				}}
			/>
			<span
				style={{
					fontSize: 11,
					color: "var(--ink-muted)",
					fontFamily: "var(--font-body), sans-serif",
				}}
			>
				{step} of {total}
			</span>
		</div>
	);
}

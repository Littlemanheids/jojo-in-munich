"use client";

interface SliderInputProps {
	value: number;
	onChange: (value: number) => void;
	min: number;
	max: number;
	labels?: { left: string; right: string };
}

export function SliderInput({
	value,
	onChange,
	min,
	max,
	labels,
}: SliderInputProps) {
	const pct = ((value - min) / (max - min)) * 100;

	return (
		<div style={{ paddingBottom: 8 }}>
			<input
				type="range"
				min={min}
				max={max}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				style={{
					width: "100%",
					height: 2,
					background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--border) ${pct}%, var(--border) 100%)`,
					outline: "none",
					cursor: "pointer",
				}}
			/>
			{labels && (
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						marginTop: 14,
					}}
				>
					<span
						style={{
							fontSize: 12,
							color: "var(--ink-muted)",
							fontFamily: "var(--font-body), sans-serif",
						}}
					>
						{labels.left}
					</span>
					<span
						style={{
							fontSize: 12,
							color: "var(--ink-muted)",
							fontFamily: "var(--font-body), sans-serif",
						}}
					>
						{labels.right}
					</span>
				</div>
			)}
		</div>
	);
}

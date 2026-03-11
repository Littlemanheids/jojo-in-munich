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
	return (
		<div>
			<input
				type="range"
				min={min}
				max={max}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				className="w-full accent-current"
			/>
			{labels && (
				<div
					className="mt-1 flex justify-between text-xs"
					style={{ color: "var(--muted-foreground)" }}
				>
					<span>{labels.left}</span>
					<span>{labels.right}</span>
				</div>
			)}
		</div>
	);
}

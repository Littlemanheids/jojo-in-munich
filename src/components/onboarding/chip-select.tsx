"use client";

interface ChipSelectProps {
	options: readonly string[];
	selected: string[];
	onChange: (selected: string[]) => void;
	maxSelect?: number;
}

export function ChipSelect({
	options,
	selected,
	onChange,
	maxSelect,
}: ChipSelectProps) {
	function toggle(option: string) {
		if (selected.includes(option)) {
			onChange(selected.filter((s) => s !== option));
		} else if (!maxSelect || selected.length < maxSelect) {
			onChange([...selected, option]);
		}
	}

	return (
		<div className="flex flex-wrap gap-2">
			{options.map((option) => {
				const isSelected = selected.includes(option);
				return (
					<button
						key={option}
						type="button"
						onClick={() => toggle(option)}
						className="rounded-full border px-4 py-2 text-sm transition-all"
						style={{
							borderColor: isSelected ? "var(--primary)" : "var(--border)",
							background: isSelected ? "var(--primary)" : "transparent",
							color: isSelected
								? "var(--primary-foreground)"
								: "var(--foreground)",
						}}
					>
						{option}
					</button>
				);
			})}
		</div>
	);
}

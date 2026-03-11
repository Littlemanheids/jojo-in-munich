"use client";

import { motion } from "framer-motion";

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
					<motion.button
						key={option}
						type="button"
						onClick={() => toggle(option)}
						whileTap={{ scale: 0.95 }}
						className="rounded-full border px-5 py-2.5 text-sm transition-colors"
						style={{
							borderColor: isSelected ? "var(--accent)" : "var(--border)",
							background: isSelected ? "var(--accent)" : "transparent",
							color: isSelected
								? "var(--accent-foreground)"
								: "var(--foreground)",
							boxShadow: isSelected ? "var(--shadow-sm)" : "none",
						}}
					>
						{option}
					</motion.button>
				);
			})}
		</div>
	);
}

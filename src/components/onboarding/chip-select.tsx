"use client";

import { motion } from "framer-motion";
import { useState } from "react";

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
	const [customValue, setCustomValue] = useState("");
	const [showInput, setShowInput] = useState(false);

	function toggle(option: string) {
		if (selected.includes(option)) {
			onChange(selected.filter((s) => s !== option));
		} else if (!maxSelect || selected.length < maxSelect) {
			onChange([...selected, option]);
		}
	}

	function addCustom() {
		const trimmed = customValue.trim();
		if (trimmed && !selected.includes(trimmed)) {
			onChange([...selected, trimmed]);
			setCustomValue("");
			setShowInput(false);
		}
	}

	// Custom entries are those not in the original options
	const customEntries = selected.filter(
		(s) => !options.includes(s as (typeof options)[number]),
	);

	return (
		<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
			{options.map((option) => {
				const isSelected = selected.includes(option);
				return (
					<motion.button
						key={option}
						type="button"
						onClick={() => toggle(option)}
						whileTap={{ scale: 0.95 }}
						style={{
							background: isSelected ? "var(--ink)" : "transparent",
							border: `1.5px solid ${isSelected ? "var(--ink)" : "var(--border)"}`,
							borderRadius: 100,
							padding: "9px 18px",
							fontSize: 14,
							color: isSelected ? "var(--bg)" : "var(--ink)",
							cursor: "pointer",
							fontFamily: "var(--font-body), sans-serif",
							transition: "all 0.15s ease",
						}}
					>
						{option}
					</motion.button>
				);
			})}

			{/* Custom entries */}
			{customEntries.map((entry) => (
				<motion.button
					key={entry}
					type="button"
					onClick={() => toggle(entry)}
					whileTap={{ scale: 0.95 }}
					style={{
						background: "var(--ink)",
						border: "1.5px solid var(--ink)",
						borderRadius: 100,
						padding: "9px 18px",
						fontSize: 14,
						color: "var(--bg)",
						cursor: "pointer",
						fontFamily: "var(--font-body), sans-serif",
						transition: "all 0.15s ease",
					}}
				>
					{entry} ×
				</motion.button>
			))}

			{/* Something else toggle */}
			{!showInput ? (
				<motion.button
					type="button"
					onClick={() => setShowInput(true)}
					whileTap={{ scale: 0.95 }}
					style={{
						background: "transparent",
						border: "1.5px dashed var(--border)",
						borderRadius: 100,
						padding: "9px 18px",
						fontSize: 14,
						color: "var(--ink-muted)",
						cursor: "pointer",
						fontFamily: "var(--font-body), sans-serif",
						transition: "all 0.15s ease",
					}}
				>
					+ something else
				</motion.button>
			) : (
				<div style={{ display: "flex", gap: 6, alignItems: "center" }}>
					<input
						type="text"
						value={customValue}
						onChange={(e) => setCustomValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") addCustom();
							if (e.key === "Escape") {
								setShowInput(false);
								setCustomValue("");
							}
						}}
						placeholder="Type here..."
						autoFocus
						style={{
							background: "var(--bg-white)",
							border: "1.5px solid var(--accent)",
							borderRadius: 100,
							padding: "9px 16px",
							fontSize: 14,
							color: "var(--ink)",
							fontFamily: "var(--font-body), sans-serif",
							outline: "none",
							width: 160,
						}}
					/>
					<button
						type="button"
						onClick={addCustom}
						style={{
							background: customValue.trim()
								? "var(--ink)"
								: "var(--border-light)",
							border: "none",
							borderRadius: 100,
							padding: "9px 14px",
							fontSize: 13,
							color: customValue.trim() ? "var(--bg)" : "var(--border)",
							cursor: customValue.trim() ? "pointer" : "default",
							fontFamily: "var(--font-body), sans-serif",
						}}
					>
						Add
					</button>
				</div>
			)}
		</div>
	);
}

"use client";

import { staggerItem } from "@/lib/animations";
import { motion } from "framer-motion";

interface ScenarioCardProps {
	label: string;
	letter: string;
	selected: boolean;
	onClick: () => void;
}

export function ScenarioCard({
	label,
	letter,
	selected,
	onClick,
}: ScenarioCardProps) {
	return (
		<motion.button
			type="button"
			onClick={onClick}
			variants={staggerItem}
			whileTap={{ scale: 0.97 }}
			style={{
				background: selected ? "var(--accent)" : "transparent",
				border: `1.5px solid ${selected ? "var(--accent)" : "var(--border)"}`,
				borderRadius: 14,
				padding: "15px 20px",
				textAlign: "left" as const,
				cursor: "pointer",
				display: "flex",
				alignItems: "flex-start",
				gap: 14,
				transition: "all 0.18s ease",
				width: "100%",
			}}
		>
			<span
				style={{
					fontSize: 10,
					color: selected ? "var(--bg)" : "var(--border)",
					fontFamily: "var(--font-body), sans-serif",
					letterSpacing: "0.1em",
					paddingTop: 2,
					minWidth: 14,
				}}
			>
				{letter}
			</span>
			<span
				style={{
					fontSize: 15,
					color: selected ? "var(--bg)" : "var(--ink)",
					fontFamily: "var(--font-body), sans-serif",
					fontWeight: selected ? 500 : 400,
					lineHeight: 1.45,
				}}
			>
				{label}
			</span>
		</motion.button>
	);
}

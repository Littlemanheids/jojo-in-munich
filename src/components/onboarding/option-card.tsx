"use client";

import { motion } from "framer-motion";
import { staggerItem } from "@/lib/animations";

interface OptionCardProps {
	label: string;
	description?: string;
	selected: boolean;
	onClick: () => void;
}

export function OptionCard({
	label,
	description,
	selected,
	onClick,
}: OptionCardProps) {
	return (
		<motion.button
			type="button"
			onClick={onClick}
			variants={staggerItem}
			whileTap={{ scale: 0.97 }}
			style={{
				background: selected ? "var(--ink)" : "var(--bg-white)",
				border: `1.5px solid ${selected ? "var(--ink)" : "var(--border)"}`,
				borderRadius: 14,
				padding: "16px 20px",
				textAlign: "left" as const,
				cursor: "pointer",
				transition: "all 0.18s ease",
				width: "100%",
			}}
		>
			<div
				style={{
					fontSize: 16,
					fontWeight: 500,
					color: selected ? "var(--bg)" : "var(--ink)",
					fontFamily: "var(--font-body), sans-serif",
					letterSpacing: "-0.01em",
				}}
			>
				{label}
			</div>
			{description && (
				<div
					style={{
						fontSize: 13,
						color: selected ? "#B0A08A" : "var(--ink-muted)",
						marginTop: 3,
						fontFamily: "var(--font-body), sans-serif",
						lineHeight: 1.4,
					}}
				>
					{description}
				</div>
			)}
		</motion.button>
	);
}

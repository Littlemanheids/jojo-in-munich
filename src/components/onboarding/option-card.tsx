"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

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
			whileTap={{ scale: 0.98 }}
			className="w-full rounded-xl border p-5 text-left transition-colors"
			style={{
				borderColor: selected ? "var(--accent)" : "var(--border)",
				borderLeftWidth: selected ? "3px" : "1px",
				borderLeftColor: selected ? "var(--accent)" : "var(--border)",
				background: selected ? "var(--accent-muted)" : "transparent",
				boxShadow: selected ? "var(--shadow-md)" : "var(--shadow-sm)",
			}}
		>
			<div className="flex items-center justify-between gap-3">
				<div className="flex-1">
					<span className="text-sm font-medium">{label}</span>
					{description && (
						<p
							className="mt-1 text-xs"
							style={{ color: "var(--muted-foreground)" }}
						>
							{description}
						</p>
					)}
				</div>
				<AnimatePresence>
					{selected && (
						<motion.div
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0, opacity: 0 }}
							transition={{ type: "spring", stiffness: 400, damping: 25 }}
							className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
							style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
						>
							<Check size={12} strokeWidth={3} />
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.button>
	);
}

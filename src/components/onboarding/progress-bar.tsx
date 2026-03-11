"use client";

import { gentleSpring } from "@/lib/animations";
import { motion } from "framer-motion";

interface ProgressBarProps {
	current: number;
	total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
	const percentage = (current / total) * 100;

	return (
		<div className="mb-8 flex flex-col gap-3">
			<div
				className="h-1.5 w-full overflow-hidden rounded-full"
				style={{ background: "var(--muted)" }}
			>
				<motion.div
					className="h-full rounded-full"
					style={{ background: "var(--accent)" }}
					initial={false}
					animate={{ width: `${percentage}%` }}
					transition={gentleSpring}
				/>
			</div>
			<div className="flex justify-center gap-2">
				{Array.from({ length: total }, (_, i) => (
					<div
						key={i}
						className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
						style={{
							background: i < current ? "var(--accent)" : "var(--border)",
						}}
					/>
				))}
			</div>
		</div>
	);
}

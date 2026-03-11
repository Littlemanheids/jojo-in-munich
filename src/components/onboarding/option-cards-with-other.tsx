"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface Option {
	value: string;
	label: string;
	description?: string;
}

interface OptionCardsWithOtherProps {
	options: Option[];
	value: string;
	onChange: (value: string) => void;
	customValue?: string;
	onCustomChange?: (value: string) => void;
}

export function OptionCardsWithOther({
	options,
	value,
	onChange,
	customValue = "",
	onCustomChange,
}: OptionCardsWithOtherProps) {
	const [showInput, setShowInput] = useState(value === "__other__");
	const isOther = value === "__other__";

	return (
		<motion.div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 10,
				width: "100%",
			}}
			variants={staggerContainer}
			initial="initial"
			animate="animate"
		>
			{options.map((opt) => {
				const sel = value === opt.value;
				return (
					<motion.button
						key={opt.value}
						type="button"
						onClick={() => {
							onChange(opt.value);
							setShowInput(false);
						}}
						variants={staggerItem}
						whileTap={{ scale: 0.97 }}
						style={{
							background: sel
								? "var(--ink)"
								: "var(--bg-white)",
							border: `1.5px solid ${sel ? "var(--ink)" : "var(--border)"}`,
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
								color: sel ? "var(--bg)" : "var(--ink)",
								fontFamily: "var(--font-body), sans-serif",
								letterSpacing: "-0.01em",
							}}
						>
							{opt.label}
						</div>
						{opt.description && (
							<div
								style={{
									fontSize: 13,
									color: sel
										? "#B0A08A"
										: "var(--ink-muted)",
									marginTop: 3,
									fontFamily: "var(--font-body), sans-serif",
									lineHeight: 1.4,
								}}
							>
								{opt.description}
							</div>
						)}
					</motion.button>
				);
			})}

			{/* Something else option */}
			{onCustomChange && (
				<motion.div variants={staggerItem}>
					{!showInput ? (
						<button
							type="button"
							onClick={() => {
								onChange("__other__");
								setShowInput(true);
							}}
							style={{
								background: isOther
									? "var(--ink)"
									: "transparent",
								border: `1.5px ${isOther ? "solid" : "dashed"} ${isOther ? "var(--ink)" : "var(--border)"}`,
								borderRadius: 14,
								padding: "16px 20px",
								textAlign: "left" as const,
								cursor: "pointer",
								transition: "all 0.18s ease",
								width: "100%",
								fontSize: 16,
								fontWeight: 400,
								color: isOther
									? "var(--bg)"
									: "var(--ink-muted)",
								fontFamily: "var(--font-body), sans-serif",
							}}
						>
							Something else...
						</button>
					) : (
						<div
							style={{
								border: "1.5px solid var(--accent)",
								borderRadius: 14,
								padding: "16px 20px",
								background: "var(--bg-white)",
							}}
						>
							<input
								type="text"
								value={customValue}
								onChange={(e) =>
									onCustomChange(e.target.value)
								}
								placeholder="Tell us in your own words..."
								autoFocus
								style={{
									background: "transparent",
									border: "none",
									outline: "none",
									width: "100%",
									fontSize: 15,
									color: "var(--ink)",
									fontFamily: "var(--font-body), sans-serif",
								}}
							/>
						</div>
					)}
				</motion.div>
			)}
		</motion.div>
	);
}

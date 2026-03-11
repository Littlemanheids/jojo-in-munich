"use client";

import { motion } from "framer-motion";

interface BottomNavProps {
	onBack?: () => void;
	onNext: () => void;
	nextLabel?: string;
	disabled?: boolean;
	showBack?: boolean;
}

export function BottomNav({
	onBack,
	onNext,
	nextLabel = "Continue",
	disabled = false,
	showBack = true,
}: BottomNavProps) {
	return (
		<div
			style={{
				position: "fixed",
				bottom: 0,
				left: "50%",
				transform: "translateX(-50%)",
				width: "100%",
				maxWidth: 430,
				background:
					"linear-gradient(to top, var(--bg) 72%, transparent)",
				padding: "16px 28px 40px",
				zIndex: 10,
			}}
		>
			<div style={{ display: "flex", gap: 10 }}>
				{showBack && onBack && (
					<button
						type="button"
						onClick={onBack}
						style={{
							width: 52,
							height: 52,
							background: "transparent",
							border: "1.5px solid var(--border)",
							borderRadius: 12,
							cursor: "pointer",
							color: "var(--ink-muted)",
							fontSize: 18,
							flexShrink: 0,
							fontFamily: "var(--font-body), sans-serif",
						}}
					>
						&larr;
					</button>
				)}
				<motion.button
					type="button"
					onClick={onNext}
					disabled={disabled}
					whileTap={disabled ? {} : { scale: 0.97 }}
					style={{
						flex: 1,
						height: 52,
						background: disabled
							? "var(--border-light)"
							: "var(--ink)",
						color: disabled ? "var(--border)" : "var(--bg)",
						border: "none",
						borderRadius: 12,
						fontSize: 15,
						fontFamily: "var(--font-body), sans-serif",
						fontWeight: 500,
						cursor: disabled ? "default" : "pointer",
						transition: "all 0.2s ease",
						letterSpacing: "0.01em",
					}}
				>
					{nextLabel}
				</motion.button>
			</div>
		</div>
	);
}

"use client";

import { staggerItem } from "@/lib/animations";
import { motion } from "framer-motion";
import { Bookmark, Calendar, ExternalLink, Heart, MapPin, X } from "lucide-react";

interface FeedCardProps {
	title: string;
	description: string;
	category: string;
	relevance: string;
	location?: string | null;
	neighborhood?: string | null;
	date?: string | null;
	url?: string | null;
	showFeedbackButtons?: boolean;
	onLove?: () => void;
	onDismiss?: () => void;
	onSave?: () => void;
	saved?: boolean;
}

const categoryColors: Record<string, string> = {
	event: "#7B7BA0",
	opening: "#D4764E",
	pick: "#6B8E6B",
	tip: "#B8926A",
};

export function FeedCard({
	title,
	description,
	category,
	relevance,
	location,
	neighborhood,
	date,
	url,
	showFeedbackButtons,
	onLove,
	onDismiss,
	onSave,
	saved,
}: FeedCardProps) {
	const chipColor =
		categoryColors[category.toLowerCase()] ?? "var(--ink-muted)";
	const locationText = [location, neighborhood].filter(Boolean).join(" · ");

	return (
		<motion.div
			variants={staggerItem}
			style={{
				background: "var(--bg-card)",
				borderRadius: 14,
				padding: "16px 16px 14px",
				display: "flex",
				flexDirection: "column",
			}}
		>
			{/* Title */}
			<div
				style={{
					fontSize: 15,
					fontWeight: 500,
					color: "var(--ink)",
					fontFamily: "var(--font-body), sans-serif",
					lineHeight: 1.3,
				}}
			>
				{title}
			</div>

			{/* Category chip */}
			<span
				style={{
					display: "inline-block",
					alignSelf: "flex-start",
					marginTop: 6,
					fontSize: 11,
					fontWeight: 500,
					color: chipColor,
					background: `${chipColor}18`,
					padding: "3px 10px",
					borderRadius: 20,
					letterSpacing: 0.3,
					textTransform: "capitalize",
				}}
			>
				{category}
			</span>

			{/* Description */}
			<div
				style={{
					fontSize: 14,
					color: "var(--ink-muted)",
					lineHeight: 1.5,
					marginTop: 10,
				}}
			>
				{description}
			</div>

			{/* Relevance */}
			{relevance && (
				<div
					style={{
						fontSize: 13,
						color: "var(--accent)",
						fontStyle: "italic",
						lineHeight: 1.4,
						marginTop: 8,
					}}
				>
					{relevance}
				</div>
			)}

			{/* Location */}
			{locationText && (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 5,
						fontSize: 13,
						color: "var(--ink-muted)",
						lineHeight: 1.4,
						marginTop: 8,
					}}
				>
					<MapPin size={12} style={{ flexShrink: 0 }} />
					<span>{locationText}</span>
				</div>
			)}

			{/* Bottom row: date + save + visit link + optional feedback buttons */}
			{(date || url || showFeedbackButtons || onSave) && (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginTop: 6,
					}}
				>
					{date ? (
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 5,
								fontSize: 12,
								color: "var(--ink-muted)",
							}}
						>
							<Calendar size={12} />
							<span>{date}</span>
						</div>
					) : (
						<div />
					)}

					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						{onSave && (
							<button
								type="button"
								onClick={onSave}
								aria-label={saved ? "Saved" : "Save"}
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: 28,
									height: 28,
									borderRadius: "50%",
									border: saved
										? "1.5px solid var(--accent)"
										: "1.5px solid var(--border)",
									background: saved ? "var(--accent)" : "none",
									cursor: "pointer",
									color: saved ? "var(--bg)" : "var(--ink-muted)",
									padding: 0,
									transition: "all 0.15s ease",
								}}
							>
								<Bookmark
									size={13}
									fill={saved ? "var(--bg)" : "none"}
								/>
							</button>
						)}
						{showFeedbackButtons && (
							<>
								<button
									type="button"
									onClick={onDismiss}
									aria-label="Not for me"
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										width: 28,
										height: 28,
										borderRadius: "50%",
										border: "1.5px solid var(--destructive)",
										background: "none",
										cursor: "pointer",
										color: "var(--destructive)",
										padding: 0,
									}}
								>
									<X size={14} />
								</button>
								<button
									type="button"
									onClick={onLove}
									aria-label="Love this"
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										width: 28,
										height: 28,
										borderRadius: "50%",
										border: "1.5px solid #6B8E6B",
										background: "none",
										cursor: "pointer",
										color: "#6B8E6B",
										padding: 0,
									}}
								>
									<Heart size={14} />
								</button>
							</>
						)}
						{url && (
							<a
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: 4,
									fontSize: 12,
									color: "var(--accent)",
									textDecoration: "none",
									cursor: "pointer",
								}}
							>
								<span>Visit</span>
								<ExternalLink size={12} />
							</a>
						)}
					</div>
				</div>
			)}
		</motion.div>
	);
}

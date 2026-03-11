"use client";

import { staggerItem } from "@/lib/animations";
import { motion } from "framer-motion";
import { MapPin, Trash2 } from "lucide-react";

interface BookmarkCardProps {
	id: string;
	name: string;
	category: string | null;
	address: string | null;
	notes: string | null;
	onDelete: (id: string) => void;
	deleting?: boolean;
}

const categoryColors: Record<string, string> = {
	restaurant: "#D4764E",
	cafe: "#B8926A",
	bar: "#8B6F5E",
	park: "#6B8E6B",
	museum: "#7B7BA0",
	shop: "#A07B7B",
};

export function BookmarkCard({
	id,
	name,
	category,
	address,
	notes,
	onDelete,
	deleting,
}: BookmarkCardProps) {
	const chipColor = category
		? (categoryColors[category.toLowerCase()] ?? "var(--ink-muted)")
		: null;

	return (
		<motion.div
			variants={staggerItem}
			layout
			style={{
				background: "var(--bg-card)",
				borderRadius: 14,
				padding: "16px 16px 14px",
				display: "flex",
				flexDirection: "column",
				gap: 6,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					gap: 8,
				}}
			>
				<div style={{ flex: 1, minWidth: 0 }}>
					<div
						style={{
							fontSize: 15,
							fontWeight: 500,
							color: "var(--ink)",
							fontFamily: "var(--font-body), sans-serif",
							lineHeight: 1.3,
						}}
					>
						{name}
					</div>
					{category && chipColor && (
						<span
							style={{
								display: "inline-block",
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
					)}
				</div>
				<button
					type="button"
					onClick={() => onDelete(id)}
					disabled={deleting}
					style={{
						width: 32,
						height: 32,
						borderRadius: 8,
						background: "transparent",
						border: "none",
						cursor: deleting ? "default" : "pointer",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "var(--ink-muted)",
						opacity: deleting ? 0.4 : 0.6,
						transition: "opacity 0.15s ease",
						flexShrink: 0,
					}}
				>
					<Trash2 size={15} />
				</button>
			</div>

			{address && (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 5,
						fontSize: 13,
						color: "var(--ink-muted)",
						lineHeight: 1.4,
					}}
				>
					<MapPin size={12} style={{ flexShrink: 0 }} />
					<span>{address}</span>
				</div>
			)}

			{notes && (
				<div
					style={{
						fontSize: 13,
						color: "var(--ink-muted)",
						lineHeight: 1.5,
						marginTop: 2,
					}}
				>
					{notes}
				</div>
			)}
		</motion.div>
	);
}

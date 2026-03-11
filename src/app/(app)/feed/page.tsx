"use client";

import { FeedCard } from "@/components/feed/feed-card";
import { FeedMap } from "@/components/feed/feed-map";
import { fadeIn, fadeInTransition, staggerContainer } from "@/lib/animations";
import { motion } from "framer-motion";
import {
	Calendar,
	LayoutList,
	Lightbulb,
	MapIcon,
	RefreshCw,
	Sparkles,
	Star,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface FeedItem {
	id: string;
	title: string;
	description: string;
	category: string;
	relevance: string;
	location?: string | null;
	neighborhood?: string | null;
	date?: string | null;
	url?: string | null;
}

const CATEGORIES = ["all", "event", "opening", "pick", "tip"] as const;
type Category = (typeof CATEGORIES)[number];

const categoryIcons: Record<string, React.ReactNode> = {
	event: (
		<Calendar size={36} strokeWidth={1} style={{ color: "var(--border)" }} />
	),
	opening: (
		<Sparkles size={36} strokeWidth={1} style={{ color: "var(--border)" }} />
	),
	pick: <Star size={36} strokeWidth={1} style={{ color: "var(--border)" }} />,
	tip: (
		<Lightbulb size={36} strokeWidth={1} style={{ color: "var(--border)" }} />
	),
};

export default function FeedPage() {
	const [items, setItems] = useState<FeedItem[]>([]);
	const [generatedAt, setGeneratedAt] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [activeCategory, setActiveCategory] = useState<Category>("all");
	const [loadingPhase, setLoadingPhase] = useState<"loading" | "searching">(
		"loading",
	);
	const [viewMode, setViewMode] = useState<"list" | "map">("list");

	const fetchFeed = useCallback(async (refresh = false) => {
		if (refresh) setRefreshing(true);
		else setLoading(true);
		setLoadingPhase("loading");

		// Phase 2 after 3s
		const timer = setTimeout(() => setLoadingPhase("searching"), 3000);

		try {
			const url = refresh ? "/api/feed?refresh=true" : "/api/feed";
			const res = await fetch(url);
			if (res.ok) {
				const data = await res.json();
				setItems(data.items ?? []);
				setGeneratedAt(data.generatedAt ?? null);
			}
		} finally {
			clearTimeout(timer);
			setLoading(false);
			setRefreshing(false);
		}
	}, []);

	useEffect(() => {
		fetchFeed();
	}, [fetchFeed]);

	const filteredItems =
		activeCategory === "all"
			? items
			: items.filter((item) => item.category.toLowerCase() === activeCategory);

	function formatTimeAgo(dateStr: string) {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);

		if (diffMins < 1) return "just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		return date.toLocaleDateString("en-DE", {
			month: "short",
			day: "numeric",
		});
	}

	const isLoading = loading || refreshing;

	return (
		<div
			style={{
				minHeight: "100dvh",
				background: "var(--bg)",
				fontFamily: "var(--font-body), sans-serif",
				maxWidth: 430,
				margin: "0 auto",
				padding: "52px 20px 100px",
			}}
		>
			{/* Header */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<motion.h1
					variants={fadeIn}
					initial="initial"
					animate="animate"
					transition={fadeInTransition}
					style={{
						fontFamily: "var(--font-display), serif",
						fontSize: 28,
						fontWeight: 400,
						color: "var(--ink)",
					}}
				>
					Your Munich
				</motion.h1>
				<div style={{ display: "flex", gap: 8 }}>
					<motion.button
						type="button"
						onClick={() => setViewMode((v) => (v === "list" ? "map" : "list"))}
						whileTap={{ scale: 0.92 }}
						aria-label={viewMode === "list" ? "Show map" : "Show list"}
						style={{
							width: 40,
							height: 40,
							borderRadius: 10,
							background: "transparent",
							color: "var(--ink)",
							border: "1.5px solid var(--border)",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							transition: "all 0.15s ease",
						}}
					>
						{viewMode === "list" ? (
							<MapIcon size={18} />
						) : (
							<LayoutList size={18} />
						)}
					</motion.button>
					<motion.button
						type="button"
						onClick={() => fetchFeed(true)}
						disabled={isLoading}
						whileTap={isLoading ? {} : { scale: 0.92 }}
						aria-label="Refresh feed"
						style={{
							width: 40,
							height: 40,
							borderRadius: 10,
							background: "var(--ink)",
							color: "var(--bg)",
							border: "none",
							cursor: isLoading ? "default" : "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							opacity: isLoading ? 0.6 : 1,
							transition: "opacity 0.15s ease",
						}}
					>
						<RefreshCw
							size={18}
							style={
								refreshing
									? { animation: "spin 1s linear infinite" }
									: undefined
							}
						/>
					</motion.button>
				</div>
			</div>

			{/* Category filter chips */}
			<div
				role="tablist"
				style={{
					display: "flex",
					gap: 8,
					marginTop: 16,
					marginBottom: 6,
					overflowX: "auto",
				}}
			>
				{CATEGORIES.map((cat) => (
					<button
						key={cat}
						type="button"
						role="tab"
						aria-selected={activeCategory === cat}
						onClick={() => setActiveCategory(cat)}
						style={{
							padding: "8px 16px",
							fontSize: 13,
							fontWeight: 500,
							fontFamily: "var(--font-body), sans-serif",
							borderRadius: 20,
							border:
								activeCategory === cat
									? "1.5px solid var(--ink)"
									: "1.5px solid var(--border)",
							background: activeCategory === cat ? "var(--ink)" : "transparent",
							color: activeCategory === cat ? "var(--bg)" : "var(--ink-muted)",
							cursor: "pointer",
							whiteSpace: "nowrap",
							transition: "all 0.15s ease",
							textTransform: "capitalize",
						}}
					>
						{cat === "all" ? "All" : `${cat}s`}
					</button>
				))}
			</div>

			{/* Freshness indicator */}
			{generatedAt && !isLoading && (
				<div
					style={{
						fontSize: 12,
						color: "var(--ink-muted)",
						marginBottom: 16,
					}}
				>
					Updated {formatTimeAgo(generatedAt)}
				</div>
			)}

			{/* Loading state */}
			{isLoading && (
				<div>
					<div
						style={{
							textAlign: "center",
							padding: "24px 0 20px",
							fontSize: 14,
							color: "var(--ink-muted)",
						}}
					>
						{loadingPhase === "loading"
							? "Loading your feed..."
							: "Searching Munich for you..."}
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 12,
						}}
					>
						{[0, 1, 2].map((i) => (
							<div
								key={i}
								style={{
									background: "var(--bg-card)",
									borderRadius: 14,
									padding: 16,
									animation: "skeleton-pulse 1.5s ease infinite",
									animationDelay: `${i * 0.15}s`,
								}}
							>
								<div
									style={{
										width: "70%",
										height: 16,
										borderRadius: 6,
										background: "var(--border-light)",
									}}
								/>
								<div
									style={{
										width: 48,
										height: 20,
										borderRadius: 10,
										background: "var(--border-light)",
										marginTop: 8,
									}}
								/>
								<div
									style={{
										width: "100%",
										height: 12,
										borderRadius: 6,
										background: "var(--border-light)",
										marginTop: 12,
									}}
								/>
								<div
									style={{
										width: "60%",
										height: 12,
										borderRadius: 6,
										background: "var(--border-light)",
										marginTop: 8,
									}}
								/>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Empty state — no items at all */}
			{!isLoading && items.length === 0 && (
				<motion.div
					variants={fadeIn}
					initial="initial"
					animate="animate"
					transition={fadeInTransition}
					style={{
						textAlign: "center",
						padding: "64px 24px",
					}}
				>
					<Sparkles
						size={36}
						strokeWidth={1}
						style={{
							color: "var(--border)",
							margin: "0 auto 16px",
						}}
					/>
					<p
						style={{
							fontSize: 16,
							fontWeight: 500,
							color: "var(--ink)",
							marginBottom: 6,
						}}
					>
						No feed yet
					</p>
					<p
						style={{
							fontSize: 14,
							color: "var(--ink-muted)",
							lineHeight: 1.5,
						}}
					>
						Tap refresh to generate your personalized Munich feed.
					</p>
				</motion.div>
			)}

			{/* Filter empty state */}
			{!isLoading && items.length > 0 && filteredItems.length === 0 && (
				<motion.div
					variants={fadeIn}
					initial="initial"
					animate="animate"
					transition={fadeInTransition}
					style={{
						textAlign: "center",
						padding: "48px 24px",
					}}
				>
					{categoryIcons[activeCategory] ?? (
						<Sparkles
							size={36}
							strokeWidth={1}
							style={{ color: "var(--border)" }}
						/>
					)}
					<p
						style={{
							fontSize: 15,
							fontWeight: 500,
							color: "var(--ink)",
							marginTop: 16,
							marginBottom: 6,
						}}
					>
						No {activeCategory}s in this batch
					</p>
					<p
						style={{
							fontSize: 13,
							color: "var(--ink-muted)",
							lineHeight: 1.5,
						}}
					>
						Try refreshing or check back later.
					</p>
				</motion.div>
			)}

			{/* Feed cards — list view */}
			{!isLoading && filteredItems.length > 0 && viewMode === "list" && (
				<motion.div
					variants={staggerContainer}
					initial="initial"
					animate="animate"
					key={activeCategory}
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 12,
					}}
				>
					{filteredItems.map((item) => (
						<FeedCard
							key={item.id}
							title={item.title}
							description={item.description}
							category={item.category}
							relevance={item.relevance}
							location={item.location}
							neighborhood={item.neighborhood}
							date={item.date}
							url={item.url}
						/>
					))}
				</motion.div>
			)}

			{/* Feed map — map view */}
			{!isLoading && filteredItems.length > 0 && viewMode === "map" && (
				<FeedMap items={filteredItems} />
			)}

			{/* Skeleton pulse animation */}
			<style>{`
				@keyframes skeleton-pulse {
					0%, 100% { opacity: 0.4; }
					50% { opacity: 1; }
				}
			`}</style>
		</div>
	);
}

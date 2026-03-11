"use client";

import { expandPanel } from "@/lib/animations";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface ActivityData {
	freq: string;
	subs: string[];
}

interface ActivityGridProps {
	activities: typeof ACTIVITIES;
	selected: Record<string, ActivityData>;
	onChange: (selected: Record<string, ActivityData>) => void;
}

const FREQ = ["Daily", "Weekly", "Monthly", "Occasionally"];

export const ACTIVITIES = [
	{
		id: "coffee",
		emoji: "\u2615",
		label: "Coffee",
		subs: [
			"Specialty espresso",
			"Filter & pour-over",
			"Caf\u00e9 to work from",
			"Morning ritual spot",
		],
	},
	{
		id: "food",
		emoji: "\uD83C\uDF7D",
		label: "Food",
		subs: [
			"Fine dining",
			"Local trattorias",
			"Street food",
			"Natural wine bars",
			"Brunch spots",
		],
	},
	{
		id: "fitness",
		emoji: "\uD83C\uDFC3",
		label: "Fitness",
		subs: [
			"Pilates / reformer",
			"Yoga",
			"CrossFit",
			"Running",
			"Cycling",
			"Swimming",
		],
	},
	{
		id: "culture",
		emoji: "\uD83C\uDFA8",
		label: "Culture",
		subs: ["Museums", "Galleries", "Theater", "Film", "Architecture"],
	},
	{
		id: "nightlife",
		emoji: "\uD83C\uDFB6",
		label: "Nightlife",
		subs: [
			"Techno / clubs",
			"Jazz & live music",
			"Cocktail bars",
			"Wine bars",
			"Beer gardens",
		],
	},
	{
		id: "outdoors",
		emoji: "\uD83C\uDF3F",
		label: "Outdoors",
		subs: [
			"Isar river",
			"English Garden",
			"Hiking",
			"Cycling routes",
			"Lake swimming",
		],
	},
	{
		id: "wellness",
		emoji: "\uD83D\uDEC1",
		label: "Wellness",
		subs: ["Sauna", "Spa", "Meditation", "Float tanks"],
	},
	{
		id: "markets",
		emoji: "\uD83D\uDECD",
		label: "Markets",
		subs: ["Flea markets", "Farmers markets", "Vintage shops", "Craft fairs"],
	},
] as const;

export function ActivityGrid({
	activities,
	selected,
	onChange,
}: ActivityGridProps) {
	const [expanded, setExpanded] = useState<string | null>(null);

	function toggleActivity(id: string) {
		const next = { ...selected };
		if (next[id]) {
			delete next[id];
			setExpanded(null);
		} else {
			next[id] = { freq: "Weekly", subs: [] };
			setExpanded(id);
		}
		onChange(next);
	}

	function setFreq(id: string, freq: string) {
		onChange({
			...selected,
			[id]: { ...selected[id], freq },
		});
	}

	function toggleSub(id: string, sub: string) {
		const cur = selected[id]?.subs || [];
		const next = cur.includes(sub)
			? cur.filter((s) => s !== sub)
			: [...cur, sub];
		onChange({
			...selected,
			[id]: { ...selected[id], subs: next },
		});
	}

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "1fr 1fr",
				gap: 10,
			}}
		>
			{activities.map((act) => {
				const isSel = !!selected[act.id];
				const isExp = expanded === act.id;
				return (
					<div
						key={act.id}
						style={{
							gridColumn: isExp ? "1 / -1" : "auto",
						}}
					>
						<motion.button
							type="button"
							onClick={() => toggleActivity(act.id)}
							whileTap={{ scale: 0.96 }}
							style={{
								width: "100%",
								background: isSel ? "var(--ink)" : "var(--bg-white)",
								border: `1.5px solid ${isSel ? "var(--ink)" : "var(--border)"}`,
								borderRadius: isExp ? "14px 14px 0 0" : 14,
								padding: 16,
								textAlign: "left" as const,
								cursor: "pointer",
								transition: "all 0.18s ease",
								display: "flex",
								alignItems: "center",
								gap: 10,
							}}
						>
							<span style={{ fontSize: 20 }}>{act.emoji}</span>
							<span
								style={{
									fontSize: 15,
									fontWeight: 500,
									color: isSel ? "var(--bg)" : "var(--ink)",
									fontFamily: "var(--font-body), sans-serif",
								}}
							>
								{act.label}
							</span>
						</motion.button>

						<AnimatePresence>
							{isExp && isSel && (
								<motion.div
									variants={expandPanel}
									initial="initial"
									animate="animate"
									exit="exit"
									style={{
										background: "var(--bg-card)",
										border: "1.5px solid var(--ink)",
										borderTop: "none",
										borderRadius: "0 0 14px 14px",
										padding: 16,
										overflow: "hidden",
									}}
								>
									<p
										style={{
											fontSize: 11,
											letterSpacing: "0.1em",
											textTransform: "uppercase" as const,
											color: "var(--ink-muted)",
											fontFamily: "var(--font-body), sans-serif",
											marginBottom: 10,
										}}
									>
										How often?
									</p>
									<div
										style={{
											display: "flex",
											gap: 8,
											marginBottom: 16,
											flexWrap: "wrap" as const,
										}}
									>
										{FREQ.map((f) => {
											const fSel = selected[act.id]?.freq === f;
											return (
												<button
													key={f}
													type="button"
													onClick={() => setFreq(act.id, f)}
													style={{
														background: fSel ? "var(--accent)" : "transparent",
														border: `1.5px solid ${fSel ? "var(--accent)" : "var(--border)"}`,
														borderRadius: 100,
														padding: "7px 14px",
														fontSize: 13,
														color: fSel ? "var(--bg)" : "var(--ink)",
														cursor: "pointer",
														fontFamily: "var(--font-body), sans-serif",
														transition: "all 0.15s",
													}}
												>
													{f}
												</button>
											);
										})}
									</div>
									<p
										style={{
											fontSize: 11,
											letterSpacing: "0.1em",
											textTransform: "uppercase" as const,
											color: "var(--ink-muted)",
											fontFamily: "var(--font-body), sans-serif",
											marginBottom: 10,
										}}
									>
										Specifically?
									</p>
									<div
										style={{
											display: "flex",
											flexWrap: "wrap" as const,
											gap: 7,
										}}
									>
										{act.subs.map((sub) => {
											const sSel = selected[act.id]?.subs?.includes(sub);
											return (
												<button
													key={sub}
													type="button"
													onClick={() => toggleSub(act.id, sub)}
													style={{
														background: sSel ? "var(--ink)" : "transparent",
														border: `1.5px solid ${sSel ? "var(--ink)" : "var(--border)"}`,
														borderRadius: 100,
														padding: "6px 13px",
														fontSize: 12,
														color: sSel ? "var(--bg)" : "var(--ink)",
														cursor: "pointer",
														fontFamily: "var(--font-body), sans-serif",
														transition: "all 0.15s",
													}}
												>
													{sub}
												</button>
											);
										})}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				);
			})}
		</div>
	);
}

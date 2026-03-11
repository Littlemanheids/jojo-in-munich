"use client";

import {
	ACTIVITIES,
	ActivityGrid,
} from "@/components/onboarding/activity-grid";
import { ChipSelect } from "@/components/onboarding/chip-select";
import { OptionCardsWithOther } from "@/components/onboarding/option-cards-with-other";
import { ScenarioCard } from "@/components/onboarding/scenario-card";
import { SliderInput } from "@/components/onboarding/slider-input";
import { staggerContainer } from "@/lib/animations";
import {
	AESTHETIC_OPTIONS,
	CROWD_OPTIONS,
	DEALBREAKER_OPTIONS,
} from "@/lib/types/onboarding";
import type {
	OnboardingAnswers,
	PacePreference,
	SocialContext,
} from "@/lib/types/onboarding";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ─── CONSTANTS ───────────────────────────────────────────

const MUNICH_NEIGHBORHOODS = [
	"Schwabing",
	"Maxvorstadt",
	"Glockenbachviertel",
	"Haidhausen",
	"Isarvorstadt",
	"Sendling",
	"Neuhausen",
	"Au",
	"Lehel",
	"Altstadt",
	"Bogenhausen",
	"Westend",
] as const;

const PACE_OPTIONS = [
	{
		value: "fast",
		label: "Full itinerary",
		description: "I want to see and do as much as possible",
	},
	{
		value: "slow",
		label: "Go with the flow",
		description: "I'd rather find one great spot and stay a while",
	},
	{
		value: "depends",
		label: "Depends on my mood",
		description: "Some days ambitious, some days I'm not",
	},
];

const SOCIAL_OPTIONS = [
	{
		value: "solo",
		label: "Flying solo",
		description: "Exploring on my own, and I like it that way",
	},
	{
		value: "building_social",
		label: "Building my circle",
		description: "New here and actively looking for my people",
	},
	{
		value: "with_partner",
		label: "With my partner",
		description: "Usually exploring together when he visits",
	},
	{
		value: "mixed",
		label: "A bit of everything",
		description: "Sometimes solo, sometimes social",
	},
];

const SCENARIO_SCREENS = [
	{
		id: "saturday_morning",
		question: "It's Saturday morning in Munich.",
		options: [
			{ value: "sleep_in", label: "Sleep in, then find a late brunch spot" },
			{
				value: "farmers_market",
				label: "Hit Viktualienmarkt early before the crowds",
			},
			{
				value: "workout",
				label: "Morning workout, then reward yourself with coffee",
			},
			{ value: "wander", label: "Just walk out and see what happens" },
		],
	},
	{
		id: "solo_evening",
		question: "You have a free evening alone. You'd rather…",
		options: [
			{
				value: "cozy_bar",
				label: "Find a cozy bar with a book or people-watching",
			},
			{
				value: "new_restaurant",
				label: "Try that new restaurant you've been eyeing",
			},
			{
				value: "cultural",
				label: "Catch a film, exhibition, or live music",
			},
			{ value: "home", label: "Honestly? Cook at home and recharge" },
		],
	},
	{
		id: "new_place",
		question: "You walk into a new place. What makes you stay?",
		options: [
			{
				value: "vibe",
				label: "The vibe — lighting, music, how the space feels",
			},
			{
				value: "crowd",
				label: "The crowd — interesting people, the right energy",
			},
			{
				value: "menu",
				label: "The menu — something unique or done really well",
			},
			{
				value: "location",
				label: "The location — terrace, river view, a perfect corner",
			},
		],
	},
];

// ─── TYPES ───────────────────────────────────────────────

interface ProfileEditorProps {
	initialAnswers: OnboardingAnswers;
	initialProfileText: string;
	initialNeighborhoods: string[];
}

// ─── COMPONENT ───────────────────────────────────────────

export function ProfileEditor({
	initialAnswers,
	initialProfileText,
	initialNeighborhoods,
}: ProfileEditorProps) {
	const router = useRouter();
	const [answers, setAnswers] = useState<OnboardingAnswers>(initialAnswers);
	const [profileText, setProfileText] = useState(initialProfileText);
	const [neighborhoods, setNeighborhoods] =
		useState<string[]>(initialNeighborhoods);
	const [expanded, setExpanded] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [regenerating, setRegenerating] = useState(false);
	const [dirty, setDirty] = useState(false);

	function updateChapter<K extends keyof OnboardingAnswers>(
		chapter: K,
		data: OnboardingAnswers[K],
	) {
		setAnswers((prev) => ({ ...prev, [chapter]: data }));
		setDirty(true);
	}

	function toggleSection(id: string) {
		setExpanded((prev) => (prev === id ? null : id));
	}

	// Adapt activities data for the grid component (same as onboarding page)
	function getActivitiesSelected() {
		const result: Record<string, { freq: string; subs: string[] }> = {};
		for (const [key, val] of Object.entries(answers.chapter3.categories)) {
			if (val.active) {
				result[key] = {
					freq: val.frequency.charAt(0).toUpperCase() + val.frequency.slice(1),
					subs: val.intent ? val.intent.split(", ").filter(Boolean) : [],
				};
			}
		}
		return result;
	}

	function setActivitiesSelected(
		sel: Record<string, { freq: string; subs: string[] }>,
	) {
		const categories: Record<
			string,
			{ active: boolean; frequency: string; intent: string }
		> = {};
		for (const [key, val] of Object.entries(sel)) {
			categories[key] = {
				active: true,
				frequency: val.freq.toLowerCase(),
				intent: val.subs.join(", "),
			};
		}
		for (const [key, val] of Object.entries(answers.chapter3.categories)) {
			if (!categories[key] && !val.active) {
				categories[key] = val as {
					active: boolean;
					frequency: string;
					intent: string;
				};
			}
		}
		updateChapter("chapter3", { categories } as typeof answers.chapter3);
	}

	async function handleSave() {
		setSaving(true);
		try {
			const res = await fetch("/api/profile/update", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ answers, neighborhoods }),
			});
			if (!res.ok) throw new Error("Failed to update");
			const data = await res.json();
			setProfileText(data.profileText);
			setDirty(false);
			router.refresh();
		} catch {
			// error handling — could add toast later
		} finally {
			setSaving(false);
		}
	}

	async function handleRegenerate() {
		setRegenerating(true);
		try {
			const res = await fetch("/api/profile/update", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ answers, neighborhoods }),
			});
			if (!res.ok) throw new Error("Failed to regenerate");
			const data = await res.json();
			setProfileText(data.profileText);
			router.refresh();
		} catch {
			// error handling
		} finally {
			setRegenerating(false);
		}
	}

	return (
		<div
			style={{
				minHeight: "100dvh",
				background: "var(--bg)",
				maxWidth: 430,
				margin: "0 auto",
				padding: "48px 28px 140px",
				fontFamily: "var(--font-body), sans-serif",
			}}
		>
			{/* Header */}
			<h1
				style={{
					fontFamily: "var(--font-display), serif",
					fontSize: 28,
					fontWeight: 400,
					color: "var(--ink)",
					letterSpacing: "-0.01em",
					marginBottom: 24,
				}}
			>
				Your Taste Profile
			</h1>

			{/* Profile text card */}
			<div
				style={{
					background: "var(--bg-card)",
					border: "1.5px solid var(--border-light)",
					borderRadius: 14,
					padding: 20,
					marginBottom: 32,
					position: "relative",
				}}
			>
				<p
					style={{
						fontSize: 14,
						color: "var(--ink)",
						lineHeight: 1.7,
						marginBottom: 12,
					}}
				>
					{profileText ||
						"Complete your profile to see your AI-generated taste profile."}
				</p>
				{profileText && (
					<button
						type="button"
						onClick={handleRegenerate}
						disabled={regenerating}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 6,
							background: "none",
							border: "none",
							fontSize: 12,
							color: "var(--ink-muted)",
							cursor: regenerating ? "default" : "pointer",
							fontFamily: "var(--font-body), sans-serif",
							padding: 0,
							opacity: regenerating ? 0.5 : 1,
							transition: "opacity 0.2s",
						}}
					>
						<RotateCw
							size={12}
							style={{
								animation: regenerating ? "spin 1s linear infinite" : "none",
							}}
						/>
						{regenerating ? "Regenerating..." : "Regenerate"}
					</button>
				)}
			</div>

			{/* Section label */}
			<p
				style={{
					fontSize: 11,
					letterSpacing: "0.12em",
					textTransform: "uppercase",
					color: "var(--ink-muted)",
					marginBottom: 12,
				}}
			>
				Preferences
			</p>

			{/* Collapsible sections */}
			<div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
				{/* Energy & Pace */}
				<CollapsibleSection
					title="Energy & Pace"
					id="energy"
					expanded={expanded === "energy"}
					onToggle={() => toggleSection("energy")}
				>
					<div style={{ marginBottom: 20 }}>
						<p style={labelStyle}>Energy level</p>
						<SliderInput
							value={answers.chapter1.energyBaseline}
							onChange={(v) =>
								updateChapter("chapter1", {
									...answers.chapter1,
									energyBaseline: v,
								})
							}
							min={1}
							max={5}
							labels={{ left: "Chill & slow", right: "Always on the go" }}
						/>
					</div>
					<p style={labelStyle}>Exploration pace</p>
					<OptionCardsWithOther
						options={PACE_OPTIONS}
						value={answers.chapter1.pacePreference}
						onChange={(v) =>
							updateChapter("chapter1", {
								...answers.chapter1,
								pacePreference: v as PacePreference,
							})
						}
					/>
				</CollapsibleSection>

				{/* Aesthetic */}
				<CollapsibleSection
					title="Your Aesthetic"
					id="aesthetic"
					expanded={expanded === "aesthetic"}
					onToggle={() => toggleSection("aesthetic")}
				>
					<ChipSelect
						options={AESTHETIC_OPTIONS}
						selected={answers.chapter1.aestheticInstincts}
						onChange={(v) =>
							updateChapter("chapter1", {
								...answers.chapter1,
								aestheticInstincts: v,
							})
						}
					/>
				</CollapsibleSection>

				{/* Dealbreakers */}
				<CollapsibleSection
					title="Dealbreakers"
					id="dealbreakers"
					expanded={expanded === "dealbreakers"}
					onToggle={() => toggleSection("dealbreakers")}
				>
					<ChipSelect
						options={DEALBREAKER_OPTIONS}
						selected={answers.chapter1.dealbreakers}
						onChange={(v) =>
							updateChapter("chapter1", {
								...answers.chapter1,
								dealbreakers: v,
							})
						}
					/>
				</CollapsibleSection>

				{/* Social Scene */}
				<CollapsibleSection
					title="Social Scene"
					id="social"
					expanded={expanded === "social"}
					onToggle={() => toggleSection("social")}
				>
					<div style={{ marginBottom: 20 }}>
						<p style={labelStyle}>How you navigate Munich</p>
						<OptionCardsWithOther
							options={SOCIAL_OPTIONS}
							value={answers.chapter2.socialContext}
							onChange={(v) =>
								updateChapter("chapter2", {
									...answers.chapter2,
									socialContext: v as SocialContext,
								})
							}
						/>
					</div>
					<p style={labelStyle}>Your crowd</p>
					<ChipSelect
						options={CROWD_OPTIONS}
						selected={answers.chapter2.crowdPreferences}
						onChange={(v) =>
							updateChapter("chapter2", {
								...answers.chapter2,
								crowdPreferences: v,
							})
						}
					/>
				</CollapsibleSection>

				{/* Activities */}
				<CollapsibleSection
					title="Activities"
					id="activities"
					expanded={expanded === "activities"}
					onToggle={() => toggleSection("activities")}
				>
					<ActivityGrid
						activities={ACTIVITIES as unknown as typeof ACTIVITIES}
						selected={getActivitiesSelected()}
						onChange={setActivitiesSelected}
					/>
				</CollapsibleSection>

				{/* Scenarios */}
				<CollapsibleSection
					title="Scenarios"
					id="scenarios"
					expanded={expanded === "scenarios"}
					onToggle={() => toggleSection("scenarios")}
				>
					{SCENARIO_SCREENS.map((scenario) => (
						<div key={scenario.id} style={{ marginBottom: 24 }}>
							<p
								style={{
									fontSize: 14,
									fontWeight: 500,
									color: "var(--ink)",
									marginBottom: 10,
									lineHeight: 1.4,
								}}
							>
								{scenario.question}
							</p>
							<motion.div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: 8,
								}}
								variants={staggerContainer}
								initial="initial"
								animate="animate"
							>
								{scenario.options.map((opt, i) => (
									<ScenarioCard
										key={opt.value}
										label={opt.label}
										letter={String.fromCharCode(65 + i)}
										selected={
											answers.chapter4.scenarios[scenario.id] === opt.value
										}
										onClick={() =>
											updateChapter("chapter4", {
												scenarios: {
													...answers.chapter4.scenarios,
													[scenario.id]: opt.value,
												},
											})
										}
									/>
								))}
							</motion.div>
						</div>
					))}
				</CollapsibleSection>
			</div>

			{/* Neighborhood */}
			<p
				style={{
					fontSize: 11,
					letterSpacing: "0.12em",
					textTransform: "uppercase",
					color: "var(--ink-muted)",
					marginTop: 32,
					marginBottom: 12,
				}}
			>
				Neighborhood
			</p>
			<ChipSelect
				options={MUNICH_NEIGHBORHOODS}
				selected={neighborhoods}
				onChange={(v) => {
					setNeighborhoods(v);
					setDirty(true);
				}}
			/>

			{/* Free text */}
			<p
				style={{
					fontSize: 11,
					letterSpacing: "0.12em",
					textTransform: "uppercase",
					color: "var(--ink-muted)",
					marginTop: 32,
					marginBottom: 12,
				}}
			>
				Anything else
			</p>
			<textarea
				value={answers.freeText}
				onChange={(e) => {
					setAnswers((prev) => ({ ...prev, freeText: e.target.value }));
					setDirty(true);
				}}
				placeholder="Your taste, goals, what you're hoping Munich gives you..."
				rows={4}
				style={{
					width: "100%",
					background: "var(--bg-white)",
					border: "1.5px solid var(--border)",
					borderRadius: 14,
					padding: 16,
					fontSize: 14,
					color: "var(--ink)",
					fontFamily: "var(--font-body), sans-serif",
					resize: "none",
					outline: "none",
					lineHeight: 1.6,
					boxSizing: "border-box",
				}}
				onFocus={(e) => {
					e.target.style.borderColor = "var(--accent)";
				}}
				onBlur={(e) => {
					e.target.style.borderColor = "var(--border)";
				}}
			/>

			{/* Update button */}
			<AnimatePresence>
				{dirty && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						style={{ marginTop: 32 }}
					>
						<button
							type="button"
							onClick={handleSave}
							disabled={saving}
							style={{
								width: "100%",
								height: 52,
								background: saving ? "var(--border-light)" : "var(--ink)",
								color: saving ? "var(--border)" : "var(--bg)",
								border: "none",
								borderRadius: 12,
								fontSize: 15,
								fontFamily: "var(--font-body), sans-serif",
								fontWeight: 500,
								cursor: saving ? "default" : "pointer",
								transition: "all 0.2s ease",
								letterSpacing: "0.01em",
							}}
						>
							{saving ? "Updating your profile..." : "Update my profile"}
						</button>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Sign out */}
			<form
				action="/api/auth/signout"
				method="post"
				style={{ marginTop: 32, textAlign: "center" }}
			>
				<button
					type="submit"
					style={{
						background: "none",
						border: "none",
						fontSize: 14,
						color: "var(--ink-muted)",
						textDecoration: "underline",
						textUnderlineOffset: 4,
						cursor: "pointer",
						fontFamily: "var(--font-body), sans-serif",
					}}
				>
					Sign out
				</button>
			</form>
		</div>
	);
}

// ─── COLLAPSIBLE SECTION ─────────────────────────────────

function CollapsibleSection({
	title,
	id,
	expanded,
	onToggle,
	children,
}: {
	title: string;
	id: string;
	expanded: boolean;
	onToggle: () => void;
	children: React.ReactNode;
}) {
	return (
		<div
			style={{
				borderBottom: "1px solid var(--border-light)",
			}}
		>
			<button
				type="button"
				onClick={onToggle}
				aria-expanded={expanded}
				aria-controls={`section-${id}`}
				style={{
					width: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "16px 0",
					background: "none",
					border: "none",
					cursor: "pointer",
					fontFamily: "var(--font-body), sans-serif",
				}}
			>
				<span
					style={{
						fontSize: 15,
						fontWeight: 500,
						color: "var(--ink)",
					}}
				>
					{title}
				</span>
				<motion.span
					animate={{ rotate: expanded ? 180 : 0 }}
					transition={{ duration: 0.2 }}
					style={{ color: "var(--ink-muted)" }}
				>
					<ChevronDown size={18} />
				</motion.span>
			</button>
			<AnimatePresence initial={false}>
				{expanded && (
					<motion.div
						id={`section-${id}`}
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.25, ease: "easeInOut" }}
						style={{ overflow: "hidden" }}
					>
						<div style={{ paddingBottom: 20 }}>{children}</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// ─── SHARED STYLES ───────────────────────────────────────

const labelStyle: React.CSSProperties = {
	fontSize: 11,
	letterSpacing: "0.1em",
	textTransform: "uppercase",
	color: "var(--ink-muted)",
	fontFamily: "var(--font-body), sans-serif",
	marginBottom: 10,
};

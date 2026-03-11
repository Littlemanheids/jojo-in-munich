"use client";

import {
	ACTIVITIES,
	ActivityGrid,
} from "@/components/onboarding/activity-grid";
import { BottomNav } from "@/components/onboarding/bottom-nav";
import { ChapterLabel } from "@/components/onboarding/chapter-label";
import { ChipSelect } from "@/components/onboarding/chip-select";
import { OptionCardsWithOther } from "@/components/onboarding/option-cards-with-other";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { ScenarioCard } from "@/components/onboarding/scenario-card";
import { SliderInput } from "@/components/onboarding/slider-input";
import { useOnboarding } from "@/hooks/use-onboarding";
import {
	fadeInTransition,
	slideBack,
	slideForward,
	slideTransition,
	staggerContainer,
} from "@/lib/animations";
import {
	AESTHETIC_OPTIONS,
	CROWD_OPTIONS,
	DEALBREAKER_OPTIONS,
} from "@/lib/types/onboarding";
import type { PacePreference, SocialContext } from "@/lib/types/onboarding";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TOTAL_STEPS = 11;

// ─── SCREEN DEFINITIONS ──────────────────────────────────────
const SCREENS = [
	{ step: 0, type: "welcome" },
	{
		step: 1,
		type: "slider",
		chapter: "First things first",
		question: "What\u2019s your natural energy level?",
	},
	{
		step: 2,
		type: "option",
		chapter: "First things first",
		question: "When you explore a new city, what\u2019s your pace?",
	},
	{
		step: 3,
		type: "chips",
		chapter: "First things first",
		question: "What kind of spaces draw you in?",
		sub: "Pick as many as you like",
	},
	{
		step: 4,
		type: "chips",
		chapter: "First things first",
		question: "What instantly kills a place for you?",
		sub: "Be honest \u2014 this shapes everything",
	},
	{
		step: 5,
		type: "option",
		chapter: "Your social scene",
		question: "How are you navigating Munich right now?",
	},
	{
		step: 6,
		type: "chips",
		chapter: "Your social scene",
		question: "What crowds do you gravitate toward?",
		sub: "Pick the ones that feel like your people",
	},
	{
		step: 7,
		type: "activities",
		chapter: "Your life in Munich",
		question: "What do you actually do?",
		sub: "Tap to select, then tell us how often.",
	},
	{
		step: 8,
		type: "scenario",
		chapter: "Picture this\u2026",
		question: "It\u2019s Saturday morning in Munich.",
	},
	{
		step: 9,
		type: "scenario",
		chapter: "Picture this\u2026",
		question: "You have a free evening alone. You\u2019d rather\u2026",
	},
	{
		step: 10,
		type: "scenario",
		chapter: "Picture this\u2026",
		question: "You walk into a new place. What makes you stay?",
	},
	{
		step: 11,
		type: "freetext",
		chapter: "One last thing",
		question: "Anything else we should know?",
		sub: "Your taste, goals, what you\u2019re hoping Munich gives you \u2014 whatever didn\u2019t fit above.",
	},
	{ step: 12, type: "synthesis" },
] as const;

// Pace options
const PACE_OPTIONS = [
	{
		value: "fast",
		label: "Full itinerary",
		description: "I want to see and do as much as possible",
	},
	{
		value: "slow",
		label: "Go with the flow",
		description: "I\u2019d rather find one great spot and stay a while",
	},
	{
		value: "depends",
		label: "Depends on my mood",
		description: "Some days ambitious, some days I\u2019m not",
	},
];

// Social options
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

// Scenario data
const SCENARIO_SCREENS: Record<
	number,
	{ id: string; options: { value: string; label: string }[] }
> = {
	8: {
		id: "saturday_morning",
		options: [
			{
				value: "sleep_in",
				label: "Sleep in, then find a late brunch spot",
			},
			{
				value: "farmers_market",
				label: "Hit Viktualienmarkt early before the crowds",
			},
			{
				value: "workout",
				label: "Morning workout, then reward yourself with coffee",
			},
			{
				value: "wander",
				label: "Just walk out and see what happens",
			},
		],
	},
	9: {
		id: "solo_evening",
		options: [
			{
				value: "cozy_bar",
				label: "Find a cozy bar with a book or people-watching",
			},
			{
				value: "new_restaurant",
				label: "Try that new restaurant you\u2019ve been eyeing",
			},
			{
				value: "cultural",
				label: "Catch a film, exhibition, or live music",
			},
			{
				value: "home",
				label: "Honestly? Cook at home and recharge",
			},
		],
	},
	10: {
		id: "new_place",
		options: [
			{
				value: "vibe",
				label: "The vibe \u2014 lighting, music, how the space feels",
			},
			{
				value: "crowd",
				label: "The crowd \u2014 interesting people, the right energy",
			},
			{
				value: "menu",
				label: "The menu \u2014 something unique or done really well",
			},
			{
				value: "location",
				label: "The location \u2014 terrace, river view, a perfect corner",
			},
		],
	},
};

export default function OnboardingFlow() {
	const router = useRouter();
	const { answers, updateChapter, setFreeText, reset } = useOnboarding();
	const [screen, setScreen] = useState(0);
	const [direction, setDirection] = useState<"forward" | "back">("forward");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [customScenarios, setCustomScenarios] = useState<
		Record<string, string>
	>({});

	// Synthesis phases
	const [synthPhase, setSynthPhase] = useState(0);
	const SYNTH_PHASES = [
		"Reading your answers\u2026",
		"Building your taste profile\u2026",
		"Mapping you to Munich\u2026",
		"Almost ready\u2026",
	];

	const s = SCREENS[screen];

	function next() {
		if (screen === SCREENS.length - 2) {
			// Freetext → Synthesis: submit
			handleSubmit();
			return;
		}
		setDirection("forward");
		setScreen((prev) => Math.min(prev + 1, SCREENS.length - 1));
	}

	function back() {
		setDirection("back");
		setScreen((prev) => Math.max(prev - 1, 0));
	}

	async function handleSubmit() {
		setDirection("forward");
		setScreen(SCREENS.length - 1); // Go to synthesis screen
		setLoading(true);
		setError(null);

		// Start phase timer
		const interval = setInterval(() => {
			setSynthPhase((p) => (p < SYNTH_PHASES.length - 1 ? p + 1 : p));
		}, 1800);

		try {
			const res = await fetch("/api/onboarding/synthesize", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ answers }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error ?? "Something went wrong");
			}

			clearInterval(interval);
			reset();
			router.push("/feed");
		} catch (err) {
			clearInterval(interval);
			setError(err instanceof Error ? err.message : "Something went wrong");
			setLoading(false);
			// Go back to freetext screen
			setScreen(SCREENS.length - 2);
		}
	}

	function canContinue(): boolean {
		switch (s.type) {
			case "slider":
				return true;
			case "option":
				if (screen === 2) return !!answers.chapter1.pacePreference;
				if (screen === 5) return !!answers.chapter2.socialContext;
				return true;
			case "chips":
				if (screen === 3) return answers.chapter1.aestheticInstincts.length > 0;
				if (screen === 4) return answers.chapter1.dealbreakers.length > 0;
				if (screen === 6) return answers.chapter2.crowdPreferences.length > 0;
				return true;
			case "activities": {
				const cats = answers.chapter3.categories;
				return Object.values(cats).some((c) => c.active);
			}
			case "scenario": {
				const scenarioData = SCENARIO_SCREENS[screen];
				return !!answers.chapter4.scenarios[scenarioData.id];
			}
			case "freetext":
				return true;
			default:
				return true;
		}
	}

	// Adapt activities data for the grid component
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
				frequency: val.freq.toLowerCase() as
					| "daily"
					| "weekly"
					| "monthly"
					| "occasionally",
				intent: val.subs.join(", "),
			};
		}
		// Preserve inactive categories
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

	const variants = direction === "forward" ? slideForward : slideBack;

	// ─── WELCOME ────────────────────────────────────────────
	if (s.type === "welcome") {
		return (
			<div
				style={{
					minHeight: "100dvh",
					background: "var(--bg)",
					display: "flex",
					flexDirection: "column",
					padding: "60px 28px 48px",
					maxWidth: 430,
					margin: "0 auto",
				}}
			>
				<div
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
					}}
				>
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ ...fadeInTransition, delay: 0 }}
						style={{ marginBottom: 16 }}
					>
						<span
							style={{
								fontSize: 11,
								letterSpacing: "0.14em",
								textTransform: "uppercase",
								color: "var(--accent)",
								fontFamily: "var(--font-body), sans-serif",
								fontWeight: 500,
							}}
						>
							M&uuml;nchen &middot; Local
						</span>
					</motion.div>
					<motion.h1
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ ...fadeInTransition, delay: 0.08 }}
						style={{
							fontFamily: "var(--font-display), serif",
							fontSize: 44,
							fontWeight: 400,
							color: "var(--ink)",
							lineHeight: 1.1,
							letterSpacing: "-0.02em",
							marginBottom: 24,
						}}
					>
						Let&apos;s get to
						<br />
						<em>know you.</em>
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ ...fadeInTransition, delay: 0.16 }}
						style={{
							fontSize: 15,
							color: "var(--ink-light)",
							fontFamily: "var(--font-body), sans-serif",
							lineHeight: 1.7,
							maxWidth: 320,
							marginBottom: 48,
						}}
					>
						A few questions about your taste, your lifestyle, and what
						you&apos;re looking for in Munich. Takes about 8 minutes. The more
						honest you are, the better this gets.
					</motion.p>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ ...fadeInTransition, delay: 0.24 }}
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 8,
						}}
					>
						{[
							"Your energy & aesthetic",
							"Your social scene",
							"What you actually do",
							"How you make decisions",
						].map((item) => (
							<div
								key={item}
								style={{
									display: "flex",
									alignItems: "center",
									gap: 12,
								}}
							>
								<div
									style={{
										width: 6,
										height: 6,
										borderRadius: "50%",
										background: "var(--accent-light)",
										flexShrink: 0,
									}}
								/>
								<span
									style={{
										fontSize: 14,
										color: "var(--ink-light)",
										fontFamily: "var(--font-body), sans-serif",
									}}
								>
									{item}
								</span>
							</div>
						))}
					</motion.div>
				</div>
				<motion.button
					type="button"
					onClick={next}
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ ...fadeInTransition, delay: 0.32 }}
					whileTap={{ scale: 0.97 }}
					style={{
						width: "100%",
						height: 56,
						background: "var(--ink)",
						color: "var(--bg)",
						border: "none",
						borderRadius: 14,
						fontSize: 16,
						fontFamily: "var(--font-body), sans-serif",
						fontWeight: 500,
						cursor: "pointer",
						letterSpacing: "0.01em",
					}}
				>
					Let&apos;s begin
				</motion.button>
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ ...fadeInTransition, delay: 0.4 }}
					style={{
						textAlign: "center",
						marginTop: 14,
						fontSize: 12,
						color: "var(--ink-muted)",
						fontFamily: "var(--font-body), sans-serif",
					}}
				>
					Your answers stay private and are only used to personalise your
					experience.
				</motion.p>
			</div>
		);
	}

	// ─── SYNTHESIS ──────────────────────────────────────────
	if (s.type === "synthesis") {
		return (
			<div
				style={{
					minHeight: "100dvh",
					background: "var(--bg)",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					padding: "48px 28px",
					maxWidth: 430,
					margin: "0 auto",
				}}
			>
				<div style={{ marginBottom: 48, textAlign: "center" }}>
					<div
						style={{
							width: 64,
							height: 64,
							borderRadius: "50%",
							border: "2px solid var(--border-light)",
							borderTop: "2px solid var(--accent)",
							margin: "0 auto 32px",
							animation: "spin 1.2s linear infinite",
						}}
					/>
					<h2
						style={{
							fontFamily: "var(--font-display), serif",
							fontSize: 28,
							fontWeight: 400,
							color: "var(--ink)",
							marginBottom: 12,
							letterSpacing: "-0.01em",
						}}
					>
						{SYNTH_PHASES[synthPhase]}
					</h2>
					<p
						style={{
							fontSize: 14,
							color: "var(--ink-muted)",
							fontFamily: "var(--font-body), sans-serif",
							lineHeight: 1.6,
						}}
					>
						Claude is reading everything you told us
						<br />
						and building your personal Munich profile.
					</p>
				</div>

				<div style={{ width: "100%", maxWidth: 320 }}>
					{[
						"Your energy & aesthetic",
						"Your social scene",
						"Your weekly rituals",
						"Your dealbreakers",
					].map((item, i) => (
						<div
							key={item}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 12,
								padding: "12px 0",
								borderBottom: i < 3 ? "1px solid var(--border-light)" : "none",
								opacity: i <= synthPhase ? 1 : 0.3,
								transition: "opacity 0.4s ease",
							}}
						>
							<div
								style={{
									width: 20,
									height: 20,
									borderRadius: "50%",
									background:
										i <= synthPhase ? "var(--accent)" : "var(--border-light)",
									transition: "background 0.3s ease",
									flexShrink: 0,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								{i <= synthPhase && (
									<span
										style={{
											color: "#fff",
											fontSize: 11,
										}}
									>
										&#10003;
									</span>
								)}
							</div>
							<span
								style={{
									fontSize: 14,
									color: i <= synthPhase ? "var(--ink)" : "var(--ink-muted)",
									fontFamily: "var(--font-body), sans-serif",
									transition: "color 0.3s",
								}}
							>
								{item}
							</span>
						</div>
					))}
				</div>

				{error && (
					<p
						style={{
							marginTop: 24,
							fontSize: 14,
							color: "var(--destructive)",
							textAlign: "center",
						}}
					>
						{error}
					</p>
				)}
			</div>
		);
	}

	// ─── QUESTION SCREENS ───────────────────────────────────
	return (
		<div
			style={{
				minHeight: "100dvh",
				background: "var(--bg)",
				maxWidth: 430,
				margin: "0 auto",
				position: "relative",
				fontFamily: "var(--font-body), sans-serif",
			}}
		>
			<ProgressBar step={s.step} total={TOTAL_STEPS} />
			<AnimatePresence mode="wait">
				<motion.div
					key={screen}
					variants={variants}
					initial="initial"
					animate="animate"
					exit="exit"
					transition={slideTransition}
					style={{ padding: "40px 28px 140px" }}
				>
					{"chapter" in s && s.chapter && (
						<ChapterLabel
							chapter={s.chapter}
							step={s.step}
							total={TOTAL_STEPS}
						/>
					)}
					<h1
						style={{
							fontFamily: "var(--font-display), serif",
							fontSize: 32,
							fontWeight: 500,
							color: "var(--ink)",
							lineHeight: 1.18,
							letterSpacing: "-0.01em",
							marginBottom: 32,
						}}
					>
						{"question" in s ? s.question : ""}
					</h1>

					{"sub" in s && s.sub && (
						<p
							style={{
								fontSize: 13,
								color: "var(--ink-muted)",
								marginBottom: 18,
								fontFamily: "var(--font-body), sans-serif",
								lineHeight: 1.5,
							}}
						>
							{s.sub}
						</p>
					)}

					{/* Screen 1: Energy slider */}
					{screen === 1 && (
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
							labels={{
								left: "Chill & slow",
								right: "Always on the go",
							}}
						/>
					)}

					{/* Screen 2: Pace */}
					{screen === 2 && (
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
					)}

					{/* Screen 3: Aesthetic instincts */}
					{screen === 3 && (
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
					)}

					{/* Screen 4: Dealbreakers */}
					{screen === 4 && (
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
					)}

					{/* Screen 5: Social context */}
					{screen === 5 && (
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
					)}

					{/* Screen 6: Crowds */}
					{screen === 6 && (
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
					)}

					{/* Screen 7: Activities */}
					{screen === 7 && (
						<ActivityGrid
							activities={ACTIVITIES as unknown as typeof ACTIVITIES}
							selected={getActivitiesSelected()}
							onChange={setActivitiesSelected}
						/>
					)}

					{/* Screens 8-10: Scenarios */}
					{(screen === 8 || screen === 9 || screen === 10) && (
						<motion.div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: 9,
								width: "100%",
							}}
							variants={staggerContainer}
							initial="initial"
							animate="animate"
						>
							{SCENARIO_SCREENS[screen].options.map((opt, i) => (
								<ScenarioCard
									key={opt.value}
									label={opt.label}
									letter={String.fromCharCode(65 + i)}
									selected={
										answers.chapter4.scenarios[SCENARIO_SCREENS[screen].id] ===
										opt.value
									}
									onClick={() =>
										updateChapter("chapter4", {
											scenarios: {
												...answers.chapter4.scenarios,
												[SCENARIO_SCREENS[screen].id]: opt.value,
											},
										})
									}
								/>
							))}
							{/* Option E: Something else */}
							<ScenarioCard
								label="Something else entirely..."
								letter={String.fromCharCode(
									65 + SCENARIO_SCREENS[screen].options.length,
								)}
								selected={
									answers.chapter4.scenarios[
										SCENARIO_SCREENS[screen].id
									]?.startsWith("other:") ?? false
								}
								onClick={() =>
									updateChapter("chapter4", {
										scenarios: {
											...answers.chapter4.scenarios,
											[SCENARIO_SCREENS[screen].id]:
												`other:${customScenarios[SCENARIO_SCREENS[screen].id] ?? ""}`,
										},
									})
								}
							/>
							{answers.chapter4.scenarios[
								SCENARIO_SCREENS[screen].id
							]?.startsWith("other:") && (
								<input
									type="text"
									value={customScenarios[SCENARIO_SCREENS[screen].id] ?? ""}
									onChange={(e) => {
										const scenarioId = SCENARIO_SCREENS[screen].id;
										setCustomScenarios((prev) => ({
											...prev,
											[scenarioId]: e.target.value,
										}));
										updateChapter("chapter4", {
											scenarios: {
												...answers.chapter4.scenarios,
												[scenarioId]: `other:${e.target.value}`,
											},
										});
									}}
									placeholder="What would you actually do?"
									style={{
										width: "100%",
										background: "var(--bg-white)",
										border: "1.5px solid var(--border)",
										borderRadius: 14,
										padding: "14px 18px",
										fontSize: 15,
										color: "var(--ink)",
										fontFamily: "var(--font-body), sans-serif",
										outline: "none",
										boxSizing: "border-box",
									}}
									onFocus={(e) => {
										e.target.style.borderColor = "var(--accent)";
									}}
									onBlur={(e) => {
										e.target.style.borderColor = "var(--border)";
									}}
								/>
							)}
						</motion.div>
					)}

					{/* Screen 11: Freetext */}
					{screen === 11 && (
						<textarea
							value={answers.freeText}
							onChange={(e) => setFreeText(e.target.value)}
							placeholder="e.g. I'm really into natural wine, I want to find a climbing gym with a good community, I hate waiting in line..."
							rows={5}
							style={{
								width: "100%",
								background: "var(--bg-white)",
								border: "1.5px solid var(--border)",
								borderRadius: 14,
								padding: 16,
								fontSize: 15,
								color: "var(--ink)",
								fontFamily: "var(--font-body), sans-serif",
								resize: "none",
								outline: "none",
								lineHeight: 1.6,
							}}
							onFocus={(e) => {
								e.target.style.borderColor = "var(--accent)";
							}}
							onBlur={(e) => {
								e.target.style.borderColor = "var(--border)";
							}}
						/>
					)}

					{error && screen === 11 && (
						<p
							style={{
								marginTop: 12,
								fontSize: 14,
								color: "var(--destructive)",
							}}
						>
							{error}
						</p>
					)}
				</motion.div>
			</AnimatePresence>

			<BottomNav
				onBack={back}
				onNext={next}
				disabled={!canContinue()}
				showBack={screen > 1}
				nextLabel={
					screen === 11 ? "Finish & meet your Munich guide" : "Continue"
				}
			/>
		</div>
	);
}

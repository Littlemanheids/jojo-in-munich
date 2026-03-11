"use client";

import { AnimatedSection } from "@/components/onboarding/animated-section";
import { OptionCard } from "@/components/onboarding/option-card";
import { useOnboarding } from "@/hooks/use-onboarding";
import { hoverLift, staggerContainer, staggerItem } from "@/lib/animations";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const SCENARIOS = [
	{
		id: "saturday_morning",
		question: "It's Saturday morning in Munich. You...",
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
		id: "friend_visiting",
		question:
			"A friend is visiting Munich for the first time. You take them to...",
		options: [
			{
				value: "hidden_gem",
				label: "Your favorite hidden spot no tourist would find",
			},
			{
				value: "classic_twist",
				label: "A classic Munich experience with your own twist",
			},
			{
				value: "food_tour",
				label: "An eating and drinking tour through your favorite neighborhood",
			},
			{
				value: "nature",
				label: "The Isar or English Garden — the city's best side is outdoors",
			},
		],
	},
	{
		id: "solo_evening",
		question: "You have a free evening alone. You'd rather...",
		options: [
			{
				value: "cozy_bar",
				label: "Find a cozy bar with a book or good people-watching",
			},
			{
				value: "new_restaurant",
				label: "Try that new restaurant you've been eyeing",
			},
			{ value: "cultural", label: "Catch a film, exhibition, or live music" },
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
				label: "The location — terrace, river view, perfect corner",
			},
		],
	},
	{
		id: "weekend_plan",
		question: "Your ideal Munich weekend includes...",
		options: [
			{
				value: "packed",
				label: "A packed schedule — brunch, activity, dinner, drinks",
			},
			{
				value: "one_thing",
				label: "One really good thing and lots of free time",
			},
			{ value: "spontaneous", label: "No plan at all — pure spontaneity" },
			{ value: "mix", label: "One planned thing, the rest flows" },
		],
	},
];

export function Chapter4() {
	const router = useRouter();
	const { answers, updateChapter } = useOnboarding();
	const data = answers.chapter4;

	function selectScenario(scenarioId: string, value: string) {
		updateChapter("chapter4", {
			scenarios: { ...data.scenarios, [scenarioId]: value },
		});
	}

	return (
		<motion.div
			className="flex flex-col gap-10"
			variants={staggerContainer}
			initial="initial"
			animate="animate"
		>
			<motion.div variants={staggerItem}>
				<h1 className="text-2xl font-light tracking-tight">Picture this...</h1>
				<p
					className="mt-2 text-sm"
					style={{ color: "var(--muted-foreground)" }}
				>
					A few scenarios to understand your energy and instincts. Go with your
					gut.
				</p>
			</motion.div>

			{SCENARIOS.map((scenario, index) => (
				<AnimatedSection key={scenario.id}>
					<section className="flex flex-col gap-3">
						<label className="text-sm font-medium">{scenario.question}</label>
						<div className="flex flex-col gap-2">
							{scenario.options.map((option) => (
								<OptionCard
									key={option.value}
									label={option.label}
									selected={data.scenarios[scenario.id] === option.value}
									onClick={() => selectScenario(scenario.id, option.value)}
								/>
							))}
						</div>
					</section>
				</AnimatedSection>
			))}

			{/* Navigation */}
			<motion.div className="flex gap-3 pb-8" variants={staggerItem}>
				<button
					type="button"
					onClick={() => router.push("/onboarding/3")}
					className="rounded-lg border px-4 py-2.5 text-sm transition-colors"
					style={{ borderColor: "var(--border)" }}
				>
					Back
				</button>
				<motion.button
					type="button"
					onClick={() => router.push("/onboarding/synthesis")}
					className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium"
					style={{
						background: "var(--accent)",
						color: "var(--accent-foreground)",
						boxShadow: "var(--shadow-sm)",
					}}
					{...hoverLift}
				>
					Almost done
				</motion.button>
			</motion.div>
		</motion.div>
	);
}

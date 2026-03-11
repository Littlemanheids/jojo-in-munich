"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/hooks/use-onboarding";
import { CATEGORIES } from "@/lib/types/onboarding";
import type { CategoryPreference, Frequency } from "@/lib/types/onboarding";
import {
	Dumbbell,
	UtensilsCrossed,
	Palette,
	Music,
	TreePine,
	Sparkles,
	BookOpen,
} from "lucide-react";
import { staggerContainer, staggerItem, hoverLift } from "@/lib/animations";
import { AnimatedSection } from "@/components/onboarding/animated-section";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
	fitness: <Dumbbell size={24} />,
	food: <UtensilsCrossed size={24} />,
	culture: <Palette size={24} />,
	nightlife: <Music size={24} />,
	outdoors: <TreePine size={24} />,
	wellness: <Sparkles size={24} />,
	learning: <BookOpen size={24} />,
};

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
	{ value: "daily", label: "Daily" },
	{ value: "weekly", label: "Weekly" },
	{ value: "monthly", label: "Monthly" },
	{ value: "occasionally", label: "Sometimes" },
];

const INTENT_SUGGESTIONS: Record<string, string[]> = {
	fitness: ["Pilates", "Gym", "Running", "Yoga", "Climbing", "Swimming"],
	food: ["Coffee spots", "Brunch", "Fine dining", "Street food", "Bakeries", "Bars"],
	culture: ["Museums", "Galleries", "Theater", "Film", "Architecture"],
	nightlife: ["Cocktail bars", "Clubs", "Live music", "Wine bars", "Beer gardens"],
	outdoors: ["Parks", "Hiking", "Cycling", "Lake swimming", "Running routes"],
	wellness: ["Spa", "Sauna", "Meditation", "Massage", "Yoga retreats"],
	learning: ["Language classes", "Workshops", "Lectures", "Meetups", "Co-working"],
};

export function Chapter3() {
	const router = useRouter();
	const { answers, updateChapter } = useOnboarding();
	const data = answers.chapter3;

	function toggleCategory(cat: string) {
		const current = data.categories[cat];
		const updated = { ...data.categories };
		if (current?.active) {
			updated[cat] = { ...current, active: false };
		} else {
			updated[cat] = {
				active: true,
				frequency: current?.frequency ?? "weekly",
				intent: current?.intent ?? "",
			};
		}
		updateChapter("chapter3", { categories: updated });
	}

	function updateCategory(cat: string, patch: Partial<CategoryPreference>) {
		const current = data.categories[cat] ?? {
			active: true,
			frequency: "weekly" as Frequency,
			intent: "",
		};
		updateChapter("chapter3", {
			categories: { ...data.categories, [cat]: { ...current, ...patch } },
		});
	}

	function toggleIntent(cat: string, intent: string) {
		const current = data.categories[cat]?.intent ?? "";
		const intents = current ? current.split(", ") : [];
		const updated = intents.includes(intent)
			? intents.filter((i) => i !== intent)
			: [...intents, intent];
		updateCategory(cat, { intent: updated.join(", ") });
	}

	return (
		<motion.div
			className="flex flex-col gap-10"
			variants={staggerContainer}
			initial="initial"
			animate="animate"
		>
			<motion.div variants={staggerItem}>
				<h1 className="text-2xl font-light tracking-tight">
					What are you into?
				</h1>
				<p
					className="mt-2 text-sm"
					style={{ color: "var(--muted-foreground)" }}
				>
					Tap categories that matter to you, then tell us more.
				</p>
			</motion.div>

			{/* Category grid */}
			<motion.div className="grid grid-cols-2 gap-3" variants={staggerItem}>
				{CATEGORIES.map((cat) => {
					const isActive = data.categories[cat]?.active;
					return (
						<motion.button
							key={cat}
							type="button"
							onClick={() => toggleCategory(cat)}
							whileTap={{ scale: 0.96 }}
							className="flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors"
							style={{
								borderColor: isActive ? "var(--accent)" : "var(--border)",
								background: isActive ? "var(--accent-muted)" : "transparent",
								boxShadow: isActive ? "var(--shadow-md)" : "var(--shadow-sm)",
								color: isActive ? "var(--accent)" : "var(--foreground)",
							}}
						>
							{CATEGORY_ICONS[cat]}
							<span className="text-sm font-medium capitalize">{cat}</span>
						</motion.button>
					);
				})}
			</motion.div>

			{/* Expanded details for active categories */}
			<AnimatePresence>
				{CATEGORIES.filter((cat) => data.categories[cat]?.active).map((cat) => (
					<AnimatedSection key={cat}>
						<section
							className="flex flex-col gap-4 rounded-xl border p-5"
							style={{
								borderColor: "var(--border)",
								boxShadow: "var(--shadow-sm)",
							}}
						>
							<h3 className="text-sm font-semibold capitalize">{cat}</h3>

							{/* Frequency */}
							<div className="flex flex-col gap-2">
								<span
									className="text-xs"
									style={{ color: "var(--muted-foreground)" }}
								>
									How often?
								</span>
								<div className="flex flex-wrap gap-2">
									{FREQUENCY_OPTIONS.map((freq) => {
										const isSelected = data.categories[cat]?.frequency === freq.value;
										return (
											<motion.button
												key={freq.value}
												type="button"
												onClick={() =>
													updateCategory(cat, { frequency: freq.value })
												}
												whileTap={{ scale: 0.95 }}
												className="rounded-full border px-3 py-1 text-xs transition-colors"
												style={{
													borderColor: isSelected
														? "var(--accent)"
														: "var(--border)",
													background: isSelected
														? "var(--accent)"
														: "transparent",
													color: isSelected
														? "var(--accent-foreground)"
														: "var(--foreground)",
												}}
											>
												{freq.label}
											</motion.button>
										);
									})}
								</div>
							</div>

							{/* Intent suggestions */}
							<div className="flex flex-col gap-2">
								<span
									className="text-xs"
									style={{ color: "var(--muted-foreground)" }}
								>
									What specifically?
								</span>
								<div className="flex flex-wrap gap-2">
									{INTENT_SUGGESTIONS[cat]?.map((intent) => {
										const currentIntents =
											data.categories[cat]?.intent?.split(", ") ?? [];
										const isSelected = currentIntents.includes(intent);
										return (
											<motion.button
												key={intent}
												type="button"
												onClick={() => toggleIntent(cat, intent)}
												whileTap={{ scale: 0.95 }}
												className="rounded-full border px-3 py-1 text-xs transition-colors"
												style={{
													borderColor: isSelected
														? "var(--accent)"
														: "var(--border)",
													background: isSelected
														? "var(--accent)"
														: "transparent",
													color: isSelected
														? "var(--accent-foreground)"
														: "var(--foreground)",
												}}
											>
												{intent}
											</motion.button>
										);
									})}
								</div>
							</div>
						</section>
					</AnimatedSection>
				))}
			</AnimatePresence>

			{/* Navigation */}
			<motion.div className="flex gap-3 pb-8" variants={staggerItem}>
				<button
					type="button"
					onClick={() => router.push("/onboarding/2")}
					className="rounded-lg border px-4 py-2.5 text-sm transition-colors"
					style={{ borderColor: "var(--border)" }}
				>
					Back
				</button>
				<motion.button
					type="button"
					onClick={() => router.push("/onboarding/4")}
					className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium"
					style={{
						background: "var(--accent)",
						color: "var(--accent-foreground)",
						boxShadow: "var(--shadow-sm)",
					}}
					{...hoverLift}
				>
					Continue
				</motion.button>
			</motion.div>
		</motion.div>
	);
}

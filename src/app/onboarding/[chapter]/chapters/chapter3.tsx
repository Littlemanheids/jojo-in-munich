"use client";

import { useRouter } from "next/navigation";
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
		<div className="flex flex-col gap-10">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">
					What are you into?
				</h1>
				<p
					className="mt-2 text-sm"
					style={{ color: "var(--muted-foreground)" }}
				>
					Tap categories that matter to you, then tell us more.
				</p>
			</div>

			{/* Category grid */}
			<div className="grid grid-cols-2 gap-3">
				{CATEGORIES.map((cat) => {
					const isActive = data.categories[cat]?.active;
					return (
						<button
							key={cat}
							type="button"
							onClick={() => toggleCategory(cat)}
							className="flex flex-col items-center gap-2 rounded-xl border p-4 transition-all"
							style={{
								borderColor: isActive ? "var(--primary)" : "var(--border)",
								background: isActive ? "var(--accent)" : "transparent",
							}}
						>
							{CATEGORY_ICONS[cat]}
							<span className="text-sm font-medium capitalize">{cat}</span>
						</button>
					);
				})}
			</div>

			{/* Expanded details for active categories */}
			{CATEGORIES.filter((cat) => data.categories[cat]?.active).map((cat) => (
				<section
					key={cat}
					className="flex flex-col gap-4 rounded-xl border p-4"
					style={{ borderColor: "var(--border)" }}
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
							{FREQUENCY_OPTIONS.map((freq) => (
								<button
									key={freq.value}
									type="button"
									onClick={() =>
										updateCategory(cat, { frequency: freq.value })
									}
									className="rounded-full border px-3 py-1 text-xs transition-all"
									style={{
										borderColor:
											data.categories[cat]?.frequency === freq.value
												? "var(--primary)"
												: "var(--border)",
										background:
											data.categories[cat]?.frequency === freq.value
												? "var(--primary)"
												: "transparent",
										color:
											data.categories[cat]?.frequency === freq.value
												? "var(--primary-foreground)"
												: "var(--foreground)",
									}}
								>
									{freq.label}
								</button>
							))}
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
									<button
										key={intent}
										type="button"
										onClick={() => toggleIntent(cat, intent)}
										className="rounded-full border px-3 py-1 text-xs transition-all"
										style={{
											borderColor: isSelected
												? "var(--primary)"
												: "var(--border)",
											background: isSelected
												? "var(--primary)"
												: "transparent",
											color: isSelected
												? "var(--primary-foreground)"
												: "var(--foreground)",
										}}
									>
										{intent}
									</button>
								);
							})}
						</div>
					</div>
				</section>
			))}

			{/* Navigation */}
			<div className="flex gap-3 pb-8">
				<button
					type="button"
					onClick={() => router.push("/onboarding/2")}
					className="rounded-lg border px-4 py-2.5 text-sm"
					style={{ borderColor: "var(--border)" }}
				>
					Back
				</button>
				<button
					type="button"
					onClick={() => router.push("/onboarding/4")}
					className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium"
					style={{
						background: "var(--primary)",
						color: "var(--primary-foreground)",
					}}
				>
					Continue
				</button>
			</div>
		</div>
	);
}

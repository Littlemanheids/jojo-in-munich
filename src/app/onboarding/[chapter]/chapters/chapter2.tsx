"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useOnboarding } from "@/hooks/use-onboarding";
import { ChipSelect } from "@/components/onboarding/chip-select";
import { SliderInput } from "@/components/onboarding/slider-input";
import { OptionCard } from "@/components/onboarding/option-card";
import { CROWD_OPTIONS } from "@/lib/types/onboarding";
import type { SocialContext } from "@/lib/types/onboarding";
import { staggerContainer, staggerItem, hoverLift } from "@/lib/animations";

export function Chapter2() {
	const router = useRouter();
	const { answers, updateChapter } = useOnboarding();
	const data = answers.chapter2;

	function update(patch: Partial<typeof data>) {
		updateChapter("chapter2", { ...data, ...patch });
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
					Your social scene
				</h1>
				<p
					className="mt-2 text-sm"
					style={{ color: "var(--muted-foreground)" }}
				>
					How are you showing up in Munich? This helps us match you to the right
					crowds and places.
				</p>
			</motion.div>

			{/* Social context */}
			<motion.section className="flex flex-col gap-3" variants={staggerItem}>
				<label className="text-sm font-medium">
					How are you navigating Munich right now?
				</label>
				<div className="flex flex-col gap-2">
					{(
						[
							{
								value: "solo",
								label: "Flying solo",
								desc: "Exploring on my own, and I like it that way",
							},
							{
								value: "building_social",
								label: "Building my circle",
								desc: "New here and actively looking for my people",
							},
							{
								value: "with_partner",
								label: "With my partner",
								desc: "Usually exploring together when they visit",
							},
							{
								value: "mixed",
								label: "A bit of everything",
								desc: "Sometimes solo, sometimes social, depends on the day",
							},
						] as const
					).map((option) => (
						<OptionCard
							key={option.value}
							label={option.label}
							description={option.desc}
							selected={data.socialContext === option.value}
							onClick={() =>
								update({ socialContext: option.value as SocialContext })
							}
						/>
					))}
				</div>
			</motion.section>

			{/* Crowd preferences */}
			<motion.section className="flex flex-col gap-3" variants={staggerItem}>
				<label className="text-sm font-medium">
					What crowds do you gravitate toward?
				</label>
				<p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
					Pick the ones that feel like your people
				</p>
				<ChipSelect
					options={CROWD_OPTIONS}
					selected={data.crowdPreferences}
					onChange={(v) => update({ crowdPreferences: v })}
				/>
			</motion.section>

			{/* Density tolerance */}
			<motion.section className="flex flex-col gap-3" variants={staggerItem}>
				<label className="text-sm font-medium">
					How do you feel about crowded places?
				</label>
				<SliderInput
					value={data.densityTolerance}
					onChange={(v) => update({ densityTolerance: v })}
					min={1}
					max={5}
					labels={{ left: "Avoid crowds", right: "Love the buzz" }}
				/>
			</motion.section>

			{/* Navigation */}
			<motion.div className="flex gap-3 pb-8" variants={staggerItem}>
				<button
					type="button"
					onClick={() => router.push("/onboarding/1")}
					className="rounded-lg border px-4 py-2.5 text-sm transition-colors"
					style={{ borderColor: "var(--border)" }}
				>
					Back
				</button>
				<motion.button
					type="button"
					onClick={() => router.push("/onboarding/3")}
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

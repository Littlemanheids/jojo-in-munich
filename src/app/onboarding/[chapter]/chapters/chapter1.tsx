"use client";

import { ChipSelect } from "@/components/onboarding/chip-select";
import { OptionCard } from "@/components/onboarding/option-card";
import { SliderInput } from "@/components/onboarding/slider-input";
import { useOnboarding } from "@/hooks/use-onboarding";
import { hoverLift, staggerContainer, staggerItem } from "@/lib/animations";
import { AESTHETIC_OPTIONS, DEALBREAKER_OPTIONS } from "@/lib/types/onboarding";
import type { PacePreference } from "@/lib/types/onboarding";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function Chapter1() {
	const router = useRouter();
	const { answers, updateChapter } = useOnboarding();
	const data = answers.chapter1;

	function update(patch: Partial<typeof data>) {
		updateChapter("chapter1", { ...data, ...patch });
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
					First things first
				</h1>
				<p
					className="mt-2 text-sm"
					style={{ color: "var(--muted-foreground)" }}
				>
					Let&apos;s figure out your energy, your pace, and what makes or breaks
					a place for you.
				</p>
			</motion.div>

			{/* Energy baseline */}
			<motion.section className="flex flex-col gap-3" variants={staggerItem}>
				<label className="text-sm font-medium">
					What&apos;s your typical energy level?
				</label>
				<SliderInput
					value={data.energyBaseline}
					onChange={(v) => update({ energyBaseline: v })}
					min={1}
					max={5}
					labels={{ left: "Chill & slow", right: "Always on the go" }}
				/>
			</motion.section>

			{/* Pace */}
			<motion.section className="flex flex-col gap-3" variants={staggerItem}>
				<label className="text-sm font-medium">
					When you explore a new city, what&apos;s your pace?
				</label>
				<div className="flex flex-col gap-2">
					{(
						[
							{
								value: "fast",
								label: "Full itinerary",
								desc: "I want to see and do as much as possible",
							},
							{
								value: "slow",
								label: "Go with the flow",
								desc: "I'd rather find one great spot and stay a while",
							},
							{
								value: "depends",
								label: "Depends on my mood",
								desc: "Some days I'm ambitious, some days I'm not",
							},
						] as const
					).map((option) => (
						<OptionCard
							key={option.value}
							label={option.label}
							description={option.desc}
							selected={data.pacePreference === option.value}
							onClick={() =>
								update({ pacePreference: option.value as PacePreference })
							}
						/>
					))}
				</div>
			</motion.section>

			{/* Aesthetic instincts */}
			<motion.section className="flex flex-col gap-3" variants={staggerItem}>
				<label className="text-sm font-medium">
					What kind of spaces draw you in?
				</label>
				<p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
					Pick as many as you like
				</p>
				<ChipSelect
					options={AESTHETIC_OPTIONS}
					selected={data.aestheticInstincts}
					onChange={(v) => update({ aestheticInstincts: v })}
				/>
			</motion.section>

			{/* Dealbreakers */}
			<motion.section className="flex flex-col gap-3" variants={staggerItem}>
				<label className="text-sm font-medium">
					What instantly kills a place for you?
				</label>
				<ChipSelect
					options={DEALBREAKER_OPTIONS}
					selected={data.dealbreakers}
					onChange={(v) => update({ dealbreakers: v })}
				/>
			</motion.section>

			{/* Navigation */}
			<motion.div className="flex gap-3 pb-8" variants={staggerItem}>
				<button
					type="button"
					onClick={() => router.push("/onboarding")}
					className="rounded-lg border px-4 py-2.5 text-sm transition-colors"
					style={{ borderColor: "var(--border)" }}
				>
					Back
				</button>
				<motion.button
					type="button"
					onClick={() => router.push("/onboarding/2")}
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

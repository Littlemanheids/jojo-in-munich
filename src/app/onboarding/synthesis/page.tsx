"use client";

import { ProgressBar } from "@/components/onboarding/progress-bar";
import { useOnboarding } from "@/hooks/use-onboarding";
import { hoverLift, staggerContainer, staggerItem } from "@/lib/animations";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SynthesisPage() {
	const router = useRouter();
	const { answers, setFreeText, reset } = useOnboarding();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit() {
		setLoading(true);
		setError(null);

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

			reset();
			router.push("/feed");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-lg">
			<ProgressBar current={5} total={5} />

			<motion.div
				className="flex flex-col gap-8"
				variants={staggerContainer}
				initial="initial"
				animate="animate"
			>
				<motion.div variants={staggerItem}>
					<h1 className="text-2xl font-light tracking-tight">One last thing</h1>
					<p
						className="mt-2 text-sm"
						style={{ color: "var(--muted-foreground)" }}
					>
						Anything else about your taste, goals, or what you&apos;re looking
						for in Munich that the questions didn&apos;t capture?
					</p>
				</motion.div>

				<motion.div variants={staggerItem}>
					<textarea
						value={answers.freeText}
						onChange={(e) => setFreeText(e.target.value)}
						placeholder="e.g. I'm really into natural wine, I want to find a climbing gym with a good community, I hate waiting in line..."
						rows={5}
						className="w-full resize-none rounded-xl border p-4 text-sm outline-none transition-all"
						style={{
							borderColor: "var(--border)",
							background: "var(--background)",
							boxShadow: "var(--shadow-sm)",
						}}
						onFocus={(e) => {
							e.target.style.boxShadow = "var(--shadow-md)";
							e.target.style.borderColor = "var(--accent)";
						}}
						onBlur={(e) => {
							e.target.style.boxShadow = "var(--shadow-sm)";
							e.target.style.borderColor = "var(--border)";
						}}
					/>
				</motion.div>

				{error && (
					<p className="text-sm" style={{ color: "var(--destructive)" }}>
						{error}
					</p>
				)}

				<motion.div className="flex gap-3 pb-8" variants={staggerItem}>
					<button
						type="button"
						onClick={() => router.push("/onboarding/4")}
						className="rounded-lg border px-4 py-2.5 text-sm transition-colors"
						style={{ borderColor: "var(--border)" }}
						disabled={loading}
					>
						Back
					</button>
					<motion.button
						type="button"
						onClick={handleSubmit}
						disabled={loading}
						className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity disabled:opacity-50"
						style={{
							background: "var(--accent)",
							color: "var(--accent-foreground)",
							boxShadow: "var(--shadow-sm)",
						}}
						{...(loading ? {} : hoverLift)}
					>
						{loading ? (
							<motion.span
								animate={{ opacity: [1, 0.5, 1] }}
								transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
							>
								Getting to know you...
							</motion.span>
						) : (
							"Finish & meet your Munich guide"
						)}
					</motion.button>
				</motion.div>
			</motion.div>
		</div>
	);
}

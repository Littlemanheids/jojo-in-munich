"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/use-onboarding";
import { ProgressBar } from "@/components/onboarding/progress-bar";

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

			<div className="flex flex-col gap-8">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						One last thing
					</h1>
					<p
						className="mt-2 text-sm"
						style={{ color: "var(--muted-foreground)" }}
					>
						Anything else about your taste, goals, or what you&apos;re looking
						for in Munich that the questions didn&apos;t capture?
					</p>
				</div>

				<textarea
					value={answers.freeText}
					onChange={(e) => setFreeText(e.target.value)}
					placeholder="e.g. I'm really into natural wine, I want to find a climbing gym with a good community, I hate waiting in line..."
					rows={5}
					className="w-full resize-none rounded-xl border p-4 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-1"
					style={{
						borderColor: "var(--border)",
						background: "var(--background)",
					}}
				/>

				{error && (
					<p className="text-sm" style={{ color: "var(--destructive)" }}>
						{error}
					</p>
				)}

				<div className="flex gap-3 pb-8">
					<button
						type="button"
						onClick={() => router.push("/onboarding/4")}
						className="rounded-lg border px-4 py-2.5 text-sm"
						style={{ borderColor: "var(--border)" }}
						disabled={loading}
					>
						Back
					</button>
					<button
						type="button"
						onClick={handleSubmit}
						disabled={loading}
						className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity disabled:opacity-50"
						style={{
							background: "var(--primary)",
							color: "var(--primary-foreground)",
						}}
					>
						{loading ? "Getting to know you..." : "Finish & meet your Munich guide"}
					</button>
				</div>
			</div>
		</div>
	);
}

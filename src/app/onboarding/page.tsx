import Link from "next/link";

export default function OnboardingWelcome() {
	return (
		<div className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
			<h1 className="text-3xl font-semibold tracking-tight">
				Let&apos;s get to know you
			</h1>
			<p
				className="mt-3 max-w-xs text-sm leading-relaxed"
				style={{ color: "var(--muted-foreground)" }}
			>
				A few questions about your vibe, your pace, and what you&apos;re looking
				for in Munich. Takes about 8 minutes.
			</p>
			<Link
				href="/onboarding/1"
				className="mt-8 inline-flex rounded-lg px-6 py-3 text-sm font-medium transition-opacity"
				style={{
					background: "var(--primary)",
					color: "var(--primary-foreground)",
				}}
			>
				Let&apos;s go
			</Link>
		</div>
	);
}

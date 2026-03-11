import { OnboardingProvider } from "@/hooks/use-onboarding";

export default function OnboardingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<OnboardingProvider>
			<div
				className="flex min-h-dvh flex-col"
				style={{ background: "var(--background)" }}
			>
				<main className="flex-1 px-6 py-12">{children}</main>
			</div>
		</OnboardingProvider>
	);
}

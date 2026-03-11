import { OnboardingProvider } from "@/hooks/use-onboarding";

export default function OnboardingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <OnboardingProvider>{children}</OnboardingProvider>;
}

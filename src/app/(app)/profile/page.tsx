import { ProfileEditor } from "@/components/profile/profile-editor";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingAnswers } from "@/lib/types/onboarding";
import { redirect } from "next/navigation";

const defaultAnswers: OnboardingAnswers = {
	chapter1: {
		energyBaseline: 3,
		pacePreference: "depends",
		aestheticInstincts: [],
		dealbreakers: [],
	},
	chapter2: {
		socialContext: "mixed",
		crowdPreferences: [],
		densityTolerance: 3,
	},
	chapter3: {
		categories: {},
	},
	chapter4: {
		scenarios: {},
	},
	freeText: "",
};

export default async function ProfilePage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) redirect("/login");

	const { data: profile } = await supabase
		.from("user_profile")
		.select("profile_text, onboarding_answers, home_neighborhood")
		.eq("user_id", user.id)
		.single();

	const answers: OnboardingAnswers =
		(profile?.onboarding_answers as unknown as OnboardingAnswers) ??
		defaultAnswers;

	const profileText: string = profile?.profile_text ?? "";

	const neighborhoods: string[] = profile?.home_neighborhood
		? [profile.home_neighborhood]
		: [];

	return (
		<ProfileEditor
			initialAnswers={answers}
			initialProfileText={profileText}
			initialNeighborhoods={neighborhoods}
		/>
	);
}

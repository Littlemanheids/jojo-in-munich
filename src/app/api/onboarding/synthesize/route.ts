import { NextResponse } from "next/server";
import { generateText } from "ai";
import { model } from "@/lib/claude/client";
import { buildSynthesisPrompt } from "@/lib/claude/prompts";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingAnswers } from "@/lib/types/onboarding";

export async function POST(request: Request) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const answers: OnboardingAnswers = body.answers;

	if (!answers) {
		return NextResponse.json(
			{ error: "Missing answers" },
			{ status: 400 },
		);
	}

	// Generate profile text via Claude
	const { text: profileText } = await generateText({
		model,
		system: buildSynthesisPrompt(),
		prompt: JSON.stringify(answers, null, 2),
	});

	// Extract structured fields from answers
	const activeCategories = Object.entries(answers.chapter3.categories)
		.filter(([, v]) => v.active)
		.map(([k]) => k);

	// Save to user_profile
	const { error: updateError } = await supabase
		.from("user_profile")
		.update({
			profile_text: profileText,
			energy_level: answers.chapter1.energyBaseline,
			social_context: answers.chapter2.socialContext,
			penalty_flags: answers.chapter1.dealbreakers,
			active_categories: activeCategories,
			onboarding_done: true,
			onboarding_answers: answers as unknown as Record<string, unknown>,
			updated_at: new Date().toISOString(),
		})
		.eq("user_id", user.id);

	if (updateError) {
		return NextResponse.json(
			{ error: "Failed to save profile" },
			{ status: 500 },
		);
	}

	return NextResponse.json({ profileText });
}

import { anthropic, model } from "@/lib/claude/client";
import { buildFeedSystemPrompt } from "@/lib/claude/prompts";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { data: profile } = await supabase
		.from("user_profile")
		.select("profile_text")
		.eq("user_id", user.id)
		.single();

	if (!profile?.profile_text) {
		return NextResponse.json(
			{ error: "Complete onboarding first" },
			{ status: 400 },
		);
	}

	const { searchParams } = new URL(request.url);
	const refresh = searchParams.get("refresh") === "true";

	// Check cache unless refresh requested
	if (!refresh) {
		const { data: cached } = await supabase
			.from("feed_cache")
			.select("items, generated_at")
			.eq("user_id", user.id)
			.eq("category", "all")
			.gt("expires_at", new Date().toISOString())
			.order("generated_at", { ascending: false })
			.limit(1)
			.single();

		if (cached) {
			return NextResponse.json({
				items: cached.items,
				generatedAt: cached.generated_at,
				cached: true,
			});
		}
	}

	// Generate fresh feed via Claude with web search
	try {
		const webSearchTool = anthropic.tools.webSearch_20250305({
			maxUses: 5,
			userLocation: {
				type: "approximate",
				country: "DE",
				region: "Bavaria",
				city: "Munich",
				timezone: "Europe/Berlin",
			},
		});

		const result = await generateText({
			model,
			system: buildFeedSystemPrompt(profile.profile_text),
			prompt: `Generate my personalized Munich feed for today, ${new Date().toLocaleDateString("en-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}. Search for current events, new openings, and interesting things happening this week in Munich.`,
			tools: {
				web_search: webSearchTool,
			},
		});

		// Parse JSON from response (handle potential markdown fences)
		let items: unknown[];
		try {
			const text = result.text.trim();
			const jsonStr = text.startsWith("[")
				? text
				: (text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)?.[1] ?? text);
			items = JSON.parse(jsonStr);
		} catch {
			return NextResponse.json(
				{ error: "Failed to parse feed data" },
				{ status: 500 },
			);
		}

		if (!Array.isArray(items)) {
			return NextResponse.json(
				{ error: "Failed to parse feed data" },
				{ status: 500 },
			);
		}

		// Add IDs to items
		const itemsWithIds = items.map((item) => ({
			...(item as Record<string, unknown>),
			id: crypto.randomUUID(),
		}));

		const now = new Date();
		const expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours

		// Cache results (non-critical — don't fail if cache write fails)
		await supabase.from("feed_cache").insert({
			user_id: user.id,
			items: itemsWithIds,
			category: "all",
			generated_at: now.toISOString(),
			expires_at: expiresAt.toISOString(),
		});

		return NextResponse.json({
			items: itemsWithIds,
			generatedAt: now.toISOString(),
			cached: false,
		});
	} catch {
		return NextResponse.json(
			{ error: "Failed to generate feed" },
			{ status: 500 },
		);
	}
}

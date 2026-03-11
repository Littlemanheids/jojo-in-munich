import { model } from "@/lib/claude/client";
import { buildChatSystemPrompt } from "@/lib/claude/prompts";
import { createClient } from "@/lib/supabase/server";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const {
		message,
		conversationId,
	}: { message: string; conversationId: string | null } = body;

	if (!message?.trim()) {
		return NextResponse.json({ error: "Message required" }, { status: 400 });
	}

	// Fetch user profile for context
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

	// Create or use existing conversation
	let convoId = conversationId;
	if (!convoId) {
		const { data: convo, error: convoError } = await supabase
			.from("conversations")
			.insert({ user_id: user.id })
			.select("id")
			.single();

		if (convoError || !convo) {
			return NextResponse.json(
				{ error: "Failed to create conversation" },
				{ status: 500 },
			);
		}
		convoId = convo.id;
	}

	// Save user message
	await supabase.from("messages").insert({
		conversation_id: convoId,
		role: "user",
		content: message,
	});

	// Fetch conversation history
	const { data: history } = await supabase
		.from("messages")
		.select("role, content")
		.eq("conversation_id", convoId)
		.order("created_at", { ascending: true })
		.limit(50);

	const messages = (history ?? []).map((m) => ({
		role: m.role as "user" | "assistant",
		content: m.content,
	}));

	// Stream response
	const result = streamText({
		model,
		system: buildChatSystemPrompt(profile.profile_text),
		messages,
		onFinish: async ({ text }) => {
			// Save assistant message
			await supabase.from("messages").insert({
				conversation_id: convoId,
				role: "assistant",
				content: text,
			});

			// Auto-title conversation if it's the first exchange
			if (messages.length <= 2) {
				const title =
					message.length > 60 ? `${message.slice(0, 57)}...` : message;
				await supabase
					.from("conversations")
					.update({
						title,
						updated_at: new Date().toISOString(),
					})
					.eq("id", convoId);
			} else {
				await supabase
					.from("conversations")
					.update({ updated_at: new Date().toISOString() })
					.eq("id", convoId);
			}
		},
	});

	return result.toTextStreamResponse({
		headers: {
			"X-Conversation-Id": convoId ?? "",
		},
	});
}

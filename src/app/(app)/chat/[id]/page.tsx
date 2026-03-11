"use client";

import { ChatThread } from "@/components/chat/chat-thread";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Message {
	role: "user" | "assistant";
	content: string;
}

export default function ChatPage() {
	const params = useParams();
	const id = params.id as string;
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadMessages() {
			const supabase = createClient();
			const { data } = await supabase
				.from("messages")
				.select("role, content")
				.eq("conversation_id", id)
				.order("created_at", { ascending: true });

			setMessages(
				(data ?? []).map((m) => ({
					role: m.role as "user" | "assistant",
					content: m.content,
				})),
			);
			setLoading(false);
		}
		loadMessages();
	}, [id]);

	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100dvh",
					background: "var(--bg)",
					color: "var(--ink-muted)",
					fontFamily: "var(--font-body), sans-serif",
					fontSize: 14,
				}}
			>
				Loading...
			</div>
		);
	}

	return <ChatThread conversationId={id} initialMessages={messages} />;
}

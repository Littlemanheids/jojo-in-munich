"use client";

import {
	fadeIn,
	fadeInTransition,
	staggerContainer,
	staggerItem,
} from "@/lib/animations";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { MessageCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Conversation {
	id: string;
	title: string | null;
	updated_at: string;
}

export default function ChatListPage() {
	const router = useRouter();
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function load() {
			const supabase = createClient();
			const { data } = await supabase
				.from("conversations")
				.select("id, title, updated_at")
				.order("updated_at", { ascending: false })
				.limit(50);

			setConversations(data ?? []);
			setLoading(false);
		}
		load();
	}, []);

	function startNewChat() {
		router.push("/chat/new");
	}

	function formatTime(dateStr: string) {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return "just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString("en-DE", {
			month: "short",
			day: "numeric",
		});
	}

	return (
		<div
			style={{
				minHeight: "100dvh",
				background: "var(--bg)",
				fontFamily: "var(--font-body), sans-serif",
			}}
		>
			{/* Header */}
			<div
				style={{
					padding: "56px 28px 20px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<h1
					style={{
						fontFamily: "var(--font-display), serif",
						fontSize: 28,
						fontWeight: 400,
						color: "var(--ink)",
						letterSpacing: "-0.01em",
					}}
				>
					Chat
				</h1>
				<motion.button
					type="button"
					onClick={startNewChat}
					whileTap={{ scale: 0.92 }}
					style={{
						width: 40,
						height: 40,
						borderRadius: 10,
						background: "var(--ink)",
						color: "var(--bg)",
						border: "none",
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Plus size={20} />
				</motion.button>
			</div>

			{/* Conversation list */}
			<div style={{ padding: "0 28px" }}>
				{loading ? (
					<div
						style={{
							padding: "48px 0",
							textAlign: "center",
							color: "var(--ink-muted)",
							fontSize: 14,
						}}
					>
						Loading...
					</div>
				) : conversations.length === 0 ? (
					<motion.div
						variants={fadeIn}
						initial="initial"
						animate="animate"
						transition={fadeInTransition}
						style={{
							padding: "64px 0",
							textAlign: "center",
						}}
					>
						<MessageCircle
							size={48}
							strokeWidth={1}
							style={{
								color: "var(--border)",
								margin: "0 auto 16px",
							}}
						/>
						<p
							style={{
								fontSize: 16,
								fontWeight: 500,
								color: "var(--ink)",
								marginBottom: 6,
							}}
						>
							No conversations yet
						</p>
						<p
							style={{
								fontSize: 14,
								color: "var(--ink-muted)",
								marginBottom: 24,
							}}
						>
							Ask your Munich friend anything.
						</p>
						<motion.button
							type="button"
							onClick={startNewChat}
							whileTap={{ scale: 0.97 }}
							style={{
								height: 48,
								padding: "0 24px",
								background: "var(--ink)",
								color: "var(--bg)",
								border: "none",
								borderRadius: 12,
								fontSize: 15,
								fontWeight: 500,
								cursor: "pointer",
								fontFamily: "var(--font-body), sans-serif",
							}}
						>
							Start a conversation
						</motion.button>
					</motion.div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="initial"
						animate="animate"
						style={{
							display: "flex",
							flexDirection: "column",
						}}
					>
						{conversations.map((convo) => (
							<motion.button
								key={convo.id}
								type="button"
								variants={staggerItem}
								onClick={() => router.push(`/chat/${convo.id}`)}
								whileTap={{ scale: 0.98 }}
								style={{
									display: "flex",
									alignItems: "center",
									gap: 14,
									padding: "16px 0",
									background: "transparent",
									border: "none",
									borderBottom: "1px solid var(--border-light)",
									cursor: "pointer",
									textAlign: "left",
									width: "100%",
									fontFamily: "var(--font-body), sans-serif",
								}}
							>
								<div
									style={{
										width: 40,
										height: 40,
										borderRadius: 10,
										background: "var(--bg-card)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										flexShrink: 0,
									}}
								>
									<MessageCircle
										size={18}
										style={{ color: "var(--ink-muted)" }}
									/>
								</div>
								<div style={{ flex: 1, minWidth: 0 }}>
									<div
										style={{
											fontSize: 15,
											fontWeight: 500,
											color: "var(--ink)",
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
										}}
									>
										{convo.title ?? "New conversation"}
									</div>
									<div
										style={{
											fontSize: 12,
											color: "var(--ink-muted)",
											marginTop: 2,
										}}
									>
										{formatTime(convo.updated_at)}
									</div>
								</div>
							</motion.button>
						))}
					</motion.div>
				)}
			</div>
		</div>
	);
}

"use client";

import { expandPanel, fadeIn, fadeInTransition } from "@/lib/animations";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowLeft,
	ArrowUp,
	Bookmark,
	BookmarkCheck,
	Check,
	Loader2,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
	id?: string;
	role: "user" | "assistant";
	content: string;
}

interface ChatThreadProps {
	conversationId: string | null;
	initialMessages?: Message[];
}

export function ChatThread({
	conversationId: initialConvoId,
	initialMessages = [],
}: ChatThreadProps) {
	const router = useRouter();
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [convoId, setConvoId] = useState<string | null>(initialConvoId);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [bookmarkFormIdx, setBookmarkFormIdx] = useState<number | null>(null);
	const [bookmarkName, setBookmarkName] = useState("");
	const [bookmarkNotes, setBookmarkNotes] = useState("");
	const [bookmarkSaving, setBookmarkSaving] = useState(false);
	const [savedMessageIdxs, setSavedMessageIdxs] = useState<Set<number>>(
		new Set(),
	);

	const saveBookmark = useCallback(
		async (msgIdx: number) => {
			if (!bookmarkName.trim() || bookmarkSaving) return;
			setBookmarkSaving(true);
			try {
				const res = await fetch("/api/bookmarks", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: bookmarkName.trim(),
						notes: bookmarkNotes.trim() || null,
					}),
				});
				if (res.ok) {
					setSavedMessageIdxs((prev) => new Set(prev).add(msgIdx));
					setBookmarkFormIdx(null);
					setBookmarkName("");
					setBookmarkNotes("");
				}
			} finally {
				setBookmarkSaving(false);
			}
		},
		[bookmarkName, bookmarkNotes, bookmarkSaving],
	);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Auto-resize textarea
	useEffect(() => {
		const el = textareaRef.current;
		if (el) {
			el.style.height = "auto";
			el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
		}
	}, [input]);

	async function sendMessage() {
		const text = input.trim();
		if (!text || loading) return;

		setInput("");
		setMessages((prev) => [...prev, { role: "user", content: text }]);
		setLoading(true);

		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: text,
					conversationId: convoId,
				}),
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error ?? "Failed to send message");
			}

			// Get conversation ID from header
			const newConvoId = res.headers.get("X-Conversation-Id");
			if (newConvoId && !convoId) {
				setConvoId(newConvoId);
				// Update URL without full navigation
				window.history.replaceState(null, "", `/chat/${newConvoId}`);
			}

			// Stream the response
			const reader = res.body?.getReader();
			if (!reader) throw new Error("No response stream");

			const decoder = new TextDecoder();
			let assistantContent = "";

			// Add empty assistant message
			setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				// Parse SSE data stream from AI SDK
				const lines = chunk.split("\n");
				for (const line of lines) {
					// AI SDK data stream format: "0:text\n"
					if (line.startsWith("0:")) {
						try {
							const text = JSON.parse(line.slice(2));
							assistantContent += text;
							setMessages((prev) => {
								const updated = [...prev];
								updated[updated.length - 1] = {
									role: "assistant",
									content: assistantContent,
								};
								return updated;
							});
						} catch {
							// Not valid JSON, skip
						}
					}
				}
			}
		} catch (err) {
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content:
						err instanceof Error
							? `Sorry, something went wrong: ${err.message}`
							: "Sorry, something went wrong.",
				},
			]);
		} finally {
			setLoading(false);
		}
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100dvh",
				background: "var(--bg)",
				fontFamily: "var(--font-body), sans-serif",
				maxWidth: 430,
				margin: "0 auto",
			}}
		>
			{/* Header */}
			<div
				style={{
					padding: "52px 20px 12px",
					display: "flex",
					alignItems: "center",
					gap: 12,
					borderBottom: "1px solid var(--border-light)",
					flexShrink: 0,
				}}
			>
				<button
					type="button"
					onClick={() => router.push("/chat")}
					style={{
						width: 36,
						height: 36,
						borderRadius: 10,
						background: "transparent",
						border: "1.5px solid var(--border)",
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "var(--ink-muted)",
						flexShrink: 0,
					}}
				>
					<ArrowLeft size={16} />
				</button>
				<span
					style={{
						fontSize: 15,
						fontWeight: 500,
						color: "var(--ink)",
					}}
				>
					Munich friend
				</span>
			</div>

			{/* Messages */}
			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "20px 20px 8px",
				}}
			>
				{messages.length === 0 && (
					<motion.div
						variants={fadeIn}
						initial="initial"
						animate="animate"
						transition={fadeInTransition}
						style={{
							textAlign: "center",
							padding: "48px 16px",
						}}
					>
						<h2
							style={{
								fontFamily: "var(--font-display), serif",
								fontSize: 24,
								fontWeight: 400,
								color: "var(--ink)",
								marginBottom: 8,
							}}
						>
							Hey, what&apos;s up?
						</h2>
						<p
							style={{
								fontSize: 14,
								color: "var(--ink-muted)",
								lineHeight: 1.5,
							}}
						>
							Ask me about places, events, neighborhoods &mdash; anything
							Munich.
						</p>
					</motion.div>
				)}

				<AnimatePresence>
					{messages.map((msg, i) => (
						<motion.div
							key={`${msg.role}-${i}`}
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.2 }}
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: msg.role === "user" ? "flex-end" : "flex-start",
								marginBottom: 12,
							}}
						>
							<div
								style={{
									maxWidth: "82%",
									padding: "12px 16px",
									borderRadius:
										msg.role === "user"
											? "14px 14px 4px 14px"
											: "14px 14px 14px 4px",
									background:
										msg.role === "user" ? "var(--ink)" : "var(--bg-card)",
									color: msg.role === "user" ? "var(--bg)" : "var(--ink)",
									fontSize: 15,
									lineHeight: 1.55,
									whiteSpace: "pre-wrap",
									wordBreak: "break-word",
								}}
							>
								{msg.content}
								{msg.role === "assistant" && msg.content === "" && loading && (
									<span
										style={{
											display: "inline-flex",
											gap: 4,
											padding: "2px 0",
										}}
									>
										<span
											style={{
												width: 6,
												height: 6,
												borderRadius: "50%",
												background: "var(--ink-muted)",
												animation: "pulse 1.4s ease infinite",
												animationDelay: "0ms",
											}}
										/>
										<span
											style={{
												width: 6,
												height: 6,
												borderRadius: "50%",
												background: "var(--ink-muted)",
												animation: "pulse 1.4s ease infinite",
												animationDelay: "200ms",
											}}
										/>
										<span
											style={{
												width: 6,
												height: 6,
												borderRadius: "50%",
												background: "var(--ink-muted)",
												animation: "pulse 1.4s ease infinite",
												animationDelay: "400ms",
											}}
										/>
									</span>
								)}
							</div>

							{/* Bookmark action for assistant messages */}
							{msg.role === "assistant" && msg.content && !loading && (
								<div style={{ maxWidth: "82%", marginTop: 4 }}>
									{savedMessageIdxs.has(i) ? (
										<span
											style={{
												display: "inline-flex",
												alignItems: "center",
												gap: 4,
												fontSize: 12,
												color: "var(--accent)",
												padding: "4px 0",
											}}
										>
											<BookmarkCheck size={14} />
											Saved
										</span>
									) : bookmarkFormIdx === i ? (
										<motion.div
											variants={expandPanel}
											initial="initial"
											animate="animate"
											exit="exit"
											style={{
												background: "var(--bg-card)",
												borderRadius: 12,
												padding: 12,
												display: "flex",
												flexDirection: "column",
												gap: 8,
												overflow: "hidden",
											}}
										>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													justifyContent: "space-between",
												}}
											>
												<span
													style={{
														fontSize: 12,
														fontWeight: 500,
														color: "var(--ink-muted)",
													}}
												>
													Save a spot
												</span>
												<button
													type="button"
													onClick={() => {
														setBookmarkFormIdx(null);
														setBookmarkName("");
														setBookmarkNotes("");
													}}
													style={{
														background: "none",
														border: "none",
														cursor: "pointer",
														color: "var(--ink-muted)",
														padding: 2,
													}}
												>
													<X size={14} />
												</button>
											</div>
											<input
												type="text"
												value={bookmarkName}
												onChange={(e) => setBookmarkName(e.target.value)}
												placeholder="Place name"
												style={{
													width: "100%",
													padding: "8px 10px",
													fontSize: 14,
													border: "1.5px solid var(--border)",
													borderRadius: 8,
													background: "var(--bg-white)",
													color: "var(--ink)",
													fontFamily: "var(--font-body), sans-serif",
													outline: "none",
												}}
												onKeyDown={(e) => {
													if (e.key === "Enter") saveBookmark(i);
												}}
											/>
											<input
												type="text"
												value={bookmarkNotes}
												onChange={(e) => setBookmarkNotes(e.target.value)}
												placeholder="Notes (optional)"
												style={{
													width: "100%",
													padding: "8px 10px",
													fontSize: 13,
													border: "1.5px solid var(--border)",
													borderRadius: 8,
													background: "var(--bg-white)",
													color: "var(--ink)",
													fontFamily: "var(--font-body), sans-serif",
													outline: "none",
												}}
												onKeyDown={(e) => {
													if (e.key === "Enter") saveBookmark(i);
												}}
											/>
											<button
												type="button"
												onClick={() => saveBookmark(i)}
												disabled={!bookmarkName.trim() || bookmarkSaving}
												style={{
													alignSelf: "flex-end",
													display: "inline-flex",
													alignItems: "center",
													gap: 5,
													padding: "6px 14px",
													fontSize: 13,
													fontWeight: 500,
													color: bookmarkName.trim()
														? "var(--bg)"
														: "var(--ink-muted)",
													background: bookmarkName.trim()
														? "var(--ink)"
														: "var(--border-light)",
													border: "none",
													borderRadius: 8,
													cursor: bookmarkName.trim() ? "pointer" : "default",
													fontFamily: "var(--font-body), sans-serif",
													transition: "all 0.15s ease",
												}}
											>
												{bookmarkSaving ? (
													<Loader2
														size={13}
														style={{
															animation: "spin 1s linear infinite",
														}}
													/>
												) : (
													<Check size={13} />
												)}
												Save
											</button>
										</motion.div>
									) : (
										<button
											type="button"
											onClick={() => {
												setBookmarkFormIdx(i);
												setBookmarkName("");
												setBookmarkNotes("");
											}}
											style={{
												background: "none",
												border: "none",
												cursor: "pointer",
												color: "var(--ink-muted)",
												opacity: 0.5,
												padding: "4px 0",
												transition: "opacity 0.15s ease",
											}}
											onMouseEnter={(e) => {
												(e.target as HTMLElement).style.opacity = "1";
											}}
											onMouseLeave={(e) => {
												(e.target as HTMLElement).style.opacity = "0.5";
											}}
										>
											<Bookmark size={14} />
										</button>
									)}
								</div>
							)}
						</motion.div>
					))}
				</AnimatePresence>
				<div ref={messagesEndRef} />
			</div>

			{/* Input area */}
			<div
				style={{
					padding: "12px 20px",
					paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
					borderTop: "1px solid var(--border-light)",
					background: "var(--bg)",
					flexShrink: 0,
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "flex-end",
						gap: 8,
						background: "var(--bg-white)",
						border: "1.5px solid var(--border)",
						borderRadius: 14,
						padding: "6px 6px 6px 16px",
					}}
				>
					<textarea
						ref={textareaRef}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Ask about Munich..."
						rows={1}
						style={{
							flex: 1,
							border: "none",
							outline: "none",
							background: "transparent",
							fontSize: 15,
							color: "var(--ink)",
							fontFamily: "var(--font-body), sans-serif",
							resize: "none",
							lineHeight: 1.4,
							padding: "8px 0",
							maxHeight: 120,
						}}
						onFocus={(e) => {
							const parent = e.target.parentElement as HTMLElement;
							if (parent) parent.style.borderColor = "var(--accent)";
						}}
						onBlur={(e) => {
							const parent = e.target.parentElement as HTMLElement;
							if (parent) parent.style.borderColor = "var(--border)";
						}}
					/>
					<motion.button
						type="button"
						onClick={sendMessage}
						disabled={!input.trim() || loading}
						whileTap={!input.trim() || loading ? {} : { scale: 0.9 }}
						style={{
							width: 36,
							height: 36,
							borderRadius: 10,
							background:
								input.trim() && !loading ? "var(--ink)" : "var(--border-light)",
							color: input.trim() && !loading ? "var(--bg)" : "var(--border)",
							border: "none",
							cursor: input.trim() && !loading ? "pointer" : "default",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
							transition: "all 0.15s ease",
						}}
					>
						{loading ? (
							<Loader2
								size={16}
								style={{
									animation: "spin 1s linear infinite",
								}}
							/>
						) : (
							<ArrowUp size={16} />
						)}
					</motion.button>
				</div>
			</div>

			{/* Typing indicator animation */}
			<style>{`
				@keyframes pulse {
					0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
					40% { opacity: 1; transform: scale(1); }
				}
			`}</style>
		</div>
	);
}

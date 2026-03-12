"use client";

import { FeedCard } from "@/components/feed/feed-card";
import {
	type PanInfo,
	motion,
	useAnimationControls,
	useMotionValue,
	useTransform,
} from "framer-motion";
import { Check, Undo2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface FeedItem {
	id: string;
	title: string;
	description: string;
	category: string;
	relevance: string;
	location?: string | null;
	neighborhood?: string | null;
	date?: string | null;
	url?: string | null;
}

interface SwipeableFeedCardProps {
	item: FeedItem;
	onFeedback: (item: FeedItem, reaction: "love" | "dismiss") => Promise<string>;
	onUndo: (feedbackId: string) => Promise<void>;
	onRemove: (itemId: string) => void;
	onSave: (item: FeedItem) => void;
	saved?: boolean;
}

const SWIPE_THRESHOLD = 100;
const UNDO_TIMEOUT = 3000;

export function SwipeableFeedCard({
	item,
	onFeedback,
	onUndo,
	onRemove,
	onSave,
	saved,
}: SwipeableFeedCardProps) {
	const [state, setState] = useState<
		"idle" | "swiped-love" | "swiped-dismiss" | "removing"
	>("idle");
	const [feedbackId, setFeedbackId] = useState<string | null>(null);
	const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const controls = useAnimationControls();
	const x = useMotionValue(0);

	// Background icon opacity — scales from 0 to 1 as drag approaches threshold
	const loveOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
	const dismissOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
		};
	}, []);

	const startUndoTimer = useCallback(() => {
		undoTimerRef.current = setTimeout(() => {
			setState("removing");
			// After collapse animation, remove from parent
			setTimeout(() => onRemove(item.id), 300);
		}, UNDO_TIMEOUT);
	}, [item.id, onRemove]);

	const handleDragEnd = useCallback(
		async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
			const offset = info.offset.x;

			if (Math.abs(offset) < SWIPE_THRESHOLD) {
				// Below threshold — spring back
				controls.start({ x: 0, opacity: 1 });
				return;
			}

			const reaction = offset > 0 ? "love" : "dismiss";

			// Animate card off-screen
			await controls.start({
				x: offset > 0 ? 400 : -400,
				opacity: 0,
				transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
			});

			setState(reaction === "love" ? "swiped-love" : "swiped-dismiss");

			try {
				const id = await onFeedback(item, reaction);
				setFeedbackId(id);
				startUndoTimer();
			} catch {
				// If API fails, restore card
				setState("idle");
				controls.start({ x: 0, opacity: 1 });
			}
		},
		[controls, item, onFeedback, startUndoTimer],
	);

	const handleUndo = useCallback(async () => {
		if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
		if (feedbackId) {
			try {
				await onUndo(feedbackId);
			} catch {
				// Undo failed — still restore card visually
			}
		}
		setFeedbackId(null);
		setState("idle");
		controls.set({ x: 0, opacity: 1 });
	}, [feedbackId, onUndo, controls]);

	// Confirmation toast state
	if (
		state === "swiped-love" ||
		state === "swiped-dismiss" ||
		state === "removing"
	) {
		const isLove = state === "swiped-love";
		const isRemoving = state === "removing";

		return (
			<motion.div
				initial={{ height: "auto", opacity: 1 }}
				animate={
					isRemoving
						? { height: 0, opacity: 0, marginBottom: 0 }
						: { height: "auto", opacity: 1 }
				}
				transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
				style={{ overflow: "hidden" }}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						padding: "14px 16px",
						borderRadius: 14,
						background: "var(--bg-card)",
						border: `1.5px solid ${isLove ? "#6B8E6B40" : "var(--destructive)30"}`,
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 8,
							fontSize: 13,
							color: "var(--ink-muted)",
						}}
					>
						{isLove ? (
							<Check size={14} style={{ color: "#6B8E6B" }} />
						) : (
							<X size={14} style={{ color: "var(--destructive)" }} />
						)}
						<span>{isLove ? "Loved it!" : "Not for me"}</span>
					</div>
					<button
						type="button"
						onClick={handleUndo}
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: 4,
							fontSize: 12,
							fontWeight: 500,
							color: "var(--accent)",
							background: "none",
							border: "none",
							cursor: "pointer",
							padding: "4px 8px",
							borderRadius: 8,
							fontFamily: "var(--font-body), sans-serif",
						}}
					>
						<Undo2 size={12} />
						Undo
					</button>
				</div>
			</motion.div>
		);
	}

	// Normal card with swipe gesture
	return (
		<div
			style={{
				position: "relative",
				overflow: "hidden",
				borderRadius: 14,
			}}
		>
			{/* Background reveal layers */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					display: "flex",
					borderRadius: 14,
				}}
			>
				{/* Dismiss (left swipe) — red background */}
				<motion.div
					style={{
						position: "absolute",
						inset: 0,
						background: "var(--destructive)",
						display: "flex",
						alignItems: "center",
						justifyContent: "flex-end",
						paddingRight: 28,
						borderRadius: 14,
						opacity: dismissOpacity,
					}}
				>
					<X size={28} style={{ color: "#fff" }} />
				</motion.div>

				{/* Love (right swipe) — green background */}
				<motion.div
					style={{
						position: "absolute",
						inset: 0,
						background: "#6B8E6B",
						display: "flex",
						alignItems: "center",
						justifyContent: "flex-start",
						paddingLeft: 28,
						borderRadius: 14,
						opacity: loveOpacity,
					}}
				>
					<Check size={28} style={{ color: "#fff" }} />
				</motion.div>
			</div>

			{/* Draggable card */}
			<motion.div
				drag="x"
				dragConstraints={{ left: 0, right: 0 }}
				dragElastic={0.7}
				onDragEnd={handleDragEnd}
				animate={controls}
				style={{
					x,
					cursor: "grab",
					position: "relative",
					zIndex: 1,
				}}
				whileDrag={{ cursor: "grabbing" }}
			>
				<FeedCard
					title={item.title}
					description={item.description}
					category={item.category}
					relevance={item.relevance}
					location={item.location}
					neighborhood={item.neighborhood}
					date={item.date}
					url={item.url}
					onSave={() => onSave(item)}
					saved={saved}
				/>
			</motion.div>
		</div>
	);
}

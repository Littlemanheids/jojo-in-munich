"use client";

import { BookmarkCard } from "@/components/bookmarks/bookmark-card";
import { fadeIn, fadeInTransition, staggerContainer } from "@/lib/animations";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface BookmarkRow {
	id: string;
	name: string;
	category: string | null;
	address: string | null;
	notes: string | null;
	url: string | null;
	message_id: string | null;
	created_at: string;
}

export default function BookmarksPage() {
	const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const fetchBookmarks = useCallback(async () => {
		try {
			const res = await fetch("/api/bookmarks");
			if (res.ok) {
				const data = await res.json();
				setBookmarks(data);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchBookmarks();
	}, [fetchBookmarks]);

	async function handleDelete(id: string) {
		setDeletingId(id);
		try {
			const res = await fetch("/api/bookmarks", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});
			if (res.ok) {
				setBookmarks((prev) => prev.filter((b) => b.id !== id));
			}
		} finally {
			setDeletingId(null);
		}
	}

	return (
		<div
			style={{
				minHeight: "100dvh",
				background: "var(--bg)",
				fontFamily: "var(--font-body), sans-serif",
				maxWidth: 430,
				margin: "0 auto",
				padding: "52px 20px 100px",
			}}
		>
			<motion.h1
				variants={fadeIn}
				initial="initial"
				animate="animate"
				transition={fadeInTransition}
				style={{
					fontFamily: "var(--font-display), serif",
					fontSize: 28,
					fontWeight: 400,
					color: "var(--ink)",
					marginBottom: 24,
				}}
			>
				Saved
			</motion.h1>

			{loading && (
				<div
					style={{
						textAlign: "center",
						padding: "48px 16px",
						color: "var(--ink-muted)",
						fontSize: 14,
					}}
				>
					Loading...
				</div>
			)}

			{!loading && bookmarks.length === 0 && (
				<motion.div
					variants={fadeIn}
					initial="initial"
					animate="animate"
					transition={fadeInTransition}
					style={{
						textAlign: "center",
						padding: "64px 24px",
					}}
				>
					<Bookmark
						size={36}
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
						No saved spots yet
					</p>
					<p
						style={{
							fontSize: 14,
							color: "var(--ink-muted)",
							lineHeight: 1.5,
						}}
					>
						When you find a place you love in chat, tap the bookmark icon to
						save it here.
					</p>
				</motion.div>
			)}

			{!loading && bookmarks.length > 0 && (
				<motion.div
					variants={staggerContainer}
					initial="initial"
					animate="animate"
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 10,
					}}
				>
					<AnimatePresence>
						{bookmarks.map((b) => (
							<BookmarkCard
								key={b.id}
								id={b.id}
								name={b.name}
								category={b.category}
								address={b.address}
								notes={b.notes}
								onDelete={handleDelete}
								deleting={deletingId === b.id}
							/>
						))}
					</AnimatePresence>
				</motion.div>
			)}
		</div>
	);
}

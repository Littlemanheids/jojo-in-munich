"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, hoverLift } from "@/lib/animations";

export default function OnboardingWelcome() {
	return (
		<motion.div
			className="flex min-h-[60dvh] flex-col items-center justify-center text-center"
			variants={staggerContainer}
			initial="initial"
			animate="animate"
		>
			{/* Decorative accent element */}
			<motion.div
				variants={staggerItem}
				className="mb-6 h-1 w-12 rounded-full"
				style={{ background: "var(--accent)" }}
			/>

			<motion.h1
				variants={staggerItem}
				className="text-4xl font-light tracking-tight"
			>
				Let&apos;s get to know you
			</motion.h1>

			<motion.p
				variants={staggerItem}
				className="mt-3 max-w-xs text-sm leading-relaxed"
				style={{ color: "var(--muted-foreground)" }}
			>
				A few questions about your vibe, your pace, and what you&apos;re looking
				for in Munich. Takes about 8 minutes.
			</motion.p>

			<motion.div variants={staggerItem}>
				<motion.div {...hoverLift}>
					<Link
						href="/onboarding/1"
						className="mt-8 inline-flex rounded-lg px-6 py-3 text-sm font-medium"
						style={{
							background: "var(--accent)",
							color: "var(--accent-foreground)",
							boxShadow: "var(--shadow-md)",
						}}
					>
						Let&apos;s go
					</Link>
				</motion.div>
			</motion.div>
		</motion.div>
	);
}

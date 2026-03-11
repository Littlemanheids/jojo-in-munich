"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { fadeSlideUp, smoothEase, staggerContainer, staggerItem, hoverLift } from "@/lib/animations";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const supabase = createClient();
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: `${window.location.origin}/callback`,
			},
		});

		if (error) {
			setError(error.message);
			setLoading(false);
			return;
		}

		setSent(true);
		setLoading(false);
	}

	return (
		<main className="flex min-h-dvh flex-col items-center justify-center px-6">
			<AnimatePresence mode="wait">
				{sent ? (
					<motion.div
						key="confirmation"
						variants={fadeSlideUp}
						initial="initial"
						animate="animate"
						exit="exit"
						transition={smoothEase}
						className="w-full max-w-sm rounded-2xl p-8 text-center"
						style={{ boxShadow: "var(--shadow-lg)" }}
					>
						<h1 className="text-2xl font-light tracking-tight">
							Check your email
						</h1>
						<p
							className="mt-3 text-sm"
							style={{ color: "var(--muted-foreground)" }}
						>
							We sent a magic link to{" "}
							<span className="font-medium" style={{ color: "var(--foreground)" }}>
								{email}
							</span>
							. Click it to sign in.
						</p>
						<button
							type="button"
							onClick={() => setSent(false)}
							className="mt-6 text-sm underline underline-offset-4"
							style={{ color: "var(--muted-foreground)" }}
						>
							Use a different email
						</button>
					</motion.div>
				) : (
					<motion.div
						key="form"
						variants={fadeSlideUp}
						initial="initial"
						animate="animate"
						exit="exit"
						transition={smoothEase}
						className="w-full max-w-sm rounded-2xl p-8"
						style={{ boxShadow: "var(--shadow-lg)" }}
					>
						<motion.div
							variants={staggerContainer}
							initial="initial"
							animate="animate"
						>
							<motion.h1
								variants={staggerItem}
								className="text-2xl font-light tracking-tight"
							>
								Jojo in Munich
							</motion.h1>
							<motion.p
								variants={staggerItem}
								className="mt-2 text-sm"
								style={{ color: "var(--muted-foreground)" }}
							>
								Your personal Munich city guide. Sign in to get started.
							</motion.p>

							<motion.form
								variants={staggerItem}
								onSubmit={handleLogin}
								className="mt-8 flex flex-col gap-4"
							>
								<label className="flex flex-col gap-1.5">
									<span className="text-sm font-medium">Email</span>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="johanna@example.com"
										required
										className="rounded-lg border px-3 py-2.5 text-sm outline-none transition-all"
										style={{
											borderColor: "var(--border)",
											background: "var(--background)",
											boxShadow: "var(--shadow-sm)",
										}}
										onFocus={(e) => {
											e.target.style.boxShadow = "var(--shadow-md)";
											e.target.style.borderColor = "var(--accent)";
										}}
										onBlur={(e) => {
											e.target.style.boxShadow = "var(--shadow-sm)";
											e.target.style.borderColor = "var(--border)";
										}}
									/>
								</label>

								{error && (
									<p className="text-sm" style={{ color: "var(--destructive)" }}>
										{error}
									</p>
								)}

								<motion.button
									type="submit"
									disabled={loading || !email}
									className="rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity disabled:opacity-50"
									style={{
										background: "var(--accent)",
										color: "var(--accent-foreground)",
										boxShadow: "var(--shadow-sm)",
									}}
									{...(loading ? {} : hoverLift)}
								>
									{loading ? "Sending..." : "Send magic link"}
								</motion.button>
							</motion.form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}

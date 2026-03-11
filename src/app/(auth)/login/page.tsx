"use client";

import { createClient } from "@/lib/supabase/client";
import { fadeIn, fadeInTransition } from "@/lib/animations";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

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
		<main
			style={{
				minHeight: "100dvh",
				background: "var(--bg)",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				padding: "0 28px",
				fontFamily: "var(--font-body), sans-serif",
			}}
		>
			<AnimatePresence mode="wait">
				{sent ? (
					<motion.div
						key="confirmation"
						variants={fadeIn}
						initial="initial"
						animate="animate"
						transition={fadeInTransition}
						style={{
							width: "100%",
							maxWidth: 380,
							textAlign: "center",
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
							Check your email
						</h1>
						<p
							style={{
								marginTop: 12,
								fontSize: 15,
								color: "var(--ink-muted)",
								lineHeight: 1.6,
							}}
						>
							We sent a magic link to{" "}
							<span
								style={{
									fontWeight: 500,
									color: "var(--ink)",
								}}
							>
								{email}
							</span>
							. Click it to sign in.
						</p>
						<button
							type="button"
							onClick={() => setSent(false)}
							style={{
								marginTop: 24,
								fontSize: 14,
								color: "var(--ink-muted)",
								background: "none",
								border: "none",
								textDecoration: "underline",
								textUnderlineOffset: 4,
								cursor: "pointer",
								fontFamily: "var(--font-body), sans-serif",
							}}
						>
							Use a different email
						</button>
					</motion.div>
				) : (
					<motion.div
						key="form"
						variants={fadeIn}
						initial="initial"
						animate="animate"
						transition={fadeInTransition}
						style={{ width: "100%", maxWidth: 380 }}
					>
						<h1
							style={{
								fontFamily: "var(--font-display), serif",
								fontSize: 32,
								fontWeight: 400,
								color: "var(--ink)",
								letterSpacing: "-0.01em",
							}}
						>
							Jojo in Munich
						</h1>
						<p
							style={{
								marginTop: 8,
								fontSize: 15,
								color: "var(--ink-light)",
								lineHeight: 1.6,
							}}
						>
							Your personal Munich city guide. Sign in to get
							started.
						</p>

						<form
							onSubmit={handleLogin}
							style={{
								marginTop: 32,
								display: "flex",
								flexDirection: "column",
								gap: 16,
							}}
						>
							<label
								style={{
									display: "flex",
									flexDirection: "column",
									gap: 6,
								}}
							>
								<span
									style={{
										fontSize: 14,
										fontWeight: 500,
										color: "var(--ink)",
									}}
								>
									Email
								</span>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="johanna@example.com"
									required
									style={{
										background: "var(--bg-white)",
										border: "1.5px solid var(--border)",
										borderRadius: 14,
										padding: 16,
										fontSize: 15,
										color: "var(--ink)",
										fontFamily:
											"var(--font-body), sans-serif",
										outline: "none",
									}}
									onFocus={(e) => {
										e.target.style.borderColor =
											"var(--accent)";
									}}
									onBlur={(e) => {
										e.target.style.borderColor =
											"var(--border)";
									}}
								/>
							</label>

							{error && (
								<p
									style={{
										fontSize: 14,
										color: "var(--destructive)",
									}}
								>
									{error}
								</p>
							)}

							<motion.button
								type="submit"
								disabled={loading || !email}
								whileTap={
									loading || !email ? {} : { scale: 0.97 }
								}
								style={{
									height: 52,
									background:
										loading || !email
											? "var(--border-light)"
											: "var(--ink)",
									color:
										loading || !email
											? "var(--border)"
											: "var(--bg)",
									border: "none",
									borderRadius: 12,
									fontSize: 15,
									fontFamily:
										"var(--font-body), sans-serif",
									fontWeight: 500,
									cursor:
										loading || !email
											? "default"
											: "pointer",
									transition: "all 0.2s ease",
									letterSpacing: "0.01em",
								}}
							>
								{loading ? "Sending..." : "Send magic link"}
							</motion.button>
						</form>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}

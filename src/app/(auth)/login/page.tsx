"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

	if (sent) {
		return (
			<main className="flex min-h-dvh flex-col items-center justify-center px-6">
				<div className="w-full max-w-sm text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
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
				</div>
			</main>
		);
	}

	return (
		<main className="flex min-h-dvh flex-col items-center justify-center px-6">
			<div className="w-full max-w-sm">
				<h1 className="text-2xl font-semibold tracking-tight">
					Jojo in Munich
				</h1>
				<p
					className="mt-2 text-sm"
					style={{ color: "var(--muted-foreground)" }}
				>
					Your personal Munich city guide. Sign in to get started.
				</p>

				<form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
					<label className="flex flex-col gap-1.5">
						<span className="text-sm font-medium">Email</span>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="johanna@example.com"
							required
							className="rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-1"
							style={{
								borderColor: "var(--border)",
								background: "var(--background)",
							}}
						/>
					</label>

					{error && (
						<p className="text-sm" style={{ color: "var(--destructive)" }}>
							{error}
						</p>
					)}

					<button
						type="submit"
						disabled={loading || !email}
						className="rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity disabled:opacity-50"
						style={{
							background: "var(--primary)",
							color: "var(--primary-foreground)",
						}}
					>
						{loading ? "Sending..." : "Send magic link"}
					</button>
				</form>
			</div>
		</main>
	);
}

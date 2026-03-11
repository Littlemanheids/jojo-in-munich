import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) redirect("/login");

	const { data: profile } = await supabase
		.from("user_profile")
		.select("profile_text, energy_level, social_context, active_categories")
		.eq("user_id", user.id)
		.single();

	return (
		<div className="px-4 pt-12">
			<h1 className="text-2xl font-semibold tracking-tight">Profile</h1>

			{profile?.profile_text ? (
				<div className="mt-6">
					<h2 className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
						Your taste profile
					</h2>
					<p className="mt-2 text-sm leading-relaxed">
						{profile.profile_text}
					</p>

					<div className="mt-6 flex flex-wrap gap-2">
						{profile.active_categories?.map((cat: string) => (
							<span
								key={cat}
								className="rounded-full px-3 py-1 text-xs font-medium"
								style={{
									background: "var(--accent)",
									color: "var(--accent-foreground)",
								}}
							>
								{cat}
							</span>
						))}
					</div>
				</div>
			) : (
				<p className="mt-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
					Complete onboarding to see your profile.
				</p>
			)}

			<form action="/api/auth/signout" method="post" className="mt-8">
				<SignOutButton />
			</form>
		</div>
	);
}

function SignOutButton() {
	return (
		<button
			type="submit"
			className="rounded-lg border px-4 py-2 text-sm transition-colors"
			style={{ borderColor: "var(--border)" }}
		>
			Sign out
		</button>
	);
}

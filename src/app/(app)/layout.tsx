import Link from "next/link";
import { Home, MessageCircle, Bookmark, User } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-dvh flex-col">
			<main className="flex-1 pb-16">{children}</main>

			{/* Bottom navigation */}
			<nav
				className="fixed bottom-0 left-0 right-0 flex items-center justify-around border-t px-2 py-2 backdrop-blur-lg"
				style={{
					borderColor: "var(--border)",
					background: "color-mix(in srgb, var(--background) 80%, transparent)",
				}}
			>
				<NavItem href="/feed" icon={<Home size={22} />} label="Feed" />
				<NavItem href="/chat" icon={<MessageCircle size={22} />} label="Chat" />
				<NavItem
					href="/bookmarks"
					icon={<Bookmark size={22} />}
					label="Saved"
				/>
				<NavItem href="/profile" icon={<User size={22} />} label="Profile" />
			</nav>
		</div>
	);
}

function NavItem({
	href,
	icon,
	label,
}: {
	href: string;
	icon: React.ReactNode;
	label: string;
}) {
	return (
		<Link
			href={href}
			className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors"
			style={{ color: "var(--muted-foreground)" }}
		>
			{icon}
			<span>{label}</span>
		</Link>
	);
}

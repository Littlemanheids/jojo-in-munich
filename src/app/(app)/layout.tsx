"use client";

import { Bookmark, Home, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	return (
		<div className="flex min-h-dvh flex-col">
			<main className="flex-1 pb-16">{children}</main>

			{/* Bottom navigation — warm frosted glass */}
			<nav
				className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 py-2 backdrop-blur-xl"
				style={{
					background: "color-mix(in srgb, var(--background) 80%, transparent)",
					boxShadow: "0 -1px 12px rgba(44, 40, 37, 0.06)",
				}}
			>
				<NavItem
					href="/feed"
					icon={<Home size={22} />}
					label="Feed"
					active={pathname === "/feed"}
				/>
				<NavItem
					href="/chat"
					icon={<MessageCircle size={22} />}
					label="Chat"
					active={pathname === "/chat"}
				/>
				<NavItem
					href="/bookmarks"
					icon={<Bookmark size={22} />}
					label="Saved"
					active={pathname === "/bookmarks"}
				/>
				<NavItem
					href="/profile"
					icon={<User size={22} />}
					label="Profile"
					active={pathname === "/profile"}
				/>
			</nav>
		</div>
	);
}

function NavItem({
	href,
	icon,
	label,
	active,
}: {
	href: string;
	icon: React.ReactNode;
	label: string;
	active: boolean;
}) {
	return (
		<Link
			href={href}
			className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors duration-200"
			style={{ color: active ? "var(--accent)" : "var(--muted-foreground)" }}
		>
			{icon}
			<span>{label}</span>
		</Link>
	);
}

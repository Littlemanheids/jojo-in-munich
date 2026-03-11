"use client";

import { Bookmark, Home, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppLayout({
	children,
}: { children: React.ReactNode }) {
	const pathname = usePathname();

	return (
		<div
			style={{
				minHeight: "100dvh",
				display: "flex",
				flexDirection: "column",
				background: "var(--bg)",
			}}
		>
			<main style={{ flex: 1, paddingBottom: 80 }}>{children}</main>

			<nav
				style={{
					position: "fixed",
					bottom: 0,
					left: 0,
					right: 0,
					height: 64,
					paddingBottom: "env(safe-area-inset-bottom, 0px)",
					background: "var(--bg)",
					borderTop: "1px solid var(--border-light)",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-around",
					fontFamily: "var(--font-body), sans-serif",
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
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 2,
				padding: "4px 12px",
				fontSize: 11,
				letterSpacing: "0.04em",
				color: active ? "var(--ink)" : "var(--ink-muted)",
				textDecoration: "none",
				transition: "color 0.2s ease",
				fontFamily: "var(--font-body), sans-serif",
			}}
		>
			{icon}
			<span>{label}</span>
		</Link>
	);
}

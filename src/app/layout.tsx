import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	style: ["normal", "italic"],
	variable: "--font-display",
	display: "swap",
});

const dmSans = DM_Sans({
	subsets: ["latin"],
	weight: ["300", "400", "500"],
	variable: "--font-body",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Jojo in Munich",
	description: "Your personal Munich city intelligence agent",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: "#F7F4EF",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
			<body style={{ fontFamily: "var(--font-body), sans-serif" }}>
				{children}
			</body>
		</html>
	);
}

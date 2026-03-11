import type { Transition, Variants } from "framer-motion";

// Screen transitions — horizontal slide
export const slideTransition: Transition = {
	duration: 0.22,
	ease: [0.25, 0.1, 0.25, 1],
};

export const slideForward: Variants = {
	initial: { opacity: 0, x: 60 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -60 },
};

export const slideBack: Variants = {
	initial: { opacity: 0, x: -60 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: 60 },
};

// Component enter — fade + subtle rise
export const fadeIn: Variants = {
	initial: { opacity: 0, y: 8 },
	animate: { opacity: 1, y: 0 },
};

export const fadeInTransition: Transition = {
	duration: 0.2,
	ease: [0.25, 0.1, 0.25, 1],
};

// Stagger for list items (option cards, chips)
export const staggerContainer: Variants = {
	initial: {},
	animate: {
		transition: {
			staggerChildren: 0.04,
			delayChildren: 0.05,
		},
	},
};

export const staggerItem: Variants = {
	initial: { opacity: 0, y: 6 },
	animate: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.2,
			ease: [0.25, 0.1, 0.25, 1],
		},
	},
};

// Expand panel
export const expandPanel: Variants = {
	initial: { height: 0, opacity: 0 },
	animate: {
		height: "auto",
		opacity: 1,
		transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
	},
	exit: {
		height: 0,
		opacity: 0,
		transition: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] },
	},
};

// Button press
export const tapScale = {
	whileTap: { scale: 0.97 },
	transition: { duration: 0.1 } as Transition,
};

// Synthesis checklist item
export const checklistItem: Variants = {
	initial: { opacity: 0, x: -8 },
	animate: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
	},
};

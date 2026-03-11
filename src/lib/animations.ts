import type { Transition, Variants } from "framer-motion";

export const springTransition: Transition = {
	type: "spring",
	stiffness: 300,
	damping: 30,
};

export const gentleSpring: Transition = {
	type: "spring",
	stiffness: 200,
	damping: 25,
};

export const smoothEase: Transition = {
	duration: 0.4,
	ease: [0.25, 0.1, 0.25, 1],
};

export const fadeSlideUp: Variants = {
	initial: { opacity: 0, y: 12 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -8 },
};

export const staggerContainer: Variants = {
	initial: {},
	animate: {
		transition: {
			staggerChildren: 0.08,
			delayChildren: 0.05,
		},
	},
};

export const staggerItem: Variants = {
	initial: { opacity: 0, y: 16 },
	animate: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.4,
			ease: [0.25, 0.1, 0.25, 1],
		},
	},
};

export const scaleOnTap = {
	whileTap: { scale: 0.97 },
	transition: springTransition,
};

export const hoverLift = {
	whileHover: { y: -1 },
	whileTap: { scale: 0.98 },
	transition: springTransition,
};

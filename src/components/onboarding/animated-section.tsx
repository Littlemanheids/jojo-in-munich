"use client";

import { staggerItem } from "@/lib/animations";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface AnimatedSectionProps {
	children: React.ReactNode;
	className?: string;
}

export function AnimatedSection({ children, className }: AnimatedSectionProps) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-40px" });

	return (
		<motion.div
			ref={ref}
			variants={staggerItem}
			initial="initial"
			animate={isInView ? "animate" : "initial"}
			className={className}
		>
			{children}
		</motion.div>
	);
}

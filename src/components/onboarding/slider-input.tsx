"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";

interface SliderInputProps {
	value: number;
	onChange: (value: number) => void;
	min: number;
	max: number;
	labels?: { left: string; right: string };
}

export function SliderInput({
	value,
	onChange,
	min,
	max,
	labels,
}: SliderInputProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const steps = max - min;
	const normalizedValue = (value - min) / steps;

	const x = useMotionValue(0);
	const fillWidth = useTransform(
		() => `${normalizedValue * 100}%`,
	);

	const snapToStep = useCallback(
		(clientX: number) => {
			const track = trackRef.current;
			if (!track) return;
			const rect = track.getBoundingClientRect();
			const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
			const stepped = Math.round(ratio * steps);
			onChange(min + stepped);
		},
		[min, steps, onChange],
	);

	function handleTrackClick(e: React.MouseEvent) {
		snapToStep(e.clientX);
	}

	function handleDragEnd(_: unknown, info: PanInfo) {
		const track = trackRef.current;
		if (!track) return;
		const rect = track.getBoundingClientRect();
		const thumbCenter = rect.left + normalizedValue * rect.width + info.offset.x;
		snapToStep(thumbCenter);
		x.set(0);
	}

	return (
		<div>
			<div
				ref={trackRef}
				className="relative flex h-8 cursor-pointer items-center"
				onClick={handleTrackClick}
				onKeyDown={() => {}}
			>
				{/* Track background */}
				<div
					className="absolute h-1.5 w-full rounded-full"
					style={{ background: "var(--muted)" }}
				/>

				{/* Filled portion */}
				<motion.div
					className="absolute h-1.5 rounded-full"
					style={{
						background: "var(--accent)",
						width: fillWidth,
					}}
				/>

				{/* Step dots */}
				{Array.from({ length: steps + 1 }, (_, i) => (
					<div
						key={i}
						className="absolute h-2 w-2 -translate-x-1/2 rounded-full"
						style={{
							left: `${(i / steps) * 100}%`,
							background:
								i <= value - min
									? "var(--accent)"
									: "var(--border)",
						}}
					/>
				))}

				{/* Thumb */}
				<motion.div
					drag="x"
					dragConstraints={{ left: 0, right: 0 }}
					dragElastic={0}
					dragMomentum={false}
					onDragEnd={handleDragEnd}
					whileTap={{ scale: 1.15 }}
					className="absolute h-6 w-6 -translate-x-1/2 cursor-grab rounded-full active:cursor-grabbing"
					style={{
						x,
						left: `${normalizedValue * 100}%`,
						background: "var(--background)",
						border: "2px solid var(--accent)",
						boxShadow: "var(--shadow-md)",
					}}
				/>
			</div>
			{labels && (
				<div
					className="mt-1 flex justify-between text-xs"
					style={{ color: "var(--muted-foreground)" }}
				>
					<span>{labels.left}</span>
					<span>{labels.right}</span>
				</div>
			)}
		</div>
	);
}

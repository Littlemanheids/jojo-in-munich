"use client";

interface OptionCardProps {
	label: string;
	description?: string;
	selected: boolean;
	onClick: () => void;
}

export function OptionCard({
	label,
	description,
	selected,
	onClick,
}: OptionCardProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full rounded-xl border p-4 text-left transition-all"
			style={{
				borderColor: selected ? "var(--primary)" : "var(--border)",
				background: selected ? "var(--accent)" : "transparent",
			}}
		>
			<span className="text-sm font-medium">{label}</span>
			{description && (
				<p
					className="mt-1 text-xs"
					style={{ color: "var(--muted-foreground)" }}
				>
					{description}
				</p>
			)}
		</button>
	);
}

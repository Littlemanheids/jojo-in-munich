"use client";

import { useParams, useRouter } from "next/navigation";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { Chapter1 } from "./chapters/chapter1";
import { Chapter2 } from "./chapters/chapter2";
import { Chapter3 } from "./chapters/chapter3";
import { Chapter4 } from "./chapters/chapter4";

const TOTAL_STEPS = 5; // 4 chapters + synthesis

const chapters: Record<string, React.ComponentType> = {
	"1": Chapter1,
	"2": Chapter2,
	"3": Chapter3,
	"4": Chapter4,
};

export default function ChapterPage() {
	const params = useParams();
	const router = useRouter();
	const chapter = params.chapter as string;

	const ChapterComponent = chapters[chapter];

	if (!ChapterComponent) {
		router.replace("/onboarding");
		return null;
	}

	return (
		<div className="mx-auto max-w-lg">
			<ProgressBar current={Number(chapter)} total={TOTAL_STEPS} />
			<ChapterComponent />
		</div>
	);
}

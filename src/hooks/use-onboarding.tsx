"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { OnboardingAnswers } from "@/lib/types/onboarding";

const STORAGE_KEY = "jojo-onboarding-answers";

const defaultAnswers: OnboardingAnswers = {
	chapter1: {
		energyBaseline: 3,
		pacePreference: "depends",
		aestheticInstincts: [],
		dealbreakers: [],
	},
	chapter2: {
		socialContext: "mixed",
		crowdPreferences: [],
		densityTolerance: 3,
	},
	chapter3: {
		categories: {},
	},
	chapter4: {
		scenarios: {},
	},
	freeText: "",
};

interface OnboardingContextType {
	answers: OnboardingAnswers;
	updateChapter: <K extends keyof OnboardingAnswers>(
		chapter: K,
		data: OnboardingAnswers[K],
	) => void;
	setFreeText: (text: string) => void;
	reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [answers, setAnswers] = useState<OnboardingAnswers>(defaultAnswers);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				setAnswers(JSON.parse(stored));
			} catch {
				// corrupted storage, use defaults
			}
		}
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (hydrated) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
		}
	}, [answers, hydrated]);

	const updateChapter = useCallback(
		<K extends keyof OnboardingAnswers>(
			chapter: K,
			data: OnboardingAnswers[K],
		) => {
			setAnswers((prev) => ({ ...prev, [chapter]: data }));
		},
		[],
	);

	const setFreeText = useCallback((text: string) => {
		setAnswers((prev) => ({ ...prev, freeText: text }));
	}, []);

	const reset = useCallback(() => {
		setAnswers(defaultAnswers);
		localStorage.removeItem(STORAGE_KEY);
	}, []);

	if (!hydrated) return null;

	return (
		<OnboardingContext.Provider
			value={{ answers, updateChapter, setFreeText, reset }}
		>
			{children}
		</OnboardingContext.Provider>
	);
}

export function useOnboarding() {
	const ctx = useContext(OnboardingContext);
	if (!ctx)
		throw new Error("useOnboarding must be used within OnboardingProvider");
	return ctx;
}

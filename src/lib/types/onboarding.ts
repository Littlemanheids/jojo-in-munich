export type PacePreference = "fast" | "slow" | "depends";

export type SocialContext =
	| "solo"
	| "building_social"
	| "with_partner"
	| "mixed";

export type Frequency = "daily" | "weekly" | "monthly" | "occasionally";

export interface CategoryPreference {
	active: boolean;
	frequency: Frequency;
	intent: string;
}

export interface OnboardingAnswers {
	chapter1: {
		energyBaseline: number;
		pacePreference: PacePreference;
		aestheticInstincts: string[];
		dealbreakers: string[];
	};
	chapter2: {
		socialContext: SocialContext;
		crowdPreferences: string[];
		densityTolerance: number;
	};
	chapter3: {
		categories: Record<string, CategoryPreference>;
	};
	chapter4: {
		scenarios: Record<string, string>;
	};
	freeText: string;
}

export const CATEGORIES = [
	"fitness",
	"food",
	"culture",
	"nightlife",
	"outdoors",
	"wellness",
	"learning",
] as const;

export const AESTHETIC_OPTIONS = [
	"minimal",
	"cozy",
	"industrial",
	"vintage",
	"modern",
	"eclectic",
	"scandinavian",
	"mediterranean",
] as const;

export const DEALBREAKER_OPTIONS = [
	"tourist traps",
	"loud music",
	"overcrowded",
	"overpriced",
	"bad service",
	"no outdoor seating",
	"hard to reach",
	"chain restaurants",
] as const;

export const CROWD_OPTIONS = [
	"young professionals",
	"artists & creatives",
	"students",
	"expats",
	"locals only",
	"families",
	"tech crowd",
] as const;

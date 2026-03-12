"use client";

import { FeedCard } from "@/components/feed/feed-card";
import {
	APIProvider,
	AdvancedMarker,
	Map as GoogleMap,
	Pin,
} from "@vis.gl/react-google-maps";
import { X } from "lucide-react";
import { useState } from "react";

// ─── TYPES ───────────────────────────────────────────────

interface FeedItem {
	id: string;
	title: string;
	description: string;
	category: string;
	relevance: string;
	location?: string | null;
	neighborhood?: string | null;
	date?: string | null;
	url?: string | null;
}

interface FeedMapProps {
	items: FeedItem[];
	onLove?: (item: FeedItem) => void;
	onDismiss?: (item: FeedItem) => void;
}

// ─── NEIGHBORHOOD COORDINATES ────────────────────────────

const NEIGHBORHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
	schwabing: { lat: 48.1656, lng: 11.5861 },
	maxvorstadt: { lat: 48.1519, lng: 11.5665 },
	glockenbachviertel: { lat: 48.1291, lng: 11.5697 },
	haidhausen: { lat: 48.1289, lng: 11.5975 },
	isarvorstadt: { lat: 48.1275, lng: 11.5711 },
	sendling: { lat: 48.1162, lng: 11.5498 },
	neuhausen: { lat: 48.1563, lng: 11.5368 },
	nymphenburg: { lat: 48.1583, lng: 11.5178 },
	au: { lat: 48.1234, lng: 11.5905 },
	lehel: { lat: 48.1419, lng: 11.5878 },
	altstadt: { lat: 48.1371, lng: 11.5761 },
	bogenhausen: { lat: 48.1503, lng: 11.6105 },
	westend: { lat: 48.1366, lng: 11.5388 },
	"english garden": { lat: 48.1642, lng: 11.6054 },
	viktualienmarkt: { lat: 48.1351, lng: 11.5768 },
	olympiapark: { lat: 48.1754, lng: 11.5521 },
	giesing: { lat: 48.1094, lng: 11.5797 },
	laim: { lat: 48.1397, lng: 11.5116 },
	pasing: { lat: 48.1419, lng: 11.4582 },
	// Default Munich center
	münchen: { lat: 48.1351, lng: 11.582 },
	munich: { lat: 48.1351, lng: 11.582 },
};

// Munich center
const MUNICH_CENTER = { lat: 48.1371, lng: 11.5761 };

// ─── CATEGORY COLORS ─────────────────────────────────────

const CATEGORY_PIN_COLORS: Record<
	string,
	{ bg: string; glyph: string; border: string }
> = {
	event: { bg: "#7B7BA0", glyph: "#fff", border: "#5C5C82" },
	opening: { bg: "#D4764E", glyph: "#fff", border: "#B85E3A" },
	pick: { bg: "#6B8E6B", glyph: "#fff", border: "#527852" },
	tip: { bg: "#B8926A", glyph: "#fff", border: "#9A7A52" },
};

// ─── MAP STYLING ─────────────────────────────────────────

const MAP_STYLES = [
	{ elementType: "geometry", stylers: [{ color: "#f0ebe2" }] },
	{ elementType: "labels.text.fill", stylers: [{ color: "#6b6358" }] },
	{ elementType: "labels.text.stroke", stylers: [{ color: "#f7f4ef" }] },
	{
		featureType: "water",
		elementType: "geometry",
		stylers: [{ color: "#c8d4d8" }],
	},
	{
		featureType: "road",
		elementType: "geometry",
		stylers: [{ color: "#e8e0d4" }],
	},
	{
		featureType: "road",
		elementType: "geometry.stroke",
		stylers: [{ color: "#d4c9b8" }],
	},
	{
		featureType: "road.highway",
		elementType: "geometry",
		stylers: [{ color: "#d4c9b8" }],
	},
	{
		featureType: "road",
		elementType: "labels.text.fill",
		stylers: [{ color: "#9a8e7e" }],
	},
	{
		featureType: "poi",
		elementType: "labels",
		stylers: [{ visibility: "off" }],
	},
	{
		featureType: "poi.park",
		elementType: "geometry",
		stylers: [{ color: "#d4dbc8" }],
	},
	{
		featureType: "poi.park",
		elementType: "labels",
		stylers: [{ visibility: "on" }],
	},
	{
		featureType: "poi.park",
		elementType: "labels.text.fill",
		stylers: [{ color: "#8a9a7a" }],
	},
	{
		featureType: "transit",
		stylers: [{ visibility: "off" }],
	},
	{
		featureType: "administrative",
		elementType: "geometry.stroke",
		stylers: [{ color: "#d4c9b8" }],
	},
];

// ─── HELPERS ─────────────────────────────────────────────

function getItemCoords(item: FeedItem): { lat: number; lng: number } | null {
	const search = (item.neighborhood ?? item.location ?? "").toLowerCase();
	if (!search) return null;

	for (const [name, coords] of Object.entries(NEIGHBORHOOD_COORDS)) {
		if (search.includes(name)) return coords;
	}
	// If we have some location text but no match, place near center with jitter
	if (search.length > 0) {
		const jitter = () => (Math.random() - 0.5) * 0.008;
		return {
			lat: MUNICH_CENTER.lat + jitter(),
			lng: MUNICH_CENTER.lng + jitter(),
		};
	}
	return null;
}

// ─── COMPONENT ───────────────────────────────────────────

export function FeedMap({ items, onLove, onDismiss }: FeedMapProps) {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

	if (!apiKey) {
		return (
			<div
				style={{
					padding: "48px 24px",
					textAlign: "center",
					color: "var(--ink-muted)",
					fontSize: 14,
				}}
			>
				Map unavailable — API key not configured.
			</div>
		);
	}

	const mappedItems = items
		.map((item) => ({
			item,
			coords: getItemCoords(item),
		}))
		.filter(
			(
				entry,
			): entry is { item: FeedItem; coords: { lat: number; lng: number } } =>
				entry.coords !== null,
		);

	const selectedItem = items.find((i) => i.id === selectedId);

	return (
		<APIProvider apiKey={apiKey}>
			<div
				style={{
					position: "relative",
					width: "100%",
					height: "60dvh",
					borderRadius: 14,
					overflow: "hidden",
				}}
			>
				<GoogleMap
					defaultCenter={MUNICH_CENTER}
					defaultZoom={13}
					gestureHandling="greedy"
					disableDefaultUI
					styles={MAP_STYLES}
					onClick={() => setSelectedId(null)}
				>
					{mappedItems.map(({ item, coords }) => {
						const colors = CATEGORY_PIN_COLORS[item.category.toLowerCase()] ?? {
							bg: "#8b6f47",
							glyph: "#fff",
							border: "#6b5530",
						};
						return (
							<AdvancedMarker
								key={item.id}
								position={coords}
								onClick={() => setSelectedId(item.id)}
							>
								<Pin
									background={colors.bg}
									glyphColor={colors.glyph}
									borderColor={colors.border}
								/>
							</AdvancedMarker>
						);
					})}
				</GoogleMap>

				{/* Selected item card overlay */}
				{selectedItem && (
					<div
						style={{
							position: "absolute",
							bottom: 12,
							left: 12,
							right: 12,
							zIndex: 10,
						}}
					>
						<div style={{ position: "relative" }}>
							<button
								type="button"
								onClick={() => setSelectedId(null)}
								style={{
									position: "absolute",
									top: 10,
									right: 10,
									zIndex: 11,
									width: 28,
									height: 28,
									borderRadius: "50%",
									background: "var(--bg)",
									border: "1px solid var(--border-light)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									cursor: "pointer",
								}}
							>
								<X size={14} style={{ color: "var(--ink-muted)" }} />
							</button>
							<FeedCard
								title={selectedItem.title}
								description={selectedItem.description}
								category={selectedItem.category}
								relevance={selectedItem.relevance}
								location={selectedItem.location}
								neighborhood={selectedItem.neighborhood}
								date={selectedItem.date}
								url={selectedItem.url}
								showFeedbackButtons={!!(onLove && onDismiss)}
								onLove={() => {
									onLove?.(selectedItem);
									setSelectedId(null);
								}}
								onDismiss={() => {
									onDismiss?.(selectedItem);
									setSelectedId(null);
								}}
							/>
						</div>
					</div>
				)}
			</div>

			{/* Items not on map */}
			{mappedItems.length < items.length && (
				<p
					style={{
						fontSize: 12,
						color: "var(--ink-muted)",
						marginTop: 8,
						textAlign: "center",
					}}
				>
					{items.length - mappedItems.length} item
					{items.length - mappedItems.length !== 1 ? "s" : ""} without a mapped
					location
				</p>
			)}
		</APIProvider>
	);
}

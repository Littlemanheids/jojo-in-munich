import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const {
		itemTitle,
		itemCategory,
		itemNeighborhood,
		itemDescription,
		reaction,
	} = body;

	if (!itemTitle?.trim()) {
		return NextResponse.json(
			{ error: "Item title is required" },
			{ status: 400 },
		);
	}

	if (reaction !== "love" && reaction !== "dismiss") {
		return NextResponse.json(
			{ error: "Reaction must be 'love' or 'dismiss'" },
			{ status: 400 },
		);
	}

	const { data, error } = await supabase
		.from("feed_feedback")
		.insert({
			user_id: user.id,
			item_title: itemTitle.trim(),
			item_category: itemCategory || null,
			item_neighborhood: itemNeighborhood || null,
			item_description: itemDescription || null,
			reaction,
		})
		.select("id, reaction")
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");

	if (!id) {
		return NextResponse.json(
			{ error: "Feedback ID required" },
			{ status: 400 },
		);
	}

	const { error } = await supabase
		.from("feed_feedback")
		.delete()
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}

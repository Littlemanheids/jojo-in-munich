import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { data, error } = await supabase
		.from("bookmarks")
		.select("*")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false });

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(data);
}

export async function POST(request: Request) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { name, category, address, notes, url, messageId } = body;

	if (!name?.trim()) {
		return NextResponse.json({ error: "Name is required" }, { status: 400 });
	}

	const { data, error } = await supabase
		.from("bookmarks")
		.insert({
			user_id: user.id,
			name: name.trim(),
			category: category || null,
			address: address || null,
			notes: notes || null,
			url: url || null,
			message_id: messageId || null,
		})
		.select()
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

	const body = await request.json();
	const { id } = body;

	if (!id) {
		return NextResponse.json(
			{ error: "Bookmark ID required" },
			{ status: 400 },
		);
	}

	const { error } = await supabase
		.from("bookmarks")
		.delete()
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}

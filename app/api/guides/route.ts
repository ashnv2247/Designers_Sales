import { NextRequest, NextResponse } from "next/server";
import { getGuides, createGuide, updateGuide, deleteGuide } from "@/lib/db";

export async function GET() {
  const guides = await getGuides();
  return NextResponse.json({ guides });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.title || !data.city) {
      return NextResponse.json({ error: "Title and City are required" }, { status: 400 });
    }
    const created = await createGuide({
      ...data,
      id: data.id || `guide-${Date.now()}`,
      readingTime: data.readingTime || "8 Min Read",
      heroImage: data.heroImage || "/images/hero/hero-main.jpg",
      published: data.published !== false,
    });
    return NextResponse.json({ success: true, guide: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Guide ID is required" }, { status: 400 });
    }
    const updated = await updateGuide(id, updates);
    return NextResponse.json({ success: true, guide: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID query parameter is required" }, { status: 400 });
    }
    await deleteGuide(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


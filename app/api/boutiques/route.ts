import { NextRequest, NextResponse } from "next/server";
import { getBoutiques, createBoutique, updateBoutique, deleteBoutique } from "@/lib/db";

export async function GET() {
  const boutiques = await getBoutiques();
  return NextResponse.json({ boutiques });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.name || !data.city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const created = await createBoutique({
      ...data,
      id: data.id || `boutique-${Date.now()}`,
    });
    return NextResponse.json({ success: true, boutique: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Boutique ID is required" }, { status: 400 });
    }
    const updated = await updateBoutique(id, updates);
    return NextResponse.json({ success: true, boutique: updated });
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
    await deleteBoutique(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import {
  getJournalArticles,
  createJournalArticle,
  updateJournalArticle,
  deleteJournalArticle,
} from "@/lib/db";

export async function GET() {
  const articles = await getJournalArticles();
  return NextResponse.json({ articles });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.title || !data.category) {
      return NextResponse.json({ error: "Title and Category are required" }, { status: 400 });
    }
    const created = await createJournalArticle({
      ...data,
      id: data.id || `article-${Date.now()}`,
      date: data.date || "OCTOBER 2026",
      readTime: data.readTime || "5 MIN READ",
      author: data.author || "DS/ EDITORIAL BOARD",
      image: data.image || "/images/generated/melbourne-laneway.jpg",
      published: data.published !== false,
    });
    return NextResponse.json({ success: true, article: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
    }
    const updated = await updateJournalArticle(id, updates);
    return NextResponse.json({ success: true, article: updated });
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
    await deleteJournalArticle(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


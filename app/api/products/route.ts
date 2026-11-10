import { NextRequest, NextResponse } from "next/server";
import {
  getProducts,
  getProductsByBoutique,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const boutiqueId = searchParams.get("boutiqueId");

  if (boutiqueId) {
    const products = await getProductsByBoutique(boutiqueId);
    return NextResponse.json({ products });
  }

  const products = await getProducts();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.name || !data.price || !data.designer) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }
    const created = await createProduct({
      ...data,
      id: data.id || `prod-${Date.now()}`,
      price: Number(data.price),
      currency: data.currency || "AUD",
      inStock: data.inStock !== false,
      featured: Boolean(data.featured),
    });
    return NextResponse.json({ success: true, product: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    if (updates.price !== undefined) updates.price = Number(updates.price);
    const updated = await updateProduct(id, updates);
    return NextResponse.json({ success: true, product: updated });
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
    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


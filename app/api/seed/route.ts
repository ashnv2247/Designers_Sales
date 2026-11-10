import { NextResponse } from "next/server";
import { seedSupabaseDatabase } from "@/lib/db";
import { checkSupabaseConnection } from "@/lib/supabaseClient";

export async function GET() {
  const isConnected = await checkSupabaseConnection();
  return NextResponse.json({
    supabaseConnected: isConnected,
    mode: isConnected ? "Supabase Live Database" : "Local In-Memory Dynamic Store",
  });
}

export async function POST() {
  const result = await seedSupabaseDatabase();
  return NextResponse.json(result);
}


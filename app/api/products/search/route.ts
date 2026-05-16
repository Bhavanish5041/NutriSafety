import { searchProducts } from "@/lib/product";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ products: [] });

  try {
    return NextResponse.json({ products: await searchProducts(q) });
  } catch {
    return NextResponse.json({ error: "Search unavailable", products: [] }, { status: 502 });
  }
}

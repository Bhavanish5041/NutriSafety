import { fetchProductByBarcode } from "@/lib/product";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { barcode: string } }) {
  try {
    const product = await fetchProductByBarcode(params.barcode);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Unable to fetch product" }, { status: 502 });
  }
}

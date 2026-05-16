import { NextResponse } from "next/server";
import efsa from "@/data/efsa-restricted.json";
import fssai from "@/data/fssai-restricted.json";

export async function GET() {
  return NextResponse.json({ fssai, efsa });
}

export async function POST(request: Request) {
  const dataset = await request.json();
  return NextResponse.json({
    message: "Dataset received for demo validation. Persist to data/*.json for production workflows.",
    records: Array.isArray(dataset) ? dataset.length : 1
  });
}

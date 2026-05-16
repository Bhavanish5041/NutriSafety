import { explainIngredient } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { ingredient } = await request.json();
    if (!ingredient) return NextResponse.json({ error: "Ingredient is required" }, { status: 400 });
    return NextResponse.json({ explanation: await explainIngredient(ingredient) });
  } catch {
    return NextResponse.json({ error: "Unable to explain ingredient" }, { status: 500 });
  }
}

import { analyzeHealthRisk, detectHiddenHarms, generateNutritionSummary } from "@/lib/ai";
import { checkCompliance } from "@/lib/compliance";
import { prisma } from "@/lib/prisma";
import type { HealthProfile, Product } from "@/types";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { product: Product; profile?: HealthProfile };
    const session = await getServerSession(authOptions);
    const profile = body.profile ?? { conditions: [] };
    const [risk, harms, compliance, nutritionSummary] = await Promise.all([
      analyzeHealthRisk(body.product, profile),
      detectHiddenHarms(body.product),
      checkCompliance(body.product),
      generateNutritionSummary(body.product)
    ]);

    if (session?.user?.id) {
      await prisma.scanHistory.create({
        data: {
          userId: session.user.id,
          barcode: body.product.barcode,
          productName: body.product.name,
          healthScore: risk.healthScore,
          riskLevel: risk.riskLevel
        }
      });
    }

    return NextResponse.json({ risk, harms, compliance, nutritionSummary });
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

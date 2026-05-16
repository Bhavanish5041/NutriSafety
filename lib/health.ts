import type { HealthProfile, HealthRiskAnalysis, Product } from "@/types";

export function localHealthRisk(product: Product, profile?: HealthProfile): HealthRiskAnalysis {
  const conditions = profile?.conditions ?? [];
  const warnings: string[] = [];
  const badges: string[] = [];
  let score = 92;

  const sugar = product.nutrition.sugar ?? 0;
  const sodium = product.nutrition.sodium ?? 0;
  const protein = product.nutrition.protein ?? 0;
  const ingredients = `${product.ingredientsText ?? product.ingredients.join(", ")}`.toLowerCase();

  if (sugar > 12) {
    score -= 18;
    badges.push("High sugar");
    if (conditions.includes("diabetes") || conditions.includes("low_sugar")) {
      warnings.push("High sugar may be unsuitable for diabetic or low-sugar diets.");
      score -= 14;
    }
  }
  if (sodium > 450) {
    score -= 18;
    badges.push("High sodium");
    if (conditions.includes("hypertension") || conditions.includes("kidney_disease")) {
      warnings.push("High sodium may be risky for hypertension or kidney disease.");
      score -= 14;
    }
  }
  if (/milk|whey|lactose|casein/.test(ingredients) && conditions.includes("lactose_intolerance")) {
    warnings.push("Contains milk-derived ingredients that may trigger lactose intolerance.");
    badges.push("Lactose alert");
    score -= 22;
  }
  if (/wheat|barley|rye|gluten/.test(ingredients) && conditions.includes("gluten_intolerance")) {
    warnings.push("Contains gluten-related ingredients.");
    badges.push("Gluten alert");
    score -= 22;
  }
  if (conditions.includes("vegan") && /milk|egg|honey|gelatin|fish|chicken|beef/.test(ingredients)) {
    warnings.push("May contain animal-derived ingredients and may not fit a vegan profile.");
    badges.push("Vegan mismatch");
    score -= 18;
  }
  if (conditions.includes("high_protein") && protein < 8) {
    warnings.push("Protein is modest for a high-protein or gym-focused goal.");
    badges.push("Low protein");
    score -= 8;
  }

  const healthScore = Math.max(10, Math.min(100, Math.round(score)));
  const riskLevel = healthScore >= 72 ? "safe" : healthScore >= 45 ? "moderate" : "avoid";

  return {
    healthScore,
    riskLevel,
    badges: [...new Set(badges)],
    warnings: warnings.length ? warnings : ["No major personalized risk signals detected."],
    summary:
      riskLevel === "safe"
        ? "This product appears reasonable for the selected profile, but portion size still matters."
        : riskLevel === "moderate"
          ? "This product has a few risk signals. Review the warnings before consuming regularly."
          : "This product has strong risk signals for the selected profile. Consider avoiding or choosing an alternative."
  };
}

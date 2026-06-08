import type { HealthProfile, HealthRiskAnalysis, Product } from "./types";

export function localHealthRisk(product: Product, profile?: HealthProfile): HealthRiskAnalysis {
  const conditions = profile?.conditions ?? [];
  const warnings: string[] = [];
  const badges: string[] = [];
  let score = 100;

  const sugar = product.nutrition.sugar ?? 0;
  const sodium = product.nutrition.sodium ?? 0;
  const protein = product.nutrition.protein ?? 0;
  const saturatedFat = product.nutrition.saturatedFat ?? 0;
  const fiber = product.nutrition.fiber ?? 0;
  const energy = product.nutrition.energyKcal ?? 0;
  const novaScore = product.novaScore ?? 0;
  const ecoScore = product.ecoScore ?? 'UNKNOWN';

  const ingredients = `${product.ingredientsText ?? product.ingredients.join(", ")}`.toLowerCase();

  // Base nutrition penalties and boosts
  if (sugar > 12) {
    score -= 25;
    badges.push("High sugar");
  } else if (sugar > 5) {
    score -= 10;
  }

  if (sodium > 450) {
    score -= 25;
    badges.push("High sodium");
  } else if (sodium > 150) {
    score -= 10;
  }

  if (saturatedFat > 5) {
    score -= 15;
    badges.push("High sat. fat");
  } else if (saturatedFat > 2) {
    score -= 5;
  }

  if (energy > 400) {
    score -= 15;
    badges.push("Calorie dense");
  }

  if (novaScore === 4) {
    score -= 30;
    badges.push("Ultra-processed");
  } else if (novaScore === 3) {
    score -= 15;
  }

  if (ecoScore === 'E') {
    score -= 15;
  } else if (ecoScore === 'D') {
    score -= 8;
  }

  if (protein >= 10) {
    score += 5;
    badges.push("High protein");
  }
  if (fiber >= 5) {
    score += 10;
    badges.push("High fiber");
  } else if (fiber >= 3) {
    score += 5;
  }

  // Ingredient-based facts (Penalties for common harmful additives)
  if (/aspartame|sucralose|saccharin|acesulfame|erythritol/.test(ingredients)) {
    score -= 15;
    badges.push("Artificial sweeteners");
    warnings.push("Contains artificial sweeteners which may affect gut health.");
  }
  if (/high fructose corn syrup|hfcs/.test(ingredients)) {
    score -= 20;
    badges.push("HFCS");
    warnings.push("Contains High Fructose Corn Syrup, linked to metabolic issues.");
  }
  if (/palm oil|palm kernel oil/.test(ingredients)) {
    score -= 10;
    badges.push("Palm oil");
  }
  if (/sodium benzoate|bht|bha|potassium sorbate|nitrate|nitrite/.test(ingredients)) {
    score -= 10;
    badges.push("Preservatives");
  }
  if (/red 40|yellow 5|yellow 6|blue 1|blue 2|artificial color|colorant/.test(ingredients)) {
    score -= 10;
    badges.push("Artificial colors");
  }
  if (/msg|monosodium glutamate/.test(ingredients)) {
    score -= 5;
    badges.push("Contains MSG");
  }

  // Missing data penalty for incomplete database entries
  const hasMissingData = product.nutrition.sugar === undefined || product.nutrition.sodium === undefined;
  if (hasMissingData) {
    if (novaScore >= 3 || energy > 350 || saturatedFat > 3) {
      score -= 25;
      badges.push("Incomplete data penalty");
      warnings.push("Crucial nutrition data (sugar/sodium) is missing from the database, but other metrics indicate this is a processed or calorie-dense food. Score has been penalized.");
    } else {
      warnings.push("Nutrition data is incomplete in the database. This score might be artificially high.");
    }
  }

  // Profile-based conditions
  if (sugar > 12 && (conditions.includes("diabetes") || conditions.includes("low_sugar"))) {
    warnings.push("High sugar may be unsuitable for diabetic or low-sugar diets.");
    score -= 15;
  }
  if (sodium > 450 && (conditions.includes("hypertension") || conditions.includes("kidney_disease"))) {
    warnings.push("High sodium may be risky for hypertension or kidney disease.");
    score -= 15;
  }
  if (/milk|whey|lactose|casein/.test(ingredients) && conditions.includes("lactose_intolerance")) {
    warnings.push("Contains milk-derived ingredients that may trigger lactose intolerance.");
    badges.push("Lactose alert");
    score -= 25;
  }
  if (/wheat|barley|rye|gluten/.test(ingredients) && conditions.includes("gluten_intolerance")) {
    warnings.push("Contains gluten-related ingredients.");
    badges.push("Gluten alert");
    score -= 25;
  }
  if (conditions.includes("vegan") && /milk|egg|honey|gelatin|fish|chicken|beef/.test(ingredients)) {
    warnings.push("May contain animal-derived ingredients and may not fit a vegan profile.");
    badges.push("Vegan mismatch");
    score -= 20;
  }
  if (conditions.includes("high_protein") && protein < 8) {
    warnings.push("Protein is modest for a high-protein or gym-focused goal.");
    badges.push("Low protein");
    score -= 10;
  }

  const healthScore = Math.max(10, Math.min(100, Math.round(score)));
  const riskLevel = healthScore >= 72 ? "safe" : healthScore >= 45 ? "moderate" : "avoid";

  return {
    healthScore,
    riskLevel,
    badges: Array.from(new Set(badges)),
    warnings: warnings.length ? warnings : ["No major personalized risk signals detected."],
    summary:
      riskLevel === "safe"
        ? "This product appears reasonable for the selected profile, but portion size still matters."
        : riskLevel === "moderate"
          ? "This product has a few risk signals. Review the warnings before consuming regularly."
          : "This product has strong risk signals for the selected profile. Consider avoiding or choosing an alternative."
  };
}

import { prisma } from "@/lib/prisma";
import { localHealthRisk } from "@/lib/health";
import type {
  HealthProfile,
  HealthRiskAnalysis,
  HiddenHarm,
  IngredientExplanation,
  Product
} from "@/types";

const model = process.env.GROQ_MODEL ?? "llama-3.1-70b-versatile";

async function groqJson<T>(system: string, prompt: string, fallback: T): Promise<T> {
  if (!process.env.GROQ_API_KEY) return fallback;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) return fallback;
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return fallback;

  try {
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

export async function explainIngredient(ingredient: string): Promise<IngredientExplanation> {
  const normalized = ingredient.trim().toLowerCase();
  const cached = await prisma.ingredientExplanationCache.findUnique({
    where: { ingredient: normalized }
  });
  if (cached?.explanation) return JSON.parse(cached.explanation) as IngredientExplanation;

  const fallback: IngredientExplanation = {
    ingredient,
    purpose: "Used as part of the product formula.",
    explanation: `${ingredient} is listed as an ingredient. Review the product label for quantity and allergen context.`,
    sideEffects: "Most ingredients are portion-dependent. Sensitive users should check with a qualified professional.",
    classification: /benzoate|sorbate|nitrite|sulfite/.test(normalized) ? "preservative" : "unknown"
  };

  const result = await groqJson<IngredientExplanation>(
    "Return concise JSON only. Be medically cautious and user-friendly.",
    `Explain this food ingredient for a consumer: ${ingredient}. Return keys ingredient, purpose, explanation, sideEffects, classification where classification is additive, preservative, artificial, natural, or unknown.`,
    fallback
  );

  await prisma.ingredientExplanationCache.upsert({
    where: { ingredient: normalized },
    create: { ingredient: normalized, explanation: JSON.stringify(result) },
    update: { explanation: JSON.stringify(result) }
  });

  return result;
}

export async function analyzeHealthRisk(
  product: Product,
  profile?: HealthProfile
): Promise<HealthRiskAnalysis> {
  const fallback = localHealthRisk(product, profile);
  return groqJson<HealthRiskAnalysis>(
    "Return valid JSON only. Avoid diagnosis. Use cautious wording. Keep warnings concise.",
    `Analyze this product for the user's health profile. Return healthScore 0-100, riskLevel safe/moderate/avoid, badges array, warnings array, summary string.
Product: ${JSON.stringify(product)}
Profile: ${JSON.stringify(profile ?? { conditions: [] })}`,
    fallback
  );
}

export async function detectHiddenHarms(product: Product): Promise<HiddenHarm[]> {
  const fallback: HiddenHarm[] = [];
  const claims = product.claims.join(" ").toLowerCase();
  if (claims.includes("sugar free") && /aspartame|sucralose|acesulfame|saccharin/i.test(product.ingredientsText ?? "")) {
    fallback.push({
      title: "Sugar-free claim with sweeteners",
      severity: "moderate",
      description: "This product may rely on artificial sweeteners despite a sugar-free claim."
    });
  }
  if (claims.includes("healthy") && (product.nutrition.sodium ?? 0) > 450) {
    fallback.push({
      title: "Healthy claim vs sodium",
      severity: "moderate",
      description: "The product appears to market wellness while carrying a high sodium load."
    });
  }

  const wrapped = await groqJson<{ harms: HiddenHarm[] }>(
    "Return JSON only with a harms array. Identify misleading claims conservatively.",
    `Detect hidden harms and misleading nutrition claims for this product: ${JSON.stringify(product)}`,
    { harms: fallback }
  );
  return wrapped.harms ?? fallback;
}

export async function generateNutritionSummary(product: Product): Promise<{ summary: string }> {
  const sugar = product.nutrition.sugar ?? 0;
  const sodium = product.nutrition.sodium ?? 0;
  const fallback = {
    summary: `Per 100g, this product has ${sugar || "unknown"}g sugar and ${sodium || "unknown"}mg sodium. Use the score with your personal profile.`
  };

  return groqJson(
    "Return JSON only with a concise summary string for consumers.",
    `Summarize this nutrition profile in simple language: ${JSON.stringify(product.nutrition)}`,
    fallback
  );
}

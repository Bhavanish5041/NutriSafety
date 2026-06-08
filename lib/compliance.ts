import efsa from "@/data/efsa-restricted.json";
import fssai from "@/data/fssai-restricted.json";
import type { ComplianceResult, Product } from "@/types";

type StaticRule = { ingredient: string; status: "Restricted" | "Monitor"; notes: string };

export async function checkCompliance(product: Product): Promise<ComplianceResult[]> {
  const text = `${product.ingredientsText ?? product.ingredients.join(", ")}`.toLowerCase();

  const fssaiHits = matchStaticRules(text, fssai as StaticRule[]);
  const efsaHits = matchStaticRules(text, efsa as StaticRule[]);
  const fdaNotes = await checkOpenFda(product.ingredients);

  return [
    {
      region: "FDA",
      status: fdaNotes.length ? "Monitor" : "Allowed",
      notes: fdaNotes.length ? fdaNotes : ["No obvious FDA restriction signals found from available data."]
    },
    {
      region: "FSSAI",
      status: fssaiHits.some((hit) => hit.status === "Restricted") ? "Restricted" : fssaiHits.length ? "Monitor" : "Allowed",
      notes: fssaiHits.length ? fssaiHits.map((hit) => `${hit.ingredient}: ${hit.notes}`) : ["No match in local FSSAI sample dataset."]
    },
    {
      region: "EFSA",
      status: efsaHits.some((hit) => hit.status === "Restricted") ? "Restricted" : efsaHits.length ? "Monitor" : "Allowed",
      notes: efsaHits.length ? efsaHits.map((hit) => `${hit.ingredient}: ${hit.notes}`) : ["No match in local EFSA sample dataset."]
    }
  ];
}

function matchStaticRules(text: string, rules: StaticRule[]) {
  return rules.filter((rule) => text.includes(rule.ingredient));
}

async function checkOpenFda(ingredients: string[]) {
  const notes: string[] = [];
  const watch = ingredients.slice(0, 5);

  await Promise.all(
    watch.map(async (ingredient) => {
      try {
        const params = new URLSearchParams({
          search: `product_description:"${ingredient}"`,
          limit: "1"
        });
        const response = await fetch(`https://api.fda.gov/food/enforcement.json?${params}`, {
          next: { revalidate: 86400 }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.results?.length) notes.push(`${ingredient}: appears in FDA enforcement records, review context.`);
        }
      } catch {
        return;
      }
    })
  );

  return notes.slice(0, 3);
}

import type { ComplianceResult, Product } from "./types";

export async function checkCompliance(product: Product): Promise<ComplianceResult[]> {
  const fdaNotes = await checkOpenFda(product.ingredients);

  return [
    {
      region: "FDA",
      status: fdaNotes.length ? "Monitor" : "Allowed",
      notes: fdaNotes.length ? fdaNotes : ["No obvious FDA restriction signals found from available data."]
    }
  ];
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
        const response = await fetch(`https://api.fda.gov/food/enforcement.json?${params}`);
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

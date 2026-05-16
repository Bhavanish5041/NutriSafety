import type { Product } from "@/types";

type OpenFoodFactsProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  ingredients_text?: string;
  ingredients?: { text?: string }[];
  allergens_tags?: string[];
  labels_tags?: string[];
  categories_tags?: string[];
  ecoscore_grade?: string;
  nova_group?: number;
  nutriments?: Record<string, number>;
};

export function normalizeProduct(raw: OpenFoodFactsProduct): Product {
  const nutriments = raw.nutriments ?? {};
  const ingredients =
    raw.ingredients?.map((item) => item.text?.trim()).filter(Boolean) as string[] | undefined;

  return {
    barcode: raw.code,
    name: raw.product_name || "Unknown product",
    brand: raw.brands,
    image: raw.image_front_url,
    ingredients:
      ingredients?.length
        ? ingredients
        : raw.ingredients_text
          ? raw.ingredients_text.split(/[,;]\s*/).filter(Boolean).slice(0, 24)
          : [],
    ingredientsText: raw.ingredients_text,
    allergens: (raw.allergens_tags ?? []).map(cleanTag),
    certifications: (raw.labels_tags ?? []).map(cleanTag).slice(0, 8),
    claims: [...(raw.labels_tags ?? []), ...(raw.categories_tags ?? [])].map(cleanTag),
    ecoScore: raw.ecoscore_grade?.toUpperCase(),
    novaScore: raw.nova_group,
    nutrition: {
      energyKcal: nutriments["energy-kcal_100g"],
      sugar: nutriments.sugars_100g,
      sodium: nutriments.sodium_100g ? Math.round(nutriments.sodium_100g * 1000) : undefined,
      protein: nutriments.proteins_100g,
      fat: nutriments.fat_100g,
      saturatedFat: nutriments["saturated-fat_100g"],
      carbohydrates: nutriments.carbohydrates_100g,
      fiber: nutriments.fiber_100g
    }
  };
}

export async function fetchProductByBarcode(barcode: string) {
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
    next: { revalidate: 3600 }
  });

  if (!response.ok) throw new Error("Open Food Facts request failed");
  const data = await response.json();
  if (!data.product) return null;
  return normalizeProduct({ ...data.product, code: data.code });
}

export async function searchProducts(query: string) {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: "8"
  });

  const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params}`, {
    next: { revalidate: 900 }
  });

  if (!response.ok) throw new Error("Open Food Facts search failed");
  const data = await response.json();
  return ((data.products ?? []) as OpenFoodFactsProduct[]).map(normalizeProduct);
}

function cleanTag(tag: string) {
  return tag.replace(/^[a-z]{2}:/, "").replaceAll("-", " ");
}

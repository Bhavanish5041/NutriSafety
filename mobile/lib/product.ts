import type { Product } from "./types";

type OpenFoodFactsProduct = {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  generic_name?: string;
  brands?: string;
  brands_tags?: string[];
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
    name: raw.product_name || raw.product_name_en || raw.generic_name || "Unknown product",
    brand: raw.brands || (raw.brands_tags && raw.brands_tags.length > 0 ? cleanTag(raw.brands_tags[0]) : undefined),
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
    category: raw.categories_tags && raw.categories_tags.length > 0 
      ? cleanTag(raw.categories_tags[raw.categories_tags.length - 1]) 
      : undefined,
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

export async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
  // Try multiple OpenFoodFacts domains for better coverage (especially Indian products)
  const domains = [
    'world.openfoodfacts.org',
    'in.openfoodfacts.org',
  ];

  for (const domain of domains) {
    try {
      const response = await fetch(`https://${domain}/api/v2/product/${barcode}.json`);
      if (!response.ok) continue;
      const data = await response.json();
      if (data.product && data.product.product_name) {
        return normalizeProduct({ ...data.product, code: data.code ?? barcode });
      }
    } catch {
      continue;
    }
  }

  // Fallback: try the older v0 API (sometimes has entries v2 doesn't surface)
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    if (response.ok) {
      const data = await response.json();
      if (data.status === 1 && data.product) {
        return normalizeProduct({ ...data.product, code: barcode });
      }
    }
  } catch {
    // ignore
  }

  return null;
}

function cleanTag(tag: string) {
  return tag.replace(/^[a-z]{2}:/, "").replaceAll("-", " ");
}

export async function fetchAlternatives(category: string): Promise<Product[]> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(category)}&sort_by=nutriscore_score&json=true&page_size=15`;
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const data = await response.json();
    if (!data.products) return [];

    return data.products
      .filter((p: any) => p.product_name && p.code)
      .map((p: any) => normalizeProduct(p))
      .filter((p: Product) => p.name !== "Unknown product");
  } catch {
    return [];
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    // If query is strictly a sequence of digits (min 7 for short barcodes, up to 14), treat as barcode
    const isBarcode = /^\d{7,14}$/.test(cleanQuery);
    if (isBarcode) {
      const p = await fetchProductByBarcode(cleanQuery);
      if (p) return [p];
      // If barcode not found, fall through and try text search just in case
    }

    // Try text search (sort by popularity to get the best matches first, remove search_simple restriction)
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(cleanQuery)}&action=process&json=true&page_size=24&sort_by=unique_scans_n`;
    let response = await fetch(url);
    let data = response.ok ? await response.json() : { products: [] };
    
    // Fallback to regional India database if global returns nothing
    if (!data.products || data.products.length === 0) {
      const fallbackUrl = `https://in.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(cleanQuery)}&action=process&json=true&page_size=20`;
      response = await fetch(fallbackUrl);
      data = response.ok ? await response.json() : { products: [] };
    }

    if (!data.products) return [];

    return data.products
      .filter((p: any) => p.code)
      .map((p: any) => normalizeProduct(p))
      .filter((p: Product) => p.name !== "Unknown product");
  } catch {
    return [];
  }
}

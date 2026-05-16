"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader2, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HealthScoreBadge } from "@/components/health-score-badge";
import { NutritionChart } from "@/components/nutrition-chart";
import { IngredientModal } from "@/components/ingredient-modal";
import { ComplianceCard } from "@/components/compliance-card";
import { RiskBanner } from "@/components/risk-banner";
import type { ComplianceResult, HealthProfile, HealthRiskAnalysis, HiddenHarm, Product } from "@/types";

type Analysis = {
  risk: HealthRiskAnalysis;
  harms: HiddenHarm[];
  compliance: ComplianceResult[];
  nutritionSummary: { summary: string };
};

export function ProductAnalysis({ barcode }: { barcode: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const productResponse = await fetch(`/api/products/${barcode}`);
      const productData = await productResponse.json();
      if (!productResponse.ok) {
        toast.error(productData.error ?? "Product unavailable");
        setLoading(false);
        return;
      }
      setProduct(productData.product);

      const profileResponse = await fetch("/api/profile");
      const profileData = (await profileResponse.json()) as { profile: HealthProfile };
      const analysisResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productData.product, profile: profileData.profile })
      });
      setAnalysis(await analysisResponse.json());
      setLoading(false);
    }
    load();
  }, [barcode]);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center text-shield-forest">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Building AI analysis...
      </main>
    );
  }

  if (!product) {
    return <main className="mx-auto max-w-4xl px-4 py-10 text-shield-forest">Product not found.</main>;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="overflow-hidden p-0">
          <div className="relative h-80 bg-shield-mint">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill className="object-contain p-8" />
            ) : (
              <div className="flex h-full items-center justify-center text-shield-forest/40">
                <PackageSearch className="h-20 w-20" />
              </div>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-900/60 dark:text-emerald-50/60">{product.brand}</p>
                <CardTitle className="text-3xl">{product.name}</CardTitle>
              </div>
              {analysis && <HealthScoreBadge score={analysis.risk.healthScore} level={analysis.risk.riskLevel} />}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-base">{analysis?.risk.summary}</p>
            <p>{analysis?.nutritionSummary.summary}</p>
            <div className="flex flex-wrap gap-2">
              {analysis?.risk.badges.map((badge) => <Badge key={badge} className="border-emerald-200 bg-shield-mint text-shield-forest">{badge}</Badge>)}
              {product.allergens.map((allergen) => <Badge key={allergen} className="border-yellow-200 bg-yellow-50 text-yellow-800">{allergen}</Badge>)}
            </div>
          </CardContent>
        </Card>
      </section>

      {analysis && <RiskBanner harms={analysis.harms} />}

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nutrition profile</CardTitle>
          </CardHeader>
          <CardContent>
            <NutritionChart product={product} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ingredients explained</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {product.ingredients.length ? product.ingredients.slice(0, 18).map((ingredient) => (
              <IngredientModal key={ingredient} ingredient={ingredient} />
            )) : "No ingredient list available."}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {analysis?.compliance.map((result) => <ComplianceCard key={result.region} result={result} />)}
      </section>
    </main>
  );
}

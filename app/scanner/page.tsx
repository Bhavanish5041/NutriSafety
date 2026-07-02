"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/product-card";
import { ScanAnimation } from "@/components/scan-animation";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";

const CameraScanner = dynamic(() => import("@/components/camera-scanner").then((mod) => mod.CameraScanner), {
  ssr: false,
  loading: () => <ScanAnimation />
});

export default function ScannerPage() {
  const [barcode, setBarcode] = useState("");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRecent(JSON.parse(localStorage.getItem("nutrisafety-recent") ?? "[]"));
  }, []);

  const suggestions = useMemo(
    () => recent.filter((item) => item.toLowerCase().includes(query.toLowerCase())).slice(0, 4),
    [query, recent]
  );

  function saveRecent(value: string) {
    const next = [value, ...recent.filter((item) => item !== value)].slice(0, 6);
    setRecent(next);
    localStorage.setItem("nutrisafety-recent", JSON.stringify(next));
  }

  async function fetchBarcode(code = barcode) {
    if (!code.trim()) return;
    setLoading(true);
    const response = await fetch(`/api/products/${code.trim()}`);
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      toast.error(data.error ?? "Product not found");
      return;
    }
    saveRecent(code.trim());
    setProducts([data.product]);
    toast.success("Product fetched");
  }

  async function searchProducts(term = query) {
    if (!term.trim()) return;
    setLoading(true);
    const response = await fetch(`/api/products/search?q=${encodeURIComponent(term.trim())}`);
    const data = await response.json();
    setLoading(false);
    setProducts(data.products ?? []);
    saveRecent(term.trim());
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Real-time barcode scanner</CardTitle>
            <p className="text-sm text-emerald-900/60 dark:text-emerald-50/60">Camera scanning uses html5-qrcode when permission is available.</p>
          </CardHeader>
          <CardContent>
            <CameraScanner onScan={(code) => { setBarcode(code); fetchBarcode(code); }} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manual barcode entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input value={barcode} onChange={(event) => setBarcode(event.target.value)} placeholder="8901234567890" />
              <Button onClick={() => fetchBarcode()} disabled={loading}>
                <ScanBarcode className="h-4 w-4" />
                Fetch
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
      <section className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Search by name</Label>
            <div className="flex gap-3">
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="protein bar, cereal, juice..." />
              <Button onClick={() => searchProducts()} disabled={loading}>
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
            {!!suggestions.length && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((item) => (
                  <Button key={item} variant="outline" size="sm" onClick={() => { setQuery(item); searchProducts(item); }}>
                    {item}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((product) => <ProductCard key={`${product.barcode}-${product.name}`} product={product} />)}
          </div>
        )}
      </section>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Leaf, PackageSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const href = product.barcode ? `/products/${product.barcode}` : `/scanner?product=${encodeURIComponent(product.name)}`;

  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0">
      <div className="relative h-44 bg-shield-mint">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-contain p-4 transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-shield-forest/40">
            <PackageSearch className="h-16 w-16" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <CardHeader className="mb-3">
          <CardTitle className="line-clamp-2">{product.name}</CardTitle>
          <p className="text-sm text-emerald-900/60 dark:text-emerald-50/60">{product.brand || "Brand unavailable"}</p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between p-0">
          <div className="mb-4 flex flex-wrap gap-2">
            {product.ecoScore && <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">Eco {product.ecoScore}</Badge>}
            {product.novaScore && <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">NOVA {product.novaScore}</Badge>}
            {product.certifications.slice(0, 2).map((cert) => (
              <Badge key={cert} className="border-emerald-200 bg-white text-emerald-800">
                <Leaf className="mr-1 h-3 w-3" />
                {cert}
              </Badge>
            ))}
          </div>
          <Button asChild variant="secondary">
            <Link href={href}>View analysis</Link>
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}

import { ProductAnalysis } from "@/components/product-analysis";

export default function ProductPage({ params }: { params: { barcode: string } }) {
  return <ProductAnalysis barcode={params.barcode} />;
}

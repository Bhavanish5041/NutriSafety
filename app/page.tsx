import Link from "next/link";
import { ArrowRight, BadgeCheck, Brain, ChartNoAxesCombined, ScanLine, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { title: "Barcode intelligence", icon: ScanLine, text: "Scan products and fetch live Open Food Facts data instantly." },
  { title: "Personal risk analysis", icon: Brain, text: "Match ingredients and nutrition against diabetes, hypertension, vegan, gluten-free, and gym goals." },
  { title: "Global compliance", icon: BadgeCheck, text: "Check FDA signals plus sample FSSAI and EFSA restricted ingredient datasets." },
  { title: "Analytics dashboard", icon: ChartNoAxesCombined, text: "Track safe vs risky products, score trends, and scan history." }
];

export default function LandingPage() {
  return (
    <main>
      <section className="glass-grid mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-semibold text-shield-forest shadow-sm">
            <Sparkles className="h-4 w-4" />
            Food compliance meets personalized nutrition
          </div>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-shield-forest dark:text-emerald-50 md:text-7xl">
              NutriSafety
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-emerald-950/70 dark:text-emerald-50/75">
              A startup-grade scanner that explains food labels, flags hidden harms, checks global compliance, and turns a health profile into practical product warnings.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/scanner">
                Start scanning
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">View dashboard</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white/65 p-5 shadow-glass backdrop-blur-xl dark:bg-emerald-950/50">
          <div className="rounded-2xl bg-shield-mint p-5 dark:bg-emerald-900/50">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-900/60 dark:text-emerald-50/60">Live demo preview</p>
                <h2 className="text-2xl font-black text-shield-forest dark:text-emerald-50">Hazelnut Protein Bar</h2>
              </div>
              <ShieldCheck className="h-10 w-10 text-shield-forest dark:text-emerald-50" />
            </div>
            <div className="grid gap-3">
              {["Health score 78/100", "EFSA: monitor sweeteners", "Contains milk allergen", "Claim risk: low sugar with polyols"].map((item) => (
                <div key={item} className="rounded-2xl border border-emerald-200 bg-white/80 p-4 text-sm font-semibold text-shield-forest">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="mb-3 h-8 w-8 text-shield-forest dark:text-emerald-50" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>{feature.text}</CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="rounded-2xl bg-shield-forest p-8 text-white shadow-glass md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-black">Ready for a hackathon demo.</h2>
            <p className="mt-2 max-w-2xl text-emerald-50/75">Scan, search, explain, analyze, and visualize food safety in one Vercel-compatible Next.js app.</p>
          </div>
          <Button asChild className="mt-6 bg-white text-shield-forest hover:bg-shield-mint md:mt-0">
            <Link href="/scanner">Open scanner</Link>
          </Button>
        </div>
      </section>
      <footer className="border-t border-emerald-100 py-8 text-center text-sm text-emerald-950/60 dark:border-emerald-900 dark:text-emerald-50/60">
        NutriSafety · Responsible food intelligence for modern consumers.
      </footer>
    </main>
  );
}

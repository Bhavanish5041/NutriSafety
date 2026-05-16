"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IngredientExplanation } from "@/types";

export function IngredientModal({ ingredient }: { ingredient: string }) {
  const [open, setOpen] = useState(false);
  const [explanation, setExplanation] = useState<IngredientExplanation | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setOpen(true);
    if (explanation || loading) return;
    setLoading(true);
    const response = await fetch("/api/ingredients/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredient })
    });
    const data = await response.json();
    setExplanation(data.explanation);
    setLoading(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={load}>
        <Sparkles className="h-4 w-4" />
        {ingredient}
      </Button>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-shield-forest/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-emerald-100 bg-white p-6 shadow-glass dark:bg-emerald-950">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-black text-shield-forest dark:text-emerald-50">{ingredient}</Dialog.Title>
              {explanation && <Badge className="mt-2 border-emerald-200 bg-emerald-50 text-emerald-800">{explanation.classification}</Badge>}
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          {loading || !explanation ? (
            <div className="flex items-center gap-2 text-shield-forest">
              <Loader2 className="h-4 w-4 animate-spin" />
              Explaining ingredient...
            </div>
          ) : (
            <div className="space-y-4 text-sm text-emerald-950/75 dark:text-emerald-50/75">
              <p>{explanation.explanation}</p>
              <p>
                <span className="font-bold text-shield-forest dark:text-emerald-50">Purpose:</span> {explanation.purpose}
              </p>
              <p>
                <span className="font-bold text-shield-forest dark:text-emerald-50">Possible side effects:</span>{" "}
                {explanation.sideEffects}
              </p>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

"use client";

import { useEffect, useState } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  const [datasets, setDatasets] = useState<Record<string, unknown[]>>({});
  const [json, setJson] = useState("");

  useEffect(() => {
    fetch("/api/admin/regulations").then((response) => response.json()).then(setDatasets);
  }, []);

  async function upload() {
    try {
      const parsed = JSON.parse(json);
      const response = await fetch("/api/admin/regulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const data = await response.json();
      toast.success(`${data.records} regulation record(s) validated`);
    } catch {
      toast.error("Upload valid JSON");
    }
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Upload regulation JSON</CardTitle>
          <p className="text-sm text-emerald-900/60 dark:text-emerald-50/60">Demo endpoint validates payloads; persist files in data/ for production.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={json}
            onChange={(event) => setJson(event.target.value)}
            className="min-h-64 w-full rounded-2xl border border-emerald-200 bg-white/80 p-4 text-sm outline-none focus:ring-2 focus:ring-shield-pastel dark:bg-emerald-950/60"
            placeholder='[{"ingredient":"example","status":"Monitor","notes":"Allowed within limits"}]'
          />
          <Button onClick={upload}>
            <UploadCloud className="h-4 w-4" />
            Validate upload
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Static datasets</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {Object.entries(datasets).map(([name, records]) => (
            <div key={name} className="rounded-2xl border border-emerald-100 bg-shield-mint p-4 dark:bg-emerald-900/40">
              <h3 className="mb-3 text-lg font-black capitalize text-shield-forest dark:text-emerald-50">{name}</h3>
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap text-xs text-emerald-950/75 dark:text-emerald-50/75">
                {JSON.stringify(records, null, 2)}
              </pre>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

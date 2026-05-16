"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HealthCondition, HealthProfile } from "@/types";

const conditions: { id: HealthCondition; label: string }[] = [
  { id: "diabetes", label: "Diabetes" },
  { id: "hypertension", label: "Hypertension" },
  { id: "lactose_intolerance", label: "Lactose intolerance" },
  { id: "kidney_disease", label: "Kidney disease" },
  { id: "high_protein", label: "Gym / high protein" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten_intolerance", label: "Gluten intolerance" },
  { id: "low_sugar", label: "Low sugar diet" }
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<HealthProfile>({ conditions: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then((response) => response.json()).then((data) => setProfile(data.profile ?? { conditions: [] }));
  }, []);

  function toggle(id: HealthCondition) {
    setProfile((current) => ({
      ...current,
      conditions: current.conditions.includes(id)
        ? current.conditions.filter((item) => item !== id)
        : [...current.conditions, id]
    }));
  }

  async function save() {
    setSaving(true);
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    setSaving(false);
    if (response.ok) toast.success("Health profile saved");
    else toast.error("Please sign in before saving");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Health profile</CardTitle>
          <p className="text-sm text-emerald-900/60 dark:text-emerald-50/60">Used to personalize warnings during scan analysis.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {conditions.map((condition) => (
              <button
                key={condition.id}
                onClick={() => toggle(condition.id)}
                className={`rounded-2xl border p-4 text-left text-sm font-semibold transition ${
                  profile.conditions.includes(condition.id)
                    ? "border-shield-forest bg-shield-pastel text-shield-forest"
                    : "border-emerald-200 bg-white/70 text-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-50/70"
                }`}
              >
                {condition.label}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
            <div className="space-y-2">
              <Label>Age</Label>
              <Input type="number" value={profile.age ?? ""} onChange={(event) => setProfile({ ...profile, age: Number(event.target.value) || undefined })} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={profile.notes ?? ""} onChange={(event) => setProfile({ ...profile, notes: event.target.value })} placeholder="e.g. avoid caffeine, prefer high fiber" />
            </div>
          </div>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save profile"}</Button>
        </CardContent>
      </Card>
    </main>
  );
}

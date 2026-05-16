"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", { email, name, redirect: false });
    setLoading(false);
    if (!result?.error) router.push("/profile");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Email login</CardTitle>
          <p className="text-sm text-emerald-900/60 dark:text-emerald-50/60">Simple demo authentication powered by NextAuth credentials.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Aparna" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@example.com" />
            </div>
            <Button className="w-full" disabled={loading}>
              <Mail className="h-4 w-4" />
              {loading ? "Signing in..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

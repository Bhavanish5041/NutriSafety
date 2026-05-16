"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Activity, ShieldAlert, ShieldCheck, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Scan = { id: string; productName: string; healthScore: number; riskLevel: string; scannedAt: string };
type Stats = { total: number; safe: number; moderate: number; avoid: number; averageScore: number };

export default function DashboardPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, safe: 0, moderate: 0, avoid: 0, averageScore: 0 });

  useEffect(() => {
    fetch("/api/dashboard").then((response) => response.json()).then((data) => {
      setScans(data.scans ?? []);
      setStats(data.stats);
    });
  }, []);

  const trend = [...scans].reverse().map((scan, index) => ({ name: `Scan ${index + 1}`, score: scan.healthScore }));
  const pie = [
    { name: "Safe", value: stats.safe, color: "#8fbc9a" },
    { name: "Moderate", value: stats.moderate, color: "#facc15" },
    { name: "Avoid", value: stats.avoid, color: "#ef4444" }
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-4xl font-black text-shield-forest dark:text-emerald-50">Dashboard analytics</h1>
        <p className="mt-2 text-emerald-950/65 dark:text-emerald-50/65">Scan history, safety distribution, and score trends.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        <Metric title="Total scans" value={stats.total} icon={Activity} />
        <Metric title="Safe products" value={stats.safe} icon={ShieldCheck} />
        <Metric title="Avoid flags" value={stats.avoid} icon={ShieldAlert} />
        <Metric title="Average score" value={stats.averageScore} icon={TrendingUp} />
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Health score trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d9efe0" />
                <XAxis dataKey="name" stroke="#32634a" />
                <YAxis stroke="#32634a" />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#073f2c" fill="#c9f4d2" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Safe vs unsafe</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95}>
                  {pie.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader><CardTitle>Recent scans</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y divide-emerald-100 dark:divide-emerald-900">
            {scans.length ? scans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-semibold text-shield-forest dark:text-emerald-50">{scan.productName}</p>
                  <p className="text-xs text-emerald-900/50 dark:text-emerald-50/50">{new Date(scan.scannedAt).toLocaleString()}</p>
                </div>
                <p className="font-bold">{scan.healthScore}/100 · {scan.riskLevel}</p>
              </div>
            )) : <p>No scans yet. Scan a product to populate analytics.</p>}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function Metric({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) {
  return (
    <Card className="p-5">
      <Icon className="mb-4 h-6 w-6 text-shield-forest dark:text-emerald-50" />
      <p className="text-sm text-emerald-900/60 dark:text-emerald-50/60">{title}</p>
      <p className="text-3xl font-black text-shield-forest dark:text-emerald-50">{value}</p>
    </Card>
  );
}

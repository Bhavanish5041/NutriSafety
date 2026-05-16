"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Product } from "@/types";

export function NutritionChart({ product }: { product: Product }) {
  const data = [
    { name: "Sugar", value: product.nutrition.sugar ?? 0 },
    { name: "Protein", value: product.nutrition.protein ?? 0 },
    { name: "Fat", value: product.nutrition.fat ?? 0 },
    { name: "Fiber", value: product.nutrition.fiber ?? 0 }
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d9efe0" />
          <XAxis dataKey="name" stroke="#32634a" />
          <YAxis stroke="#32634a" />
          <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#c9f4d2" }} />
          <Bar dataKey="value" fill="#8fbc9a" radius={[12, 12, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

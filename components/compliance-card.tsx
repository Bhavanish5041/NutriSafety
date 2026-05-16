import { Globe2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ComplianceResult } from "@/types";

export function ComplianceCard({ result }: { result: ComplianceResult }) {
  const tone =
    result.status === "Restricted"
      ? "border-red-200 bg-red-50 text-red-700"
      : result.status === "Monitor"
        ? "border-yellow-200 bg-yellow-50 text-yellow-800"
        : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <Card className="p-5">
      <CardHeader className="mb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe2 className="h-4 w-4" />
          {result.region}
        </CardTitle>
        <Badge className={tone}>{result.status}</Badge>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {result.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

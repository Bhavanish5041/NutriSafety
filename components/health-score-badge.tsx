import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { riskClass } from "@/lib/utils";

export function HealthScoreBadge({ score, level }: { score: number; level: string }) {
  const Icon = level === "avoid" ? ShieldAlert : level === "moderate" ? ShieldQuestion : ShieldCheck;
  return (
    <Badge className={riskClass(level)}>
      <Icon className="mr-1 h-3.5 w-3.5" />
      {score}/100 · {level}
    </Badge>
  );
}

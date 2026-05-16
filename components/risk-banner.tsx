import { AlertTriangle } from "lucide-react";
import { riskClass } from "@/lib/utils";
import type { HiddenHarm } from "@/types";

export function RiskBanner({ harms }: { harms: HiddenHarm[] }) {
  if (!harms.length) return null;
  return (
    <div className="space-y-3">
      {harms.map((harm) => (
        <div key={harm.title} className={`rounded-2xl border p-4 ${riskClass(harm.severity)}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-bold">{harm.title}</p>
              <p className="text-sm opacity-85">{harm.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

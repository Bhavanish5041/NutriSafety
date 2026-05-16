"use client";

import { motion } from "framer-motion";
import { ScanLine } from "lucide-react";

export function ScanAnimation() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-emerald-200 bg-white/60 shadow-inner">
      <div className="absolute inset-5 rounded-2xl border-2 border-dashed border-shield-sage" />
      <motion.div
        className="absolute left-6 right-6 h-1 rounded-full bg-shield-forest shadow-[0_0_32px_rgba(7,63,44,0.45)]"
        animate={{ top: ["15%", "82%", "15%"] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-shield-forest/40">
        <ScanLine className="h-20 w-20" />
      </div>
    </div>
  );
}

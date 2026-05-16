"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScanAnimation } from "@/components/scan-animation";

export function CameraScanner({ onScan }: { onScan: (code: string) => void }) {
  const ref = useRef<Html5Qrcode | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (ref.current?.isScanning) void ref.current.stop();
  }, []);

  async function start() {
    setError("");
    const scanner = new Html5Qrcode("nutrishield-reader");
    ref.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 160 } },
        (decoded) => {
          onScan(decoded);
          stop();
        },
        undefined
      );
      setActive(true);
    } catch {
      setError("Camera unavailable. Use manual entry or allow camera permission.");
    }
  }

  async function stop() {
    if (ref.current?.isScanning) await ref.current.stop();
    setActive(false);
  }

  return (
    <div className="space-y-4">
      <div id="nutrishield-reader" className={active ? "overflow-hidden rounded-2xl" : "hidden"} />
      {!active && <ScanAnimation />}
      {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
      <Button onClick={active ? stop : start} variant={active ? "outline" : "default"} className="w-full">
        {active ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
        {active ? "Stop camera" : "Start camera scan"}
      </Button>
    </div>
  );
}

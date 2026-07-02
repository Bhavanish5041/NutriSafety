"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, CameraOff, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScanAnimation } from "@/components/scan-animation";

const CAMERA_READER_ID = "nutrisafety-barcode-reader";
const FILE_READER_ID = "nutrisafety-barcode-file";

/* Only linear barcode formats - no QR codes */
const FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.CODE_93,
  Html5QrcodeSupportedFormats.ITF,
];

export function CameraScanner({ onScan }: { onScan: (code: string) => void }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannedRef = useRef(false);
  const startingRef = useRef(false);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        void scannerRef.current.stop().finally(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        });
      }
    };
  }, []);

  function waitForPaint() {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  }

  async function start() {
    if (startingRef.current || scannerRef.current?.isScanning) return;

    setError("");
    scannedRef.current = false;
    startingRef.current = true;
    setActive(true);

    await waitForPaint();

    const container = document.getElementById(CAMERA_READER_ID);
    if (!container) {
      setError("Scanner container not found.");
      setActive(false);
      startingRef.current = false;
      return;
    }

    container.replaceChildren();

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera scanning needs a secure browser context. Try uploading a photo instead.");
      setActive(false);
      startingRef.current = false;
      return;
    }

    const scanner = new Html5Qrcode(CAMERA_READER_ID, {
      formatsToSupport: FORMATS,
      verbose: false,
    });
    scannerRef.current = scanner;

    try {
      const containerWidth = Math.max(container.getBoundingClientRect().width, 320);
      const qrboxWidth = Math.min(Math.max(containerWidth - 40, 240), 420);
      const qrboxHeight = Math.round(qrboxWidth * 0.42);

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 12,
          qrbox: { width: qrboxWidth, height: qrboxHeight },
          disableFlip: true,
        },
        (decoded) => {
          if (scannedRef.current) return;
          scannedRef.current = true;
          void stop();
          onScan(decoded);
        },
        undefined
      );
    } catch (err) {
      console.error("Scanner start error:", err);
      scanner.clear();
      scannerRef.current = null;
      setActive(false);
      setError(
        "Camera unavailable. Try uploading a photo of the barcode, or allow camera permission."
      );
    } finally {
      startingRef.current = false;
    }
  }

  async function stop() {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
    } catch {
      /* already stopped */
    }
    scannerRef.current?.clear();
    scannerRef.current = null;
    setActive(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    const fileContainer = document.getElementById(FILE_READER_ID);
    fileContainer?.replaceChildren();

    const scanner = new Html5Qrcode(FILE_READER_ID, {
      formatsToSupport: FORMATS,
      verbose: false,
    });

    try {
      const result = await scanner.scanFile(file, false);
      onScan(result);
    } catch {
      setError(
        "No barcode found in image. Make sure the barcode is clear and well-lit."
      );
    } finally {
      scanner.clear();
    }

    e.target.value = "";
  }

  return (
    <div className="space-y-4">
      {/* Scanner video container - must have a non-zero size when active */}
      <div
        id={CAMERA_READER_ID}
        style={{ minHeight: active ? 300 : 0 }}
        className={
          active
            ? "overflow-hidden rounded-2xl border border-emerald-200 bg-black"
            : "hidden"
        }
      />

      {/* Hidden element for file-based scanning */}
      <div id={FILE_READER_ID} className="hidden" />

      {!active && <ScanAnimation />}

      {error && (
        <p className="text-sm font-semibold text-red-700">{error}</p>
      )}

      <p className="text-xs text-emerald-900/50 dark:text-emerald-50/50">
        {active
          ? "Point the camera at a barcode. Keep it inside the highlighted box."
          : "Supports EAN-13, EAN-8, UPC-A, UPC-E, Code 128, and more."}
      </p>

      <div className="flex gap-3">
        <Button
          onClick={active ? stop : start}
          variant={active ? "outline" : "default"}
          className="flex-1"
        >
          {active ? (
            <CameraOff className="h-4 w-4" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
          {active ? "Stop camera" : "Scan barcode"}
        </Button>

        <Button
          variant="outline"
          className="flex-1"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          Upload photo
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}

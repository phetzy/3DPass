"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { FileDropzone } from "@/components/file-dropzone";
import { ModelViewer } from "@/components/model-viewer";
import { MATERIALS, MATERIAL_COLORS, type MaterialId, type PrintQuality } from "@/lib/materials";
import { loadGeometryFromFile } from "@/lib/model";
import { estimatePrice } from "@/lib/pricing";
import { computeGeometrySizeMM } from "@/lib/geometry";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

function formatUSD(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

export default function UploadPage() {
  const router = useRouter();
  const [fileName, setFileName] = useState<string>("");
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [material, setMaterial] = useState<MaterialId>("pla");
  const [quality, setQuality] = useState<PrintQuality>("standard");
  const [quantity, setQuantity] = useState<number>(1);
  const [scalePct, setScalePct] = useState<number>(100);
  const [sliderPct, setSliderPct] = useState<number>(100);
  const [readProgress, setReadProgress] = useState<number>(0);
  const [parsing, setParsing] = useState<boolean>(false);
  const colorOptions = useMemo(() => MATERIAL_COLORS[material], [material]);
  const [colorId, setColorId] = useState<string>(colorOptions?.[0]?.id ?? "black");
  const selectedColor = useMemo(
    () => colorOptions.find((c) => c.id === colorId) ?? colorOptions[0],
    [colorOptions, colorId],
  );

  const onFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    setReadProgress(0);
    setParsing(false);
    setFileName(file.name);
    try {
      const geom = await loadGeometryFromFile(file, {
        onReadProgress: (p) => setReadProgress(p || 0),
        onParsingStart: () => setParsing(true),
      });
      if (!geom) {
        setGeometry(null);
        setError("This file type isn't supported in the MVP (try .stl or .3mf)");
      } else {
        setGeometry(geom);
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load model");
      setGeometry(null);
    } finally {
      setLoading(false);
      setParsing(false);
    }
  }, []);

  // P1S build volume (mm)
  const BUILD = { x: 256, y: 256, z: 256 } as const;

  const sizeAndLimits = useMemo(() => {
    if (!geometry) return null;
    const baseSize = computeGeometrySizeMM(geometry);
    const maxScale = Math.max(
      0,
      Math.min(
        baseSize.x > 0 ? BUILD.x / baseSize.x : Infinity,
        baseSize.y > 0 ? BUILD.y / baseSize.y : Infinity,
        baseSize.z > 0 ? BUILD.z / baseSize.z : Infinity,
      ),
    );
    return { baseSize, maxScale };
  }, [geometry]);

  const scale = useMemo(() => Math.max(0.01, (scalePct || 0) / 100), [scalePct]);
  const clampedScale = useMemo(() => {
    if (!sizeAndLimits) return scale;
    return Math.min(scale, sizeAndLimits.maxScale || 1);
  }, [scale, sizeAndLimits]);

  const estimate = useMemo(() => {
    if (!geometry) return null;
    return estimatePrice(
      geometry,
      material,
      quality,
      clampedScale,
      Math.max(1, Math.floor(Number.isFinite(quantity) ? quantity : 1)),
    );
  }, [geometry, material, quality, clampedScale, quantity]);

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-4 md:grid-cols-2">
      <section className="space-y-3">
        <Card className="p-4">
          <h1 className="mb-2 text-xl font-semibold">Upload your 3D model</h1>
          <FileDropzone onFiles={onFiles} className="h-40" />
          <div className="mt-3 text-sm text-muted-foreground">
            Accepted: .stl, .3mf (STEP coming soon)
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="mb-2 text-lg font-semibold">Preview</h2>
          {loading ? (
            <div className="space-y-2">
              <Progress value={Math.round((readProgress || 0) * 100)} />
              <p className="text-xs text-muted-foreground">
                {parsing
                  ? "Parsing model..."
                  : `Reading file ${Math.round((readProgress || 0) * 100)}%`}
              </p>
            </div>
          ) : geometry ? (
            <ModelViewer geometry={geometry} scale={clampedScale} color={selectedColor?.hex} />
          ) : (
            <div className="flex h-[360px] items-center justify-center text-sm text-muted-foreground">
              No model loaded yet
            </div>
          )}
          {fileName ? (
            <div className="mt-2 text-xs text-muted-foreground">{fileName}</div>
          ) : null}
          {error ? (
            <p className="mt-2 text-sm text-destructive" aria-live="polite">{error}</p>
          ) : null}
        </Card>
      </section>

      <section className="space-y-3">
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Print settings</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Material</Label>
              <Select value={material} onValueChange={(v) => { setMaterial(v as MaterialId); setColorId(MATERIAL_COLORS[v as MaterialId]?.[0]?.id ?? "black"); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MATERIALS).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quality</Label>
              <Select value={quality} onValueChange={(v) => setQuality(v as PrintQuality)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="fine">Fine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <Select value={colorId} onValueChange={(v) => setColorId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="inline-flex items-center gap-2">
                      <span style={{ backgroundColor: c.hex }} className="inline-block size-4 rounded-full border" />
                      {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => {
                  const n = (e.target as HTMLInputElement).valueAsNumber;
                  setQuantity(Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>Scale (%)</Label>
              <Slider
                value={[Math.round(sliderPct)]}
                min={1}
                max={sizeAndLimits ? Math.floor((sizeAndLimits.maxScale || 1) * 100) : 300}
                step={1}
                onValueChange={([v]) => {
                  setSliderPct(v);
                  setScalePct(v); // immediate visual update
                }}
                className="py-3"
              />
              <Input
                type="number"
                min={1}
                step={1}
                value={Math.round(scalePct)}
                onChange={(e) => {
                  const n = (e.target as HTMLInputElement).valueAsNumber;
                  setScalePct(Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 100);
                }}
                onBlur={() => {
                  if (!sizeAndLimits) return;
                  const maxPct = Math.floor((sizeAndLimits.maxScale || 1) * 100);
                  if (scalePct > maxPct) setScalePct(maxPct);
                  setSliderPct(scalePct);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Max scale allowed</Label>
              <Input readOnly value={sizeAndLimits ? Math.floor((sizeAndLimits.maxScale || 1) * 100) : 100} />
            </div>
          </div>

          {geometry && sizeAndLimits ? (
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div>Size (mm)</div>
              <div className="col-span-2">
                {(() => {
                  const s = sizeAndLimits.baseSize.clone().multiplyScalar(clampedScale);
                  return `${s.x.toFixed(1)} × ${s.y.toFixed(1)} × ${s.z.toFixed(1)}`;
                })()}
              </div>
              {scale > clampedScale ? (
                <div className="col-span-3 text-[11px] text-amber-500">
                  Scale limited to printer volume. Using {Math.round(clampedScale * 100)}%.
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>

        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Estimate</h2>
          {estimate ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-muted-foreground">Volume (each)</div>
              <div>{Math.round(estimate.volume_mm3_each).toLocaleString()} mm³</div>
              <div className="text-muted-foreground">Weight (each)</div>
              <div>{estimate.grams_each.toLocaleString()} g</div>
              <div className="text-muted-foreground">Price (each)</div>
              <div>{formatUSD(estimate.price_usd_each)}</div>
              <div className="text-muted-foreground">Quantity</div>
              <div>{quantity}</div>
              <div className="text-muted-foreground">Total</div>
              <div className="font-semibold">{formatUSD(estimate.total_price_usd)}</div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Upload a model to see the estimate.</p>
          )}

          <div className="flex gap-2">
            <Button
              disabled={!geometry || loading || !estimate}
              onClick={() => {
                if (!estimate) return;
                const params = new URLSearchParams({
                  file: fileName,
                  material,
                  quality,
                  grams_each: String(estimate.grams_each),
                  price_each: String(estimate.price_usd_each),
                  total: String(estimate.total_price_usd),
                  qty: String(quantity),
                  scale: String(clampedScale),
                  color: selectedColor?.id || "",
                  colorHex: selectedColor?.hex || "",
                });
                router.push(`/checkout?${params.toString()}`);
              }}
            >
              Continue
            </Button>
            <Button variant="outline" disabled={loading} onClick={() => { setGeometry(null); setFileName(""); }}>Reset</Button>
          </div>
        </Card>
      </section>
    </main>
  );
}

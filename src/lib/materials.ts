export type MaterialId =
  | "pla"
  | "abs"
  | "tpu"
  | "pa6-cf"
  | "asa"
  | "nylon";

export type PrintQuality = "draft" | "standard" | "fine";

export const MATERIALS: Record<MaterialId, {
  id: MaterialId;
  label: string;
  density_g_cm3: number;
  rate_usd_per_gram: number;
}> = {
  pla: { id: "pla", label: "PLA", density_g_cm3: 1.24, rate_usd_per_gram: 0.06 },
  abs: { id: "abs", label: "ABS", density_g_cm3: 1.04, rate_usd_per_gram: 0.07 },
  tpu: { id: "tpu", label: "TPU", density_g_cm3: 1.21, rate_usd_per_gram: 0.08 },
  "pa6-cf": { id: "pa6-cf", label: "PA6-CF", density_g_cm3: 1.12, rate_usd_per_gram: 0.12 },
  asa: { id: "asa", label: "ASA", density_g_cm3: 1.07, rate_usd_per_gram: 0.09 },
  nylon: { id: "nylon", label: "Nylon", density_g_cm3: 1.01, rate_usd_per_gram: 0.11 },
};

export const QUALITY_MULTIPLIER: Record<PrintQuality, number> = {
  draft: 0.95,
  standard: 1.0,
  fine: 1.2,
};

// Very rough effective solid fill factor (accounts for infill + perimeters)
export const QUALITY_FILL_FACTOR: Record<PrintQuality, number> = {
  draft: 0.25,
  standard: 0.4,
  fine: 0.6,
};

export const PRICING_CONSTANTS = {
  base_fee_usd: 3,
  minimum_price_usd: 5,
  handling_multiplier: 1.1, // accounts for waste, supports, brim, etc.
};

export type ColorOption = { id: string; label: string; hex: string };

export const MATERIAL_COLORS: Record<MaterialId, ColorOption[]> = {
  pla: [
    { id: "black", label: "Black", hex: "#111111" },
    { id: "white", label: "White", hex: "#f5f5f5" },
    { id: "gray", label: "Gray", hex: "#9ca3af" },
    { id: "red", label: "Red", hex: "#ef4444" },
    { id: "blue", label: "Blue", hex: "#3b82f6" },
    { id: "green", label: "Green", hex: "#22c55e" },
    { id: "yellow", label: "Yellow", hex: "#f59e0b" },
    { id: "orange", label: "Orange", hex: "#fb923c" },
    { id: "purple", label: "Purple", hex: "#8b5cf6" },
  ],
  abs: [
    { id: "black", label: "Black", hex: "#111111" },
    { id: "white", label: "White", hex: "#f5f5f5" },
    { id: "gray", label: "Gray", hex: "#9ca3af" },
    { id: "red", label: "Red", hex: "#ef4444" },
    { id: "blue", label: "Blue", hex: "#3b82f6" },
    { id: "green", label: "Green", hex: "#22c55e" },
  ],
  tpu: [
    { id: "black", label: "Black", hex: "#111111" },
    { id: "white", label: "White", hex: "#f5f5f5" },
    { id: "clear", label: "Clear", hex: "#e5e7eb" },
    { id: "red", label: "Red", hex: "#ef4444" },
    { id: "blue", label: "Blue", hex: "#3b82f6" },
  ],
  "pa6-cf": [
    { id: "black", label: "Black", hex: "#111111" },
  ],
  asa: [
    { id: "black", label: "Black", hex: "#111111" },
    { id: "white", label: "White", hex: "#f5f5f5" },
    { id: "gray", label: "Gray", hex: "#9ca3af" },
  ],
  nylon: [
    { id: "natural", label: "Natural", hex: "#dddcdc" },
    { id: "black", label: "Black", hex: "#111111" },
  ],
};

import * as THREE from "three";
import { computeGeometryVolumeMM3 } from "./geometry";
import { MATERIALS, QUALITY_FILL_FACTOR, QUALITY_MULTIPLIER, PRICING_CONSTANTS, type MaterialId, type PrintQuality } from "./materials";

export type PriceEstimate = {
  volume_mm3_each: number;
  grams_each: number;
  price_usd_each: number;
  total_price_usd: number;
};

export function estimatePrice(
  geometry: THREE.BufferGeometry,
  material: MaterialId,
  quality: PrintQuality,
  scale: number = 1,
  quantity: number = 1,
): PriceEstimate {
  const base_volume_mm3 = computeGeometryVolumeMM3(geometry);
  const volume_mm3_each = base_volume_mm3 * Math.max(0, scale) ** 3;
  const volume_cm3_each = volume_mm3_each / 1000; // 1 cm^3 = 1000 mm^3

  const mat = MATERIALS[material];
  const fill = QUALITY_FILL_FACTOR[quality];
  const grams_raw_each =
    volume_cm3_each * mat.density_g_cm3 * fill * PRICING_CONSTANTS.handling_multiplier;

  const grams_each = Math.max(0, grams_raw_each);
  const price_by_weight_each = grams_each * mat.rate_usd_per_gram * QUALITY_MULTIPLIER[quality];
  const per_item_subtotal = Math.max(
    PRICING_CONSTANTS.minimum_price_usd,
    Number((price_by_weight_each).toFixed(2)),
  );
  // Apply base fee once per order, not per item (assumption for MVP)
  const total_price_usd = Number(
    (PRICING_CONSTANTS.base_fee_usd + per_item_subtotal * Math.max(1, quantity)).toFixed(2),
  );

  return {
    volume_mm3_each,
    grams_each: Number(grams_each.toFixed(1)),
    price_usd_each: per_item_subtotal,
    total_price_usd,
  };
}

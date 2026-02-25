export function calculateFinalPrice({
  basePrice,
  hasCustomPrice,
  customPrice,
  coupon,
}: {
  basePrice: number;
  hasCustomPrice?: boolean;
  customPrice?: number;
  coupon?: {
    discountType: "percent" | "fixed";
    value: number;
  } | null;
}) {
  let price = hasCustomPrice && customPrice
    ? customPrice
    : basePrice;

  if (coupon) {
    if (coupon.discountType === "percent") {
      price = price - (price * coupon.value) / 100;
    } else if (coupon.discountType === "fixed") {
      price = price - coupon.value;
    }
  }

  if (price < 0) price = 0;

  return Math.round(price);
}

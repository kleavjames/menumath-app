export const toNumber = (value: string | number) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Round to two decimal places (currency and percentages). */
export const roundTo2 = (value: number) => Math.round(value * 100) / 100;

/** Keeps exactly two decimals and groups thousands, e.g. 1960 -> "1,960.00". */
export const formatPrice = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** Rounds to at most `decimals` places, drops trailing zeros, and groups thousands. */
export const formatAmount = (value: number, decimals = 4) => {
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  return rounded.toLocaleString("en-US", {
    maximumFractionDigits: decimals,
  });
};

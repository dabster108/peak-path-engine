const nprFormatter = new Intl.NumberFormat("en-NP", {
  maximumFractionDigits: 0,
});

export function formatNpr(amount) {
  return `NPR ${nprFormatter.format(amount)}`;
}

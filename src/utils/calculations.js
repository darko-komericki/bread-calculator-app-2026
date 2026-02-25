export function calculateWeight(flour, percentage) {
  return Math.round((flour * percentage) / 100);
}

export function calculateTotalDough(flour, ingredients) {
  const ingredientWeight = ingredients.reduce(
    (sum, ing) => sum + calculateWeight(flour, ing.percentage),
    0
  );
  return flour + ingredientWeight;
}

export function calculateActualHydration(flour, ingredients) {
  if (!flour) return 0;
  const waterWeight = ingredients.reduce((sum, ing) => {
    const wc = ing.waterContent ?? 0;
    return sum + calculateWeight(flour, ing.percentage) * wc;
  }, 0);
  return Math.round((waterWeight / flour) * 1000) / 10;
}

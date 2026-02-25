export function getSuggestedHydrationRange(proteinPer100g) {
  if (proteinPer100g < 9) return { min: 55, max: 62 };
  if (proteinPer100g < 10.5) return { min: 60, max: 67 };
  if (proteinPer100g < 12) return { min: 65, max: 72 };
  if (proteinPer100g < 13.5) return { min: 70, max: 78 };
  return { min: 75, max: 85 };
}

export function isHydrationInRange(actual, min, max) {
  return actual >= min && actual <= max;
}

export function getHydrationStatus(actual, proteinPer100g) {
  const { min, max } = getSuggestedHydrationRange(proteinPer100g);
  if (actual >= min && actual <= max) return 'optimal';
  const distance = actual < min ? min - actual : actual - max;
  return distance <= 5 ? 'low' : 'high';
}

export function getFlourCategory(proteinPer100g) {
  if (proteinPer100g < 9) return 'Pastry flour';
  if (proteinPer100g < 10.5) return 'All-purpose flour';
  if (proteinPer100g < 12) return 'Strong AP flour';
  if (proteinPer100g < 13.5) return 'Bread flour';
  return 'High-gluten flour';
}

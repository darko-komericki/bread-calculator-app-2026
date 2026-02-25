const STORAGE_KEY = 'breadRecipes';
const THEME_KEY = 'breadTheme';
const DRAFT_KEY = 'breadDraft';
const MAX_RECIPES = 50;

export function getRecipes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRecipe(recipe) {
  const recipes = getRecipes();
  if (!recipe.id) {
    if (recipes.length >= MAX_RECIPES) {
      throw new Error(`Maximum ${MAX_RECIPES} recipes reached. Delete some to save new ones.`);
    }
    recipe.id = Date.now();
    recipe.createdAt = new Date().toISOString();
  }
  recipe.updatedAt = new Date().toISOString();

  const index = recipes.findIndex((r) => r.id === recipe.id);
  if (index >= 0) {
    recipes[index] = { ...recipes[index], ...recipe };
  } else {
    recipes.unshift(recipe);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  return recipe;
}

export function deleteRecipe(id) {
  const recipes = getRecipes().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export function loadRecipe(id) {
  return getRecipes().find((r) => r.id === id) || null;
}

export function updateRecipe(id, updates) {
  const recipes = getRecipes();
  const index = recipes.findIndex((r) => r.id === id);
  if (index < 0) return null;
  recipes[index] = { ...recipes[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  return recipes[index];
}

export function exportRecipes() {
  return JSON.stringify(getRecipes(), null, 2);
}

export function importRecipes(jsonString) {
  const imported = JSON.parse(jsonString);
  if (!Array.isArray(imported)) throw new Error('Invalid format: expected an array of recipes.');

  const existing = getRecipes();
  const existingIds = new Set(existing.map((r) => r.id));
  const newRecipes = imported.filter((r) => !existingIds.has(r.id));

  if (existing.length + newRecipes.length > MAX_RECIPES) {
    throw new Error(`Import would exceed ${MAX_RECIPES} recipe limit.`);
  }

  const merged = [...newRecipes, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return newRecipes.length;
}

export function getStorageStats() {
  const recipes = getRecipes();
  return { count: recipes.length, max: MAX_RECIPES, percentUsed: Math.round((recipes.length / MAX_RECIPES) * 100) };
}

export function getTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || null;
  } catch {
    return null;
  }
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function saveDraft(data) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

export function loadDraft() {
  try {
    const data = localStorage.getItem(DRAFT_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

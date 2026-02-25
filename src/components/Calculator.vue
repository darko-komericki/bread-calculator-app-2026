<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="sticky top-0 z-20 bg-[var(--color-bg)]/95 backdrop-blur-sm">
      <div class="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1><img src="/logo.svg" alt="MaBaker" class="w-full h-auto" /></h1>
        <button
          @click="showRecipes = !showRecipes"
          class="relative p-2 rounded-[12px] border-2 border-[var(--color-text)] hover:bg-[var(--color-bg-alt)] transition-colors"
          :aria-label="showRecipes ? 'Hide recipes' : 'Show recipes'"
        >
          <i class="ri-archive-line text-xl leading-none"></i>
          <span
            v-if="recipeCount > 0"
            class="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >{{ recipeCount }}</span>
        </button>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <!-- Current recipe indicator -->
      <div v-if="currentRecipeId" class="flex items-center justify-between border-2 border-[var(--color-text)] rounded-[12px] px-3 py-2 text-sm">
        <span class="text-[var(--color-text-secondary)]">
          Editing: <strong class="text-[var(--color-text)]">{{ currentRecipeName }}</strong>
        </span>
        <button @click="clearForm" class="text-[var(--color-text-muted)] hover:text-black text-xs underline">
          New recipe
        </button>
      </div>

      <!-- Ingredient Cards -->
      <section class="space-y-3">
        <h2 class="sr-only">Ingredients</h2>

        <!-- Flour Card -->
        <div class="ingredient-card">
          <div class="flex items-start justify-between mb-1">
            <h3 class="text-base font-normal">Flour</h3>
            <span class="pill pill-base">BASE — 100%</span>
          </div>
          <div class="flex items-baseline justify-between mb-4">
            <span class="text-2xl font-semibold tabular-nums">{{ flour || 0 }}g</span>
            <span class="text-base">Protein {{ proteinPer100g }}g / 100g</span>
          </div>
          <div class="flex items-center justify-between">
            <button
              @click="openEditModal('flour')"
              class="icon-btn"
              aria-label="Edit flour"
            >
              <i class="ri-pencil-line"></i>
            </button>
            <div class="flex items-center gap-2">
              <button @click="decrementFlour" class="icon-btn" aria-label="Decrease flour">
                <i class="ri-subtract-line"></i>
              </button>
              <button @click="incrementFlour" class="icon-btn" aria-label="Increase flour">
                <i class="ri-add-line"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Hydration suggestion -->
        <div v-if="hasWater" class="w-full py-3 px-4 rounded-[16px] border-2 border-black text-black text-sm font-medium text-center uppercase tracking-wide">
          {{ hydrationLabel }}
        </div>

        <!-- Ingredient Cards -->
        <div
          v-for="(ing, index) in ingredients"
          :key="ing.name"
          class="ingredient-card"
        >
          <div class="flex items-start justify-between mb-1">
            <h3 class="text-base font-normal">{{ ing.name }}</h3>
            <span class="pill">{{ ing.percentage || 0 }}%</span>
          </div>
          <div class="flex items-baseline justify-between mb-4">
            <span class="text-2xl font-semibold tabular-nums">{{ calcWeight(ing.percentage) }}g</span>
            <span v-if="ing.waterContent > 0" class="text-base">{{ Math.round(ing.waterContent * 100) }}% water</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button
                @click="removeIngredient(index)"
                class="icon-btn"
                :aria-label="'Delete ' + ing.name"
              >
                <i class="ri-delete-bin-line"></i>
              </button>
              <button
                @click="openEditModal(index)"
                class="icon-btn"
                :aria-label="'Edit ' + ing.name"
              >
                <i class="ri-pencil-line"></i>
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button @click="decrementIngredient(index)" class="icon-btn" :aria-label="'Decrease ' + ing.name">
                <i class="ri-subtract-line"></i>
              </button>
              <button @click="incrementIngredient(index)" class="icon-btn" :aria-label="'Increase ' + ing.name">
                <i class="ri-add-line"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Add ingredient -->
        <button
          @click="showAddMenu = true"
          class="w-full py-3 px-4 rounded-[16px] border-2 border-dashed border-black text-black text-sm font-medium flex items-center justify-center gap-1.5"
        >
          <i class="ri-add-line text-2xl"></i>
          ADD INGREDIENT
        </button>

        <!-- Ingredient modal -->
        <div v-if="showAddMenu" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" @click.self="showAddMenu = false">
          <div class="bg-white border-2 border-[var(--color-text)] rounded-[16px] w-full max-w-md p-5 space-y-4">
            <h3 class="text-lg font-semibold">Ingredients</h3>
            <div ref="ingredientListRef" class="space-y-1 max-h-[60vh] overflow-y-auto -mx-2 px-2">
              <div
                v-for="item in starterPack"
                :key="item"
                class="flex items-center justify-between px-3 py-2.5 rounded-md"
              >
                <span class="text-sm font-medium" :class="isAdded(item) ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'">{{ item }}</span>
                <button
                  v-if="isAdded(item)"
                  @click="removeIngredientByName(item)"
                  class="icon-btn"
                  :aria-label="'Remove ' + item"
                >
                  <i class="ri-delete-bin-line"></i>
                </button>
                <button
                  v-else
                  @click="addIngredient(item)"
                  class="icon-btn"
                  :aria-label="'Add ' + item"
                >
                  <i class="ri-add-line"></i>
                </button>
              </div>
            </div>
            <button @click="showAddMenu = false" class="btn-tertiary w-full">Close</button>
          </div>
        </div>
      </section>

      <!-- Edit Modal -->
      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" @click.self="showEditModal = false">
        <div class="bg-white border-2 border-[var(--color-text)] rounded-[16px] w-full max-w-md p-5 space-y-4">
          <h3 class="text-lg font-semibold">
            Edit {{ editTarget === 'flour' ? 'Flour' : editName }}
          </h3>
          <!-- Name (not for flour) -->
          <div v-if="editTarget !== 'flour'">
            <label class="block text-sm font-medium mb-1">Name</label>
            <input v-model="editName" type="text" class="input-field" />
          </div>
          <!-- Amount -->
          <div>
            <label class="block text-sm font-medium mb-1">
              {{ editTarget === 'flour' ? 'Amount (g)' : 'Percentage (%)' }}
            </label>
            <input v-model.number="editAmount" type="number" inputmode="decimal" min="0" class="input-field" />
          </div>
          <!-- Increment -->
          <div>
            <label class="block text-sm font-medium mb-1">
              +/- step {{ editTarget === 'flour' ? '(g)' : '(%)' }}
            </label>
            <input v-model.number="editIncrement" type="number" inputmode="decimal" min="0.1" step="0.1" class="input-field" />
          </div>
          <!-- Protein (flour only) -->
          <div v-if="editTarget === 'flour'">
            <label class="block text-sm font-medium mb-1">Protein per 100g</label>
            <input v-model.number="editProtein" type="number" inputmode="decimal" min="8" max="15" step="0.1" class="input-field" />
          </div>
          <!-- Water content (ingredients only) -->
          <div v-if="editTarget !== 'flour'">
            <label class="block text-sm font-medium mb-1">Water content (%)</label>
            <input v-model.number="editWaterContent" type="number" inputmode="decimal" min="0" max="100" step="1" class="input-field" />
          </div>
          <div class="flex gap-2">
            <button @click="saveEditModal" class="btn-primary flex-1">Save</button>
            <button @click="showEditModal = false" class="btn-tertiary flex-1">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <section class="border-2 border-[var(--color-text)] rounded-[16px] p-5">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-medium text-[var(--color-text-muted)]">Summary</h2>
          <button @click="printSummary" class="icon-btn !w-8 !h-8 !text-base" aria-label="Print summary">
            <i class="ri-printer-line"></i>
          </button>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="border-2 border-[var(--color-text)] rounded-[12px] p-3">
            <p class="text-xs font-medium">Total dough</p>
            <p class="text-xl font-bold tabular-nums">{{ totalDough }}g</p>
          </div>
          <div class="border-2 border-[var(--color-text)] rounded-[12px] p-3">
            <p class="text-xs font-medium">Hydration</p>
            <p class="text-xl font-bold tabular-nums">{{ actualHydration }}%</p>
          </div>
        </div>
        <div class="mt-4 space-y-1.5">
          <div class="flex justify-between text-sm">
            <span class="text-[var(--color-text-secondary)]">Flour</span>
            <span class="font-medium tabular-nums">{{ flour || 0 }}g<span class="text-[var(--color-text-muted)] ml-2 text-xs">100%</span></span>
          </div>
          <div v-for="ing in ingredients" :key="'s-' + ing.name" class="flex justify-between text-sm">
            <span class="text-[var(--color-text-secondary)]">{{ ing.name }}</span>
            <span class="font-medium tabular-nums">{{ calcWeight(ing.percentage) }}g<span class="text-[var(--color-text-muted)] ml-2 text-xs">{{ ing.percentage || 0 }}%</span></span>
          </div>
        </div>
      </section>

      <!-- Actions -->
      <section class="flex flex-wrap gap-2">
        <button @click="openSaveDialog" class="btn-primary flex-1 min-w-[120px]">
          {{ currentRecipeId ? 'Update recipe' : 'Save recipe' }}
        </button>
        <button @click="copyURL" class="btn-secondary flex-1 min-w-[120px]">
          {{ copied ? 'Copied!' : 'Share link' }}
        </button>
        <button @click="clearForm" class="btn-tertiary">Clear</button>
      </section>

      <!-- Save Dialog -->
      <div v-if="showSaveDialog" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" @click.self="showSaveDialog = false">
        <div class="bg-white border-2 border-[var(--color-text)] rounded-[16px] w-full max-w-md p-5 space-y-4">
          <h3 class="text-lg font-semibold">
            {{ currentRecipeId ? 'Update recipe' : 'Save recipe' }}
          </h3>
          <div>
            <label class="block text-sm font-medium mb-1">Recipe name</label>
            <input
              v-model="recipeName"
              type="text"
              maxlength="100"
              placeholder="My Sourdough"
              class="input-field"
              ref="nameInput"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Notes <span class="font-normal text-[var(--color-text-muted)]">(optional)</span></label>
            <textarea
              v-model="recipeNotes"
              maxlength="500"
              rows="3"
              placeholder="Fermentation time, tips, etc."
              class="input-field resize-none"
            ></textarea>
          </div>
          <div class="flex gap-2">
            <button @click="handleSave" class="btn-primary flex-1" :disabled="!recipeName.trim()">Save</button>
            <button @click="showSaveDialog = false" class="btn-tertiary flex-1">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Recipe Panel -->
      <div v-if="showRecipes" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" @click.self="showRecipes = false">
        <div class="bg-white border-2 border-[var(--color-text)] rounded-[16px] w-full max-w-md max-h-[80vh] overflow-y-auto">
          <RecipeManager
            @load="handleLoadRecipe"
            @close="showRecipes = false"
            :refreshKey="recipeRefreshKey"
          />
        </div>
      </div>

      <!-- Import/Export -->
      <section class="flex gap-2 text-sm">
        <button @click="handleExport" class="text-[var(--color-text-secondary)] hover:text-black underline">
          Export recipes
        </button>
        <span class="text-[var(--color-border)]">&middot;</span>
        <label class="text-[var(--color-text-secondary)] hover:text-black underline cursor-pointer">
          Import recipes
          <input type="file" accept=".json" class="hidden" @change="handleImport" />
        </label>
      </section>

      <!-- Toast -->
      <Transition name="toast">
        <div
          v-if="toast.show"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-md text-sm font-medium shadow-lg"
          :class="toast.type === 'error' ? 'bg-black text-white' : 'bg-black text-white'"
        >
          {{ toast.message }}
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { calculateWeight, calculateTotalDough, calculateActualHydration } from '../utils/calculations.js';
import { getSuggestedHydrationRange, getHydrationStatus } from '../utils/hydrationSuggestions.js';
import * as storage from '../utils/storage.js';
import RecipeManager from './RecipeManager.vue';

const STARTER_PACK = [
  'Water', 'Milk', 'Salt', 'Yeast', 'Baking Powder', 'Leaven',
  'Poolish', 'Oil', 'Sugar', 'Butter', 'Eggs', 'Honey',
];

const DEFAULT_PERCENTAGES = {
  Water: 65, Salt: 2, Yeast: 2, 'Baking Powder': 1.5, Leaven: 20,
  Poolish: 30, Milk: 60, Oil: 3, Sugar: 5, Butter: 5,
  Eggs: 10, Honey: 5,
};

const DEFAULT_INCREMENTS = {
  Water: 5, Salt: 0.5, Yeast: 0.5, 'Baking Powder': 0.5, Leaven: 5,
  Poolish: 5, Milk: 5, Oil: 1, Sugar: 1, Butter: 1,
  Eggs: 1, Honey: 1,
};

const DEFAULT_WATER_CONTENT = {
  Water: 1, Milk: 0.87, Leaven: 0.5, Poolish: 0.5,
  Eggs: 0.75, Butter: 0.15, Honey: 0.17,
};

const flour = ref(1000);
const flourIncrement = ref(50);
const proteinPer100g = ref(12.5);
const ingredients = reactive([
  { name: 'Water', percentage: 65, increment: 5, waterContent: 1 },
  { name: 'Salt', percentage: 2, increment: 0.5, waterContent: 0 },
  { name: 'Leaven', percentage: 20, increment: 5, waterContent: 0.5 },
]);

const currentRecipeId = ref(null);
const currentRecipeName = ref('');
const showRecipes = ref(false);
const showSaveDialog = ref(false);
const showAddMenu = ref(false);
const recipeName = ref('');
const recipeNotes = ref('');
const copied = ref(false);
const recipeRefreshKey = ref(0);
const nameInput = ref(null);
const ingredientListRef = ref(null);

watch(showAddMenu, (open) => {
  if (open) {
    nextTick(() => {
      if (ingredientListRef.value) disableBodyScroll(ingredientListRef.value);
    });
  } else {
    if (ingredientListRef.value) enableBodyScroll(ingredientListRef.value);
  }
});

// Edit modal
const showEditModal = ref(false);
const editTarget = ref(null); // 'flour' or ingredient index
const editName = ref('');
const editAmount = ref(0);
const editIncrement = ref(0);
const editProtein = ref(0);
const editWaterContent = ref(0);

function openEditModal(target) {
  if (target === 'flour') {
    editTarget.value = 'flour';
    editName.value = 'Flour';
    editAmount.value = flour.value;
    editIncrement.value = flourIncrement.value;
    editProtein.value = proteinPer100g.value;
    editWaterContent.value = 0;
  } else {
    editTarget.value = target;
    const ing = ingredients[target];
    editName.value = ing.name;
    editAmount.value = ing.percentage;
    editIncrement.value = ing.increment;
    editWaterContent.value = Math.round((ing.waterContent ?? 0) * 100);
    editProtein.value = 0;
  }
  showEditModal.value = true;
}

function saveEditModal() {
  if (editTarget.value === 'flour') {
    flour.value = editAmount.value;
    flourIncrement.value = editIncrement.value;
    proteinPer100g.value = editProtein.value;
  } else {
    const ing = ingredients[editTarget.value];
    ing.name = editName.value;
    ing.percentage = editAmount.value;
    ing.increment = editIncrement.value;
    ing.waterContent = (editWaterContent.value || 0) / 100;
  }
  showEditModal.value = false;
}

// +/- controls
function incrementFlour() {
  flour.value = (flour.value || 0) + flourIncrement.value;
}

function decrementFlour() {
  flour.value = Math.max(0, (flour.value || 0) - flourIncrement.value);
}

function incrementIngredient(index) {
  const ing = ingredients[index];
  ing.percentage = Math.round(((ing.percentage || 0) + ing.increment) * 100) / 100;
}

function decrementIngredient(index) {
  const ing = ingredients[index];
  ing.percentage = Math.max(0, Math.round(((ing.percentage || 0) - ing.increment) * 100) / 100);
}

const toast = ref({ show: false, message: '', type: 'success' });

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 2500);
}

const starterPack = STARTER_PACK;

function isAdded(name) {
  return ingredients.some((i) => i.name === name);
}

function addIngredient(name) {
  if (!isAdded(name)) {
    ingredients.push({ name, percentage: DEFAULT_PERCENTAGES[name] || 10, increment: DEFAULT_INCREMENTS[name] || 1, waterContent: DEFAULT_WATER_CONTENT[name] ?? 0 });
  }
}

function removeIngredientByName(name) {
  const idx = ingredients.findIndex((i) => i.name === name);
  if (idx >= 0) ingredients.splice(idx, 1);
}

function removeIngredient(index) {
  ingredients.splice(index, 1);
}

// Calculations
function calcWeight(percentage) {
  return calculateWeight(flour.value || 0, percentage || 0);
}

const totalDough = computed(() => calculateTotalDough(flour.value || 0, ingredients));
const actualHydration = computed(() => calculateActualHydration(flour.value || 0, ingredients));
const hasWater = computed(() => ingredients.some((i) => (i.waterContent ?? 0) > 0));

// Hydration suggestions
const suggestedRange = computed(() => getSuggestedHydrationRange(proteinPer100g.value || 12.5));
const hydrationStatus = computed(() => getHydrationStatus(actualHydration.value, proteinPer100g.value || 12.5));
const recipeCount = computed(() => storage.getRecipes().length);

const hydrationLabel = computed(() => {
  const range = suggestedRange.value;
  if (hydrationStatus.value === 'optimal') return `${actualHydration.value}% — in ${range.min}–${range.max}% range`;
  return `${actualHydration.value}% — suggested ${range.min}–${range.max}%`;
});



// Draft auto-save
function getDraftData() {
  return { flour: flour.value, proteinPer100g: proteinPer100g.value, ingredients: [...ingredients] };
}

watch([flour, proteinPer100g, ingredients], () => {
  storage.saveDraft(getDraftData());
}, { deep: true });

// Save
function openSaveDialog() {
  if (currentRecipeId.value) {
    recipeName.value = currentRecipeName.value;
    const existing = storage.loadRecipe(currentRecipeId.value);
    recipeNotes.value = existing?.notes || '';
  } else {
    recipeName.value = '';
    recipeNotes.value = '';
  }
  showSaveDialog.value = true;
  nextTick(() => nameInput.value?.focus());
}

function handleSave() {
  if (!recipeName.value.trim()) return;
  try {
    const recipe = storage.saveRecipe({
      id: currentRecipeId.value || undefined,
      name: recipeName.value.trim(),
      flour: flour.value,
      proteinPer100g: proteinPer100g.value,
      ingredients: ingredients.map((i) => ({ name: i.name, percentage: i.percentage, waterContent: i.waterContent ?? 0 })),
      notes: recipeNotes.value.trim(),
    });
    currentRecipeId.value = recipe.id;
    currentRecipeName.value = recipe.name;
    showSaveDialog.value = false;
    recipeRefreshKey.value++;
    showToast('Recipe saved');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// Load recipe
function handleLoadRecipe(recipe) {
  flour.value = recipe.flour || 1000;
  proteinPer100g.value = recipe.proteinPer100g || 12;
  const loaded = (recipe.ingredients || []).map((i) => ({
    ...i,
    increment: i.increment ?? DEFAULT_INCREMENTS[i.name] ?? 1,
    waterContent: i.waterContent ?? DEFAULT_WATER_CONTENT[i.name] ?? 0,
  }));
  ingredients.splice(0, ingredients.length, ...loaded);
  currentRecipeId.value = recipe.id;
  currentRecipeName.value = recipe.name;
  showRecipes.value = false;
  updateURL();
  showToast(`Loaded "${recipe.name}"`);
}

// Clear
function clearForm() {
  flour.value = 1000;
  proteinPer100g.value = 12.5;
  flourIncrement.value = 50;
  ingredients.splice(0, ingredients.length,
    { name: 'Water', percentage: 65, increment: 5, waterContent: 1 },
    { name: 'Salt', percentage: 2, increment: 0.5, waterContent: 0 },
    { name: 'Leaven', percentage: 20, increment: 5, waterContent: 0.5 },
  );
  currentRecipeId.value = null;
  currentRecipeName.value = '';
  history.replaceState(null, '', window.location.pathname);
}

// URL
function updateURL() {
  const params = new URLSearchParams();
  params.set('flour', String(flour.value));
  params.set('protein', String(proteinPer100g.value));
  ingredients.forEach((ing) => {
    params.append('ing', `${ing.name}:${ing.percentage}`);
  });
  history.replaceState(null, '', `?${params.toString()}`);
}

function printSummary() {
  const lines = [
    currentRecipeName.value || 'Recipe',
    '',
    `Total dough: ${totalDough.value}g`,
    `Hydration: ${actualHydration.value}%`,
    `Flour protein: ${proteinPer100g.value}g/100g`,
    '',
    `Flour — ${flour.value || 0}g (100%)`,
    ...ingredients.map((ing) => `${ing.name} — ${calcWeight(ing.percentage)}g (${ing.percentage || 0}%)`),
  ];
  const w = window.open('', '_blank');
  w.document.write(`<html><head><title>Recipe</title><style>body{font-family:sans-serif;padding:2rem;max-width:480px}h1{font-size:1.25rem;margin-bottom:1rem}p{margin:0.25rem 0;font-size:0.9rem}hr{border:none;border-top:1px solid #ccc;margin:0.75rem 0}</style></head><body>`);
  w.document.write(`<h1>${lines[0]}</h1><hr>`);
  w.document.write(`<p><strong>${lines[2]}</strong></p>`);
  w.document.write(`<p><strong>${lines[3]}</strong></p>`);
  w.document.write(`<p>${lines[4]}</p><hr>`);
  lines.slice(6).forEach((l) => w.document.write(`<p>${l}</p>`));
  w.document.write(`</body></html>`);
  w.document.close();
  w.print();
}

function copyURL() {
  updateURL();
  navigator.clipboard.writeText(window.location.href).then(() => {
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  });
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('flour')) return false;

  flour.value = Number(params.get('flour')) || 1000;
  proteinPer100g.value = Number(params.get('protein')) || 12;

  const ingParams = params.getAll('ing');
  if (ingParams.length) {
    const parsed = ingParams.map((s) => {
      const [name, pct] = s.split(':');
      return { name, percentage: Number(pct) || 0, increment: DEFAULT_INCREMENTS[name] || 1, waterContent: DEFAULT_WATER_CONTENT[name] ?? 0 };
    }).filter((i) => i.name);
    if (parsed.length) {
      ingredients.splice(0, ingredients.length, ...parsed);
    }
  }
  return true;
}

// Export/Import
function handleExport() {
  const data = storage.exportRecipes();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bread-recipes.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Recipes exported');
}

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const count = storage.importRecipes(reader.result);
      recipeRefreshKey.value++;
      showToast(`Imported ${count} recipe${count !== 1 ? 's' : ''}`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// Init
onMounted(() => {
  if (!loadFromURL()) {
    const draft = storage.loadDraft();
    if (draft) {
      flour.value = draft.flour ?? 1000;
      proteinPer100g.value = draft.proteinPer100g ?? 12.5;
      if (draft.ingredients?.length) {
        const restored = draft.ingredients.map((i) => ({
          ...i,
          increment: i.increment ?? DEFAULT_INCREMENTS[i.name] ?? 1,
          waterContent: i.waterContent ?? DEFAULT_WATER_CONTENT[i.name] ?? 0,
        }));
        ingredients.splice(0, ingredients.length, ...restored);
      }
    }
  }
});
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="max-w-2xl mx-auto px-4 pt-4">
      <div class="max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[var(--color-surface)] rounded-2xl p-4">
        <h1 class="font-digital italic text-5xl font-normal text-[var(--color-text)] tracking-wide">MA/BAKER</h1>
        <div class="flex items-center gap-2">
          <button v-if="recipeCount > 0" @click="handleExport" class="icon-btn icon-btn-step" aria-label="Export recipes">
            <i class="ri-download-line"></i>
          </button>
          <label class="icon-btn icon-btn-step" aria-label="Import recipes">
            <i class="ri-upload-line"></i>
            <input type="file" accept=".json" class="hidden" @change="handleImport" />
          </label>
          <button
            @click="showRecipes = !showRecipes"
            class="relative icon-btn icon-btn-step"
            :aria-label="showRecipes ? 'Hide recipes' : 'Show recipes'"
          >
            <i class="ri-archive-line"></i>
            <span
              v-if="recipeCount > 0"
              class="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-badge)] text-[var(--color-badge-fg)] text-[10px] font-bold rounded-full flex items-center justify-center"
            >{{ recipeCount }}</span>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <!-- Current recipe indicator -->
      <div v-if="currentRecipeId" class="bg-[var(--color-surface)] rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Editing</p>
          <p class="font-digital italic text-4xl font-normal text-[var(--color-text)] truncate">{{ currentRecipeName }}</p>
        </div>
        <button @click="clearForm" class="icon-btn icon-btn-step shrink-0" aria-label="New recipe">
          <i class="ri-file-add-line"></i>
        </button>
      </div>

      <!-- Ingredient Cards -->
      <section class="space-y-4">
        <h2 class="sr-only">Ingredients</h2>

        <!-- Flour Cards -->
        <div
          v-for="(flour, index) in flours"
          :key="index"
          class="ingredient-card"
        >
          <div class="flex items-start justify-between mb-1">
            <h3 class="text-base font-normal">{{ flour.name }}</h3>
            <span v-if="flours.length === 1" class="pill pill-base">BASE — 100%</span>
            <span v-else class="pill pill-base">{{ Math.round((flour.weight || 0) / (totalFlour || 1) * 100) }}%</span>
          </div>
          <div class="flex items-baseline justify-between mb-4">
            <span class="text-2xl tabular-nums"><span class="font-digital italic text-6xl font-normal">{{ flour.weight || 0 }}</span><span class="inline-block -skew-x-3">g</span></span>
            <span class="text-base">Protein {{ flour.protein }}g / 100g</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button
                v-if="flours.length > 1"
                @click="removeFlour(index)"
                class="icon-btn icon-btn-danger"
                :aria-label="'Delete ' + flour.name"
              >
                <i class="ri-delete-bin-line"></i>
              </button>
              <button
                @click="openFlourEditModal(index)"
                class="icon-btn icon-btn-edit"
                :aria-label="'Edit ' + flour.name"
              >
                <i class="ri-pencil-line"></i>
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button @click="decrementFlour(index)" class="icon-btn icon-btn-step" :aria-label="'Decrease ' + flour.name">
                <i class="ri-subtract-line"></i>
              </button>
              <button @click="incrementFlour(index)" class="icon-btn icon-btn-step" :aria-label="'Increase ' + flour.name">
                <i class="ri-add-line"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Flour total row (2+ flours) -->
        <div v-if="flours.length > 1" class="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--color-surface)] text-sm text-[var(--color-text-muted)]">
          <i class="ri-information-line shrink-0"></i>
          <span>Total <span class="font-medium text-[var(--color-text)]">{{ totalFlour }}g</span> &middot; Avg protein <span class="font-medium text-[var(--color-text)]">{{ weightedProtein.toFixed(1) }}g/100g</span></span>
        </div>

        <!-- Add flour -->
        <button
          @click="showAddFlourMenu = true"
          class="w-full py-3 px-4 rounded-[16px] border-2 border-dashed border-[var(--color-text)] text-[var(--color-text)] text-sm font-medium flex items-center justify-center gap-1.5"
        >
          <i class="ri-add-line text-2xl"></i>
          ADD FLOUR
        </button>

        <!-- Add flour modal -->
        <div v-if="showAddFlourMenu" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" @click.self="showAddFlourMenu = false">
          <div class="bg-[var(--color-bg)] rounded-2xl w-full max-w-md p-4 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-digital italic text-4xl font-normal text-[var(--color-text)]">Flour</h3>
              <button @click="showAddFlourMenu = false" class="icon-btn icon-btn-step" aria-label="Close">
                <i class="ri-close-line"></i>
              </button>
            </div>
            <div class="relative overflow-hidden rounded-b-2xl">
              <div ref="flourListRef" class="space-y-2 max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]" @scroll="onFlourListScroll">
                <div
                  v-for="type in FLOUR_TYPES"
                  :key="type.name"
                  class="ingredient-card flex items-center justify-between"
                >
                  <span class="text-base font-medium" :class="isFlourAdded(type.name) ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'">{{ type.name }}</span>
                  <button
                    v-if="isFlourAdded(type.name)"
                    @click="removeFlourByName(type.name)"
                    class="icon-btn icon-btn-danger"
                    :aria-label="'Remove ' + type.name"
                  >
                    <i class="ri-delete-bin-line"></i>
                  </button>
                  <button
                    v-else
                    @click="addFlour(type)"
                    class="icon-btn icon-btn-step"
                    :aria-label="'Add ' + type.name"
                  >
                    <i class="ri-add-line"></i>
                  </button>
                </div>
                <div class="ingredient-card flex items-center justify-between">
                  <span class="text-base font-medium">Custom</span>
                  <button
                    @click="addFlour({ name: '', protein: 12.5 })"
                    class="icon-btn icon-btn-step"
                    aria-label="Add custom flour"
                  >
                    <i class="ri-add-line"></i>
                  </button>
                </div>
              </div>
              <div class="pointer-events-none absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[var(--color-bg)] to-transparent transition-opacity duration-300" :class="flourListAtTop ? 'opacity-0' : 'opacity-100'"></div>
              <div class="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-bg)] to-transparent transition-opacity duration-300" :class="flourListAtBottom ? 'opacity-0' : 'opacity-100'"></div>
            </div>
          </div>
        </div>

        <!-- Hydration suggestion -->
        <div v-if="hasWater" class="w-full py-3 px-4 rounded-[16px] border-2 border-transparent bg-[#959888] text-[var(--color-text)] text-center font-digital italic text-3xl font-normal tracking-wide">
          {{ actualHydration }}% — {{ hydrationStatus === 'optimal' ? 'in' : 'suggested' }} {{ suggestedRange.min }}–{{ suggestedRange.max }}% range
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
            <span class="text-2xl tabular-nums"><span class="font-digital italic text-6xl font-normal">{{ calcWeight(ing.percentage) }}</span><span class="inline-block -skew-x-3">g</span></span>
            <span v-if="ing.waterContent > 0" class="text-base">{{ Math.round(ing.waterContent * 100) }}% water</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button
                @click="removeIngredient(index)"
                class="icon-btn icon-btn-danger"
                :aria-label="'Delete ' + ing.name"
              >
                <i class="ri-delete-bin-line"></i>
              </button>
              <button
                @click="openEditModal(index)"
                class="icon-btn icon-btn-edit"
                :aria-label="'Edit ' + ing.name"
              >
                <i class="ri-pencil-line"></i>
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button @click="decrementIngredient(index)" class="icon-btn icon-btn-step" :aria-label="'Decrease ' + ing.name">
                <i class="ri-subtract-line"></i>
              </button>
              <button @click="incrementIngredient(index)" class="icon-btn icon-btn-step" :aria-label="'Increase ' + ing.name">
                <i class="ri-add-line"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Add ingredient -->
        <button
          @click="showAddMenu = true"
          class="w-full py-3 px-4 rounded-[16px] border-2 border-dashed border-[var(--color-text)] text-[var(--color-text)] text-sm font-medium flex items-center justify-center gap-1.5"
        >
          <i class="ri-add-line text-2xl"></i>
          ADD INGREDIENT
        </button>

        <!-- Ingredient modal -->
        <div v-if="showAddMenu" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" @click.self="showAddMenu = false">
          <div class="bg-[var(--color-bg)] rounded-2xl w-full max-w-md p-4 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-digital italic text-4xl font-normal text-[var(--color-text)]">Ingredients</h3>
              <button @click="showAddMenu = false" class="icon-btn icon-btn-step" aria-label="Close">
                <i class="ri-close-line"></i>
              </button>
            </div>
            <div class="relative overflow-hidden rounded-b-2xl">
            <div ref="ingredientListRef" class="space-y-2 max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]" @scroll="onIngredientListScroll">
              <div
                v-for="item in starterPack"
                :key="item"
                class="ingredient-card flex items-center justify-between"
              >
                <span class="text-base font-medium" :class="isAdded(item) ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'">{{ item }}</span>
                <button
                  v-if="isAdded(item)"
                  @click="removeIngredientByName(item)"
                  class="icon-btn icon-btn-danger"
                  :aria-label="'Remove ' + item"
                >
                  <i class="ri-delete-bin-line"></i>
                </button>
                <button
                  v-else
                  @click="addIngredient(item)"
                  class="icon-btn icon-btn-step"
                  :aria-label="'Add ' + item"
                >
                  <i class="ri-add-line"></i>
                </button>
              </div>
            </div>
            <div class="pointer-events-none absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[var(--color-bg)] to-transparent transition-opacity duration-300" :class="ingredientListAtTop ? 'opacity-0' : 'opacity-100'"></div>
            <div class="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-bg)] to-transparent transition-opacity duration-300" :class="ingredientListAtBottom ? 'opacity-0' : 'opacity-100'"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Edit Modal -->
      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" @click.self="showEditModal = false">
        <div class="bg-[var(--color-bg)] rounded-2xl w-full max-w-md p-4 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-digital italic text-4xl font-normal text-[var(--color-text)]">
              {{ editName || 'Edit' }}
            </h3>
            <button @click="showEditModal = false" class="icon-btn icon-btn-step" aria-label="Close">
              <i class="ri-close-line"></i>
            </button>
          </div>
          <!-- Name (always shown) -->
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input v-model="editName" type="text" class="input-field" />
          </div>
          <!-- Amount -->
          <div>
            <label class="block text-sm font-medium mb-1">
              {{ editTarget?.type === 'flour' ? 'Amount (g)' : 'Percentage (%)' }}
            </label>
            <input v-model.number="editAmount" type="number" inputmode="decimal" min="0" class="input-field" />
          </div>
          <!-- Increment -->
          <div>
            <label class="block text-sm font-medium mb-1">
              +/- step {{ editTarget?.type === 'flour' ? '(g)' : '(%)' }}
            </label>
            <input v-model.number="editIncrement" type="number" inputmode="decimal" min="0.1" step="0.1" class="input-field" />
          </div>
          <!-- Protein (flour only) -->
          <div v-if="editTarget?.type === 'flour'">
            <label class="block text-sm font-medium mb-1">Protein per 100g</label>
            <input v-model.number="editProtein" type="number" inputmode="decimal" min="8" max="15" step="0.1" class="input-field" />
          </div>
          <!-- Water content (ingredients only) -->
          <div v-if="editTarget?.type !== 'flour'">
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
      <section class="bg-[var(--color-surface)] rounded-[16px] p-5">
        <div class="flex justify-between mb-3">
          <h2 class="text-lg font-medium text-[var(--color-text)]">Recipe</h2>
          <button @click="printSummary" class="icon-btn icon-btn-step" aria-label="Print summary">
            <i class="ri-printer-line"></i>
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="bg-[#959888] rounded-[12px] p-3">
            <p class="text-xs font-medium">Total dough</p>
            <p class="text-base tabular-nums"><span class="font-digital italic text-6xl font-normal">{{ totalDough }}</span><span class="inline-block -skew-x-3">g</span></p>
          </div>
          <div class="bg-[#959888] rounded-[12px] p-3">
            <p class="text-xs font-medium">Hydration</p>
            <p class="text-base tabular-nums"><span class="font-digital italic text-6xl font-normal">{{ actualHydration }}</span><span class="inline-block -skew-x-3">%</span></p>
          </div>
        </div>
        <div class="mt-4 space-y-1.5">
          <div v-for="f in flours" :key="'s-flour-' + f.name" class="flex justify-between text-base">
            <span class="text-[var(--color-text)]">{{ f.name }}</span>
            <span class="font-medium tabular-nums text-[var(--color-text)]">{{ f.weight || 0 }}g<span class="ml-2 text-xs">{{ Math.round((f.weight || 0) / (totalFlour || 1) * 100) }}%</span></span>
          </div>
          <div v-for="ing in ingredients" :key="'s-' + ing.name" class="flex justify-between text-base">
            <span class="text-[var(--color-text)]">{{ ing.name }}</span>
            <span class="font-medium tabular-nums text-[var(--color-text)]">{{ calcWeight(ing.percentage) }}g<span class="ml-2 text-xs">{{ ing.percentage || 0 }}%</span></span>
          </div>
        </div>
      </section>

      <!-- Actions -->
      <section class="flex flex-col sm:flex-row flex-wrap gap-2 bg-[var(--color-surface)] rounded-[16px] p-4">
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
        <div class="bg-[var(--color-bg)] rounded-2xl w-full max-w-md p-4 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-digital italic text-4xl font-normal text-[var(--color-text)]">
              {{ currentRecipeId ? 'Update' : 'Save' }}
            </h3>
            <button @click="showSaveDialog = false" class="icon-btn icon-btn-step" aria-label="Close">
              <i class="ri-close-line"></i>
            </button>
          </div>
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
        <div class="bg-[var(--color-bg)] rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
          <RecipeManager
            @load="handleLoadRecipe"
            @close="showRecipes = false"
            @delete="recipeRefreshKey++"
            :refreshKey="recipeRefreshKey"
          />
        </div>
      </div>

<!-- Toast -->
      <Transition name="toast">
        <div
          v-if="toast.show"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-md text-sm font-medium shadow-lg"
          :class="toast.type === 'error' ? 'bg-[var(--color-text)] text-[var(--color-bg)]' : 'bg-[var(--color-accent)] text-[var(--color-accent-fg)]'"
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

const FLOUR_TYPES = [
  { name: 'Bread Flour',       protein: 12.5 },
  { name: 'All-Purpose Flour', protein: 10.5 },
  { name: 'Whole Wheat',       protein: 13.5 },
  { name: 'Rye Flour',         protein: 8.5  },
  { name: 'Spelt Flour',       protein: 11.5 },
  { name: 'Semolina',          protein: 13.0 },
  { name: 'Einkorn',           protein: 14.0 },
  { name: 'Pastry Flour',      protein: 8.0  },
  { name: 'Oat Flour',         protein: 10.0 },
];

const DEFAULT_FLOUR_INCREMENT = 50;

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

const flours = reactive([
  { name: 'Bread Flour', weight: 1000, protein: 12.5, increment: DEFAULT_FLOUR_INCREMENT },
]);

const ingredients = reactive([
  { name: 'Water', percentage: 65, increment: 5, waterContent: 1 },
  { name: 'Salt', percentage: 2, increment: 0.5, waterContent: 0 },
  { name: 'Leaven', percentage: 20, increment: 5, waterContent: 0.5 },
]);

const totalFlour = computed(() => flours.reduce((s, f) => s + (f.weight || 0), 0));
const weightedProtein = computed(() => {
  const total = totalFlour.value;
  if (!total) return 12.5;
  return flours.reduce((s, f) => s + (f.weight || 0) * (f.protein || 0), 0) / total;
});

function migrateFlours(data) {
  if (Array.isArray(data.flours) && data.flours.length) {
    return data.flours.map(f => ({
      name:      f.name      ?? 'Flour',
      weight:    f.weight    ?? 0,
      protein:   f.protein   ?? 12.5,
      increment: f.increment ?? DEFAULT_FLOUR_INCREMENT,
    }));
  }
  return [{ name: 'Flour', weight: data.flour ?? 1000, protein: data.proteinPer100g ?? 12.5, increment: DEFAULT_FLOUR_INCREMENT }];
}

const currentRecipeId = ref(null);
const currentRecipeName = ref('');
const showRecipes = ref(false);
const showSaveDialog = ref(false);
const showAddMenu = ref(false);
const showAddFlourMenu = ref(false);
const recipeName = ref('');
const recipeNotes = ref('');
const copied = ref(false);
const recipeRefreshKey = ref(0);
const nameInput = ref(null);
const ingredientListRef = ref(null);
const ingredientListAtBottom = ref(false);
const ingredientListAtTop = ref(true);
const flourListRef = ref(null);
const flourListAtBottom = ref(false);
const flourListAtTop = ref(true);

function onIngredientListScroll(e) {
  const el = e.target;
  ingredientListAtTop.value = el.scrollTop <= 2;
  ingredientListAtBottom.value = el.scrollHeight - el.scrollTop <= el.clientHeight + 2;
}

function onFlourListScroll(e) {
  const el = e.target;
  flourListAtTop.value = el.scrollTop <= 2;
  flourListAtBottom.value = el.scrollHeight - el.scrollTop <= el.clientHeight + 2;
}

watch(showAddMenu, (open) => {
  if (open) {
    nextTick(() => {
      if (ingredientListRef.value) {
        disableBodyScroll(ingredientListRef.value);
        const el = ingredientListRef.value;
        ingredientListAtTop.value = true;
        ingredientListAtBottom.value = el.scrollHeight <= el.clientHeight;
      }
    });
  } else {
    if (ingredientListRef.value) enableBodyScroll(ingredientListRef.value);
    ingredientListAtBottom.value = false;
    ingredientListAtTop.value = true;
  }
});

watch(showAddFlourMenu, (open) => {
  if (open) {
    nextTick(() => {
      if (flourListRef.value) {
        disableBodyScroll(flourListRef.value);
        const el = flourListRef.value;
        flourListAtTop.value = true;
        flourListAtBottom.value = el.scrollHeight <= el.clientHeight;
      }
    });
  } else {
    if (flourListRef.value) enableBodyScroll(flourListRef.value);
    flourListAtBottom.value = false;
    flourListAtTop.value = true;
  }
});

// Edit modal
const showEditModal = ref(false);
const editTarget = ref(null); // { type: 'flour', index: N } or ingredient index (number)
const editName = ref('');
const editAmount = ref(0);
const editIncrement = ref(0);
const editProtein = ref(0);
const editWaterContent = ref(0);

function openFlourEditModal(index) {
  const f = flours[index];
  editTarget.value = { type: 'flour', index };
  editName.value = f.name;
  editAmount.value = f.weight;
  editIncrement.value = f.increment;
  editProtein.value = f.protein;
  showEditModal.value = true;
}

function openEditModal(target) {
  editTarget.value = target;
  const ing = ingredients[target];
  editName.value = ing.name;
  editAmount.value = ing.percentage;
  editIncrement.value = ing.increment;
  editWaterContent.value = Math.round((ing.waterContent ?? 0) * 100);
  editProtein.value = 0;
  showEditModal.value = true;
}

function saveEditModal() {
  if (editTarget.value?.type === 'flour') {
    const f = flours[editTarget.value.index];
    f.name = editName.value;
    f.weight = editAmount.value;
    f.increment = editIncrement.value;
    f.protein = editProtein.value;
    showEditModal.value = false;
    return;
  }
  const ing = ingredients[editTarget.value];
  ing.name = editName.value;
  ing.percentage = editAmount.value;
  ing.increment = editIncrement.value;
  ing.waterContent = (editWaterContent.value || 0) / 100;
  showEditModal.value = false;
}

// Flour controls
function incrementFlour(index) {
  flours[index].weight = (flours[index].weight || 0) + flours[index].increment;
}

function decrementFlour(index) {
  flours[index].weight = Math.max(0, (flours[index].weight || 0) - flours[index].increment);
}

function removeFlour(index) {
  if (flours.length <= 1) return;
  flours.splice(index, 1);
}

function isFlourAdded(name) {
  return flours.some(f => f.name === name);
}

function removeFlourByName(name) {
  if (flours.length <= 1) return;
  const idx = flours.findIndex(f => f.name === name);
  if (idx >= 0) flours.splice(idx, 1);
}

function addFlour(type) {
  flours.push({ name: type.name, weight: 0, protein: type.protein, increment: DEFAULT_FLOUR_INCREMENT });
  showAddFlourMenu.value = false;
  openFlourEditModal(flours.length - 1);
}

// Ingredient controls
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
  return calculateWeight(totalFlour.value || 0, percentage || 0);
}

const totalDough = computed(() => calculateTotalDough(totalFlour.value || 0, ingredients));
const actualHydration = computed(() => calculateActualHydration(totalFlour.value || 0, ingredients));
const hasWater = computed(() => ingredients.some((i) => (i.waterContent ?? 0) > 0));

// Hydration suggestions
const suggestedRange = computed(() => getSuggestedHydrationRange(weightedProtein.value || 12.5));
const hydrationStatus = computed(() => getHydrationStatus(actualHydration.value, weightedProtein.value || 12.5));
const recipeCount = ref(0);

watch(recipeRefreshKey, () => {
  recipeCount.value = storage.getRecipes().length;
});

// Draft auto-save
function getDraftData() {
  return { flours: flours.map(f => ({ ...f })), ingredients: [...ingredients] };
}

watch([flours, ingredients], () => {
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
      flours: flours.map(f => ({ name: f.name, weight: f.weight, protein: f.protein })),
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
  const migratedFlours = migrateFlours(recipe);
  flours.splice(0, flours.length, ...migratedFlours);
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
  flours.splice(0, flours.length, { name: 'Bread Flour', weight: 1000, protein: 12.5, increment: DEFAULT_FLOUR_INCREMENT });
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
  flours.forEach(f => params.append('f', `${f.name}:${f.weight}:${f.protein}`));
  ingredients.forEach((ing) => {
    params.append('ing', `${ing.name}:${ing.percentage}`);
  });
  history.replaceState(null, '', `?${params.toString()}`);
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const fParams = params.getAll('f');
  if (!fParams.length && !params.has('flour')) return false;

  const parsed = fParams.length
    ? fParams.map(s => {
        const [n, w, p] = s.split(':');
        return { name: decodeURIComponent(n) || 'Flour', weight: Number(w) || 0, protein: Number(p) || 12.5, increment: DEFAULT_FLOUR_INCREMENT };
      }).filter(f => f.weight > 0)
    : [{ name: 'Flour', weight: Number(params.get('flour')) || 1000, protein: Number(params.get('protein')) || 12.5, increment: DEFAULT_FLOUR_INCREMENT }];

  if (parsed.length) flours.splice(0, flours.length, ...parsed);

  const ingParams = params.getAll('ing');
  if (ingParams.length) {
    const parsedIngs = ingParams.map((s) => {
      const [name, pct] = s.split(':');
      return { name, percentage: Number(pct) || 0, increment: DEFAULT_INCREMENTS[name] || 1, waterContent: DEFAULT_WATER_CONTENT[name] ?? 0 };
    }).filter((i) => i.name);
    if (parsedIngs.length) {
      ingredients.splice(0, ingredients.length, ...parsedIngs);
    }
  }
  return true;
}

function printSummary() {
  const flourLines = flours.length > 1
    ? [
        ...flours.map(f => `${f.name} — ${f.weight || 0}g (${Math.round((f.weight || 0) / (totalFlour.value || 1) * 100)}%)`),
        `Total flour — ${totalFlour.value}g (100%)`,
      ]
    : [`${flours[0]?.name || 'Flour'} — ${totalFlour.value || 0}g (100%)`];

  const w = window.open('', '_blank');
  w.document.write(`<html><head><title>Recipe</title><style>body{font-family:sans-serif;padding:2rem;max-width:480px}h1{font-size:1.25rem;margin-bottom:1rem}p{margin:0.25rem 0;font-size:0.9rem}hr{border:none;border-top:1px solid #ccc;margin:0.75rem 0}</style></head><body>`);
  w.document.write(`<h1>${currentRecipeName.value || 'Recipe'}</h1><hr>`);
  w.document.write(`<p><strong>Total dough: ${totalDough.value}g</strong></p>`);
  w.document.write(`<p><strong>Hydration: ${actualHydration.value}%</strong></p>`);
  w.document.write(`<p>Avg protein: ${weightedProtein.value.toFixed(1)}g/100g</p><hr>`);
  flourLines.forEach(l => w.document.write(`<p>${l}</p>`));
  ingredients.forEach(ing => w.document.write(`<p>${ing.name} — ${calcWeight(ing.percentage)}g (${ing.percentage || 0}%)</p>`));
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
  recipeCount.value = storage.getRecipes().length;
  if (!loadFromURL()) {
    const draft = storage.loadDraft();
    if (draft) {
      const migratedFlours = migrateFlours(draft);
      flours.splice(0, flours.length, ...migratedFlours);
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

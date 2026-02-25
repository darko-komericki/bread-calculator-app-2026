<template>
  <section class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold">Saved Recipes</h2>
      <button @click="$emit('close')" class="text-[var(--color-text-muted)] hover:text-black">
        <i class="ri-close-line text-xl"></i>
      </button>
    </div>

    <!-- Search -->
    <div v-if="recipes.length > 3" class="relative">
      <input
        v-model="search"
        type="text"
        placeholder="Search recipes..."
        class="input-field pl-9 text-sm"
      />
      <i class="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"></i>
    </div>

    <!-- Recipe list -->
    <div v-if="filteredRecipes.length" class="space-y-2 max-h-80 overflow-y-auto">
      <div
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        class="group border-2 border-[var(--color-text)] rounded-[12px] p-3 cursor-pointer hover:bg-[var(--color-bg-alt)] transition-colors"
        @click="$emit('load', recipe)"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <h3 class="font-medium truncate">{{ recipe.name }}</h3>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
              {{ recipe.flour }}g flour<template v-if="recipe.ingredients?.length"> &middot; {{ recipe.ingredients.map(i => i.name).join(', ') }}</template>
            </p>
            <p v-if="recipe.notes" class="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">{{ recipe.notes }}</p>
            <p class="text-[10px] text-[var(--color-text-muted)] mt-1">{{ formatDate(recipe.updatedAt || recipe.createdAt) }}</p>
          </div>
          <button
            @click.stop="confirmDelete(recipe)"
            class="opacity-0 group-hover:opacity-100 p-1 text-[var(--color-text-muted)] hover:text-black transition-all"
            aria-label="Delete recipe"
          >
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!recipes.length" class="text-center py-8 text-[var(--color-text-muted)]">
      <p class="text-sm">No saved recipes yet.</p>
      <p class="text-xs mt-1">Save your first recipe from the calculator.</p>
    </div>
    <div v-else class="text-center py-4 text-[var(--color-text-muted)] text-sm">
      No recipes match "{{ search }}"
    </div>

    <!-- Delete confirmation -->
    <div v-if="deletingRecipe" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" @click.self="deletingRecipe = null">
      <div class="bg-white border-2 border-[var(--color-text)] rounded-[16px] w-full max-w-sm p-5 space-y-4">
        <p>Delete <strong>{{ deletingRecipe.name }}</strong>?</p>
        <div class="flex gap-2">
          <button @click="handleDelete" class="btn-primary flex-1">
            Delete
          </button>
          <button @click="deletingRecipe = null" class="btn-tertiary flex-1">Cancel</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import * as storage from '../utils/storage.js';

const props = defineProps({ refreshKey: Number });
const emit = defineEmits(['load', 'close']);

const recipes = ref(storage.getRecipes());
const search = ref('');
const deletingRecipe = ref(null);

watch(() => props.refreshKey, () => {
  recipes.value = storage.getRecipes();
});

const filteredRecipes = computed(() => {
  if (!search.value.trim()) return recipes.value;
  const q = search.value.toLowerCase();
  return recipes.value.filter((r) => r.name.toLowerCase().includes(q));
});

function confirmDelete(recipe) {
  deletingRecipe.value = recipe;
}

function handleDelete() {
  if (!deletingRecipe.value) return;
  storage.deleteRecipe(deletingRecipe.value.id);
  recipes.value = storage.getRecipes();
  deletingRecipe.value = null;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>

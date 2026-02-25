# Bread Calculator PWA - Specification

## Project Overview
A lightweight web-based bread recipe calculator with baker's percentage support, hydration suggestions based on flour protein content, and local recipe storage. Deployable as PWA.

## Tech Stack
- **Framework**: Astro
- **Interactive Component**: Vue (hydrated island)
- **Styling**: Tailwind CSS
- **Storage**: localStorage (no database required)
- **Deployment**: Vercel/Netlify (static hosting)
- **PWA**: Service worker + manifest.json

---

## Feature Set

### 1. Core Calculator
**Purpose**: Calculate ingredient amounts using baker's percentages

**Inputs**:
- Flour weight (grams) - primary input, drives all other calculations
- Water percentage (0-100, default 75)
- Salt percentage (0-3, default 2)
- Leaven/Starter percentage (0-30, default 20)
- Flour protein per 100g (8-15g, optional, default 12g)

**Calculations** (all as % of flour weight):
- Water weight = (flour × water%) / 100
- Salt weight = (flour × salt%) / 100
- Leaven weight = (flour × leaven%) / 100
- Total dough weight = flour + water + salt + leaven
- Actual hydration = (water / flour) × 100

**Display Outputs**:
- All ingredient weights in grams
- Actual hydration percentage
- Total dough weight
- Per-ingredient percentages

### 2. Hydration Suggestion Engine
**Purpose**: Suggest optimal hydration range based on flour protein content

**Logic** (protein per 100g of flour):
- < 9g: 60-65% hydration (weak flour, e.g. pastry)
- 9-10.99g: 65-70% hydration (standard, e.g. AP flour)
- 11-12.99g: 70-75% hydration (strong, e.g. bread flour)
- ≥ 13g: 75-80% hydration (very strong, e.g. high-protein bread flour)

**Display**:
- Show suggested range next to water input
- Visual indicator (color or badge) if current hydration is outside suggested range
- Clickable suggestion to auto-fill water percentage to range midpoint

### 3. Recipe Storage (localStorage)

**Recipe Object Structure**:
```json
{
  "id": 1708347600000,
  "name": "My Sourdough",
  "flour": 1000,
  "water": 750,
  "salt": 20,
  "leaven": 20,
  "proteinPer100g": 12,
  "notes": "Long ferment, high hydration",
  "createdAt": "2026-02-19T10:30:00Z",
  "updatedAt": "2026-02-19T10:30:00Z"
}
```

**Storage Key**: `breadRecipes` (JSON stringified array)

**Operations**:
- `saveRecipe(recipe)` - Add new recipe or update existing
- `getRecipes()` - Retrieve all saved recipes
- `deleteRecipe(id)` - Remove recipe by ID
- `loadRecipe(id)` - Load recipe into calculator
- `updateRecipe(id, updates)` - Modify existing recipe
- `exportRecipes()` - Return recipes as JSON string
- `importRecipes(jsonString)` - Bulk import recipes

**Constraints**:
- Recipe name required, max 100 characters
- Max 50 recipes stored (warn user if approaching limit)
- Notes field optional, max 500 characters

### 4. UI Components & Interactions

#### Calculator Form
- Input group for each ingredient (flour, water, salt, leaven, protein)
- Real-time calculation as user types
- Buttons: Save Recipe, Load Recipe, Clear Form, Copy URL

#### Hydration Suggestion Display
- Shows current hydration vs suggested range
- Color indicator: green (within range), orange (slightly off), red (far off)
- Clickable suggestion pill to apply midpoint hydration

#### Recipe Management Panel
- Dropdown/list of saved recipes (sorted by recency)
- Click to load recipe into calculator
- Hover/expand to show: creation date, notes, delete button
- "Add Notes" button to edit/add notes on current recipe
- Search/filter by recipe name

#### Additional UI Elements
- "Recent Recipe" indicator - show which saved recipe is currently loaded
- "Draft" auto-save indicator - current state saved automatically
- Copy URL button - generates shareable URL with query params (like brdclc.com)
- Export Recipes - download JSON file
- Import Recipes - upload JSON file

#### Responsive Design
- Mobile-first approach
- Single column on mobile, optional two-column on desktop
- Touch-friendly button sizes
- Readable font sizes (16px+ for inputs)

### 5. URL Query Parameter Support

**Format**: `/?flour=1000&water=75&salt=2&leaven=20&protein=12`

**Behavior**:
- On page load, parse query params and populate calculator
- "Update URL" button to generate shareable link with current values
- Clicking saved recipe should update URL to reflect loaded recipe

### 6. PWA Features

**manifest.json**:
- App name: "Bread Calculator"
- Short name: "BreadCalc"
- Description: "Baker's percentage calculator with hydration suggestions"
- Theme color: #2c3e50 (or your choice)
- Icons: 192x192 and 512x512 (bread/baker theme)
- Display: standalone
- Start URL: /

**Service Worker**:
- Cache calculator app shell and static assets
- Network-first strategy for data/images
- Offline support (app fully functional offline with stored recipes)
- Background sync for future features (not needed now)

**Installation**:
- Add to home screen prompt on supported browsers
- Works offline with stored recipes

### 7. Data Persistence & Privacy

**localStorage Behavior**:
- All data stored locally in browser only
- No server transmission
- User can clear data via browser settings
- Export feature allows users to back up recipes locally
- Survives browser restarts, cache clearing (unless explicitly deleted)

**Privacy**:
- No analytics
- No cookies
- No external API calls
- No user tracking

---

## Implementation Details

### Project Structure
```
bread-calculator/
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   ├── components/
│   │   ├── Calculator.vue
│   │   └── RecipeManager.vue
│   ├── utils/
│   │   ├── calculations.js
│   │   ├── storage.js
│   │   └── hydrationSuggestions.js
│   ├── styles/
│   │   └── globals.css (Tailwind directives)
│   └── pages/
│       └── index.astro
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

### Utility Functions

**calculations.js**:
```
calculateWater(flour, waterPercent) → number
calculateSalt(flour, saltPercent) → number
calculateLeaven(flour, leavenPercent) → number
calculateTotalDough(flour, water, salt, leaven) → number
calculateActualHydration(water, flour) → number
```

**hydrationSuggestions.js**:
```
getSuggestedHydrationRange(proteinPer100g) → {min: number, max: number}
isHydrationInRange(actual, min, max) → boolean
getHydrationStatus(actual, proteinPer100g) → "optimal" | "low" | "high"
```

**storage.js**:
```
saveRecipe(recipe) → recipe
getRecipes() → array
deleteRecipe(id) → void
loadRecipe(id) → recipe | null
updateRecipe(id, updates) → recipe
exportRecipes() → string (JSON)
importRecipes(jsonString) → void
getStorageStats() → {count: number, percentUsed: number}
```

### Component API

**Calculator.vue Props**: None required (hydrated client:load)

**Calculator.vue State**:
- formData: {flour, water, salt, leaven, proteinPer100g}
- calculations: {waterGrams, saltGrams, leavenGrams, totalDough, actualHydration}
- currentRecipeId: null | number
- showRecipeManager: boolean

**Calculator.vue Methods**:
- updateField(fieldName, value)
- calculateAll()
- saveRecipe()
- loadRecipe(id)
- copyURL()
- exportRecipes()
- importRecipes(file)
- clearForm()
- toggleTheme() - switches between light/dark, updates localStorage and applies class to html element

### Styling Considerations
- Use Tailwind utility classes exclusively
- Clean, minimalist design with proper spacing (use Tailwind spacing scale)
- Good contrast for readability (use slate/gray for text)
- Subtle animations using Tailwind @apply and custom animations
- Color coding: green (hydration OK), orange/amber (warning), red (attention)
- Responsive design using Tailwind breakpoints (mobile-first)
- Input focus states with Tailwind focus: classes
- Custom component classes via @apply if needed for reuse

**Tailwind Config** (`tailwind.config.mjs`):
- Enable JIT mode (default in v3+)
- Content paths: `./src/**/*.{astro,vue,js}`
- Dark mode: `darkMode: 'class'` (class-based, not system)
- Custom colors for bread theme (optional warm accent):
  ```js
  extend: {
    colors: {
      bread: '#8B6F47', // warm brown accent
    }
  }
  ```
- Default font: system sans-serif or custom web font

**Theme Implementation**:
- Root element (`<html>`) receives `dark` class when dark mode active
- Storage key: `breadTheme` with values `'light'` or `'dark'`
- On component mount, check localStorage → if not set, check `prefers-color-scheme` → default to `'light'`
- Theme toggle button updates localStorage and applies/removes `dark` class to `<html>` element immediately
- All color utilities use Tailwind dark: variants:
  - `bg-white dark:bg-slate-900`
  - `text-slate-900 dark:text-white`
  - `border-gray-200 dark:border-gray-700`
  - `shadow dark:shadow-lg` (shadows darker in dark mode)
- Transition between themes: add `transition-colors duration-200` to elements that change color

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS 13.4+ for PWA support
- Fallback graceful for older browsers (calculator still works, PWA features degrade)

---

## Deployment

**Build Command**: `npm run build`

**Deploy to Vercel/Netlify**:
- Connect GitHub repo
- Build command: `astro build`
- Output directory: `dist/`
- No environment variables needed

**CDN**: Static content, use edge caching

---

## Future Enhancements (Out of Scope)
- Multiple bread type presets (sourdough, yeasted, rye, etc.)
- Ingredient lists with prep instructions
- Timeline/fermentation schedule calculator
- Nutrition calculator
- Cloud sync across devices
- Ingredient substitution suggestions

---

## Testing Checklist
- [ ] Calculations accurate (verify against brdclc.com)
- [ ] Hydration suggestions display correctly
- [ ] Save/load recipes works
- [ ] localStorage persists after refresh
- [ ] URL params load correctly
- [ ] Copy URL generates valid shareable link
- [ ] Export/import recipes works
- [ ] Responsive design on mobile
- [ ] Service worker caches app
- [ ] Offline functionality works
- [ ] PWA install prompt appears
- [ ] No console errors

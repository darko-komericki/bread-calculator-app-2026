# MaBaker

A bread recipe calculator with baker's percentage support, hydration suggestions based on flour protein content, and local recipe storage. Works as a PWA for offline use.

## Features

- **Baker's percentage calculator** — enter flour weight, get all ingredient weights calculated in real time
- **Multiple flour blends** — add multiple flours (e.g. 80% bread flour + 20% whole wheat) with individual weights and protein values; hydration suggestion is weighted-averaged across all flours
- **Hydration suggestions** — suggests optimal water percentage based on flour protein content
- **Water content tracking** — each ingredient has a water content property (e.g. milk 87%, starter 50%) for accurate hydration calculation
- **Recipe storage** — save, load, edit, and delete recipes (localStorage, no account needed)
- **Share recipes** — copy a URL with recipe params to share with others
- **Import/Export** — backup and restore recipes as JSON files
- **Dark mode** — warm bakery-themed light and dark themes
- **PWA** — installable, works offline
- **Mobile-first** — responsive design with touch-friendly controls

## Tech Stack

- [Astro](https://astro.build/) — static site framework
- [Vue 3](https://vuejs.org/) — interactive calculator component (hydrated island)
- [Tailwind CSS v4](https://tailwindcss.com/) — styling via Vite plugin
- localStorage — recipe persistence

## Commands

| Command           | Action                                    |
| :---------------- | :---------------------------------------- |
| `npm install`     | Install dependencies                      |
| `npm run dev`     | Start dev server at `localhost:4321`      |
| `npm run build`   | Build for production to `./dist/`         |
| `npm run preview` | Preview production build locally          |

## Deployment

Static site — deploy to Vercel, Netlify, or any static host:

```sh
npm run build
# Output: dist/
```

No environment variables or database required. All data stays in the user's browser.

## URL Parameters

Share recipes via URL. Multiple flours use repeated `f` params:

```
/?f=Bread+Flour:800:12.5&f=Whole+Wheat:200:13.5&ing=Water:72&ing=Salt:2
```

Each `f` param is `name:weight_g:protein`. Each `ing` param is `name:percentage`.

Old single-flour format (`?flour=1000&protein=12.5`) is still supported for backward compatibility.

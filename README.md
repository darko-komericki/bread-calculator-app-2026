# MaBaker

A bread recipe calculator with baker's percentage support, hydration suggestions based on flour protein content, and local recipe storage. Works as a PWA for offline use.

## Features

- **Baker's percentage calculator** — enter flour weight, get all ingredient weights calculated in real time
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

Share recipes via URL:

```
/?flour=1000&water=75&salt=2&leaven=20&protein=12
```

Parameters: `flour` (grams), `water` (%), `salt` (%), `leaven` (%), `protein` (g per 100g flour).

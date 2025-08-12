# A Danish tax calculator for mere mortals

It calculates the tax and net salary for a given gross salary. This is intended to be used to get a ballpark figure for the tax and net salary, and is not intended to be used for precise calculations.

Published at **[skattefar.invoke.dk](https://skattefar.invoke.dk)**

## Sources

- [Oversigt over kommuneskatter og bundskat](https://skm.dk/tal-og-metode/satser/oversigt-over-kommuneskatter)
- [Oversigt over skatteværdi af fradrag](https://skm.dk/tal-og-metode/satser/skatte-og-afgiftsberegning/skattevaerdi-af-fradrag-i-2024)

## Setup

```bash
npm install
npm run dev
```

## Folder structure

```
skattefar/
  public/                 # Static assets served as-is
  src/
    assets/               # App images/icons
    components/
      inputs/             # Input UI (income period, municipality select)
      results/            # Results UI
      ui/                 # Reusable UI primitives (button, card, input, select, ...)
    lib/                  # App logic: config, tax, formatting, municipalities, utils
    App.tsx               # Root app component
    main.tsx              # Entry point
  index.html              # Vite HTML template
  vite.config.ts          # Vite config
  eslint.config.js        # ESLint config
  tsconfig*.json          # TypeScript configs
```

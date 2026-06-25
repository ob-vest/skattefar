# A Danish tax calculator for mere mortals

It calculates the tax and net salary for a given gross salary. This is intended to be used to get a ballpark figure for the tax and net salary, and is not intended to be used for precise calculations.

Supports income years **2025** and **2026** (incl. the 2024 tax reform — mellemskat, splittet topskat, top-topskat — that phases in from 2026).

Published at **[skattefar.invoke.dk](https://skattefar.invoke.dk)**

## Sources

- [Oversigt over kommuneskatter (skm.dk)](https://skm.dk/tal-og-metode/satser/oversigt-over-kommuneskatter)
- [Personskattelovens satser (skm.dk)](https://skm.dk/tal-og-metode/satser/satser-og-beloebsgraenser-i-lovgivningen/personskatteloven)
- [Beløbsgrænser reguleret efter PSL § 20, 2025–2026 (skm.dk)](https://skm.dk/tal-og-metode/satser/regulering-af-beloebsgraenser/beloebsgraenser-i-skattelovgivningen-der-reguleres-efter-personskattelovens-20-2025-2026)
- [Bundskat / mellemskat / topskat / top-topskat (skat.dk)](https://skat.dk/en-us/help/botton-bracket-middle-bracket-top-bracket-and-additional-top-bracket-tax)
- [Befordringsfradrag 2026 (sktst.dk)](https://sktst.dk/nyheder-og-pressemeddelelser/hoejere-fradrag-til-pendlerne-i-2026)
- [Forhøjet befordringsfradrag 2026 – effekt pr. kommune (skm.dk)](https://skm.dk/aktuelt/presse-nyheder/pressemeddelelser/nye-tal-se-effekten-af-det-forhoejede-befordringsfradrag-i-alle-landets-98-kommuner)
- [Befordringsfradrag ved bopæl i visse yderkommuner, LL §9C stk 3 (info.skat.dk)](https://info.skat.dk/data.aspx?oid=2061744)
- [Forhøjet befordringsfradrag for personer med lav indkomst, LL §9C stk 4 (info.skat.dk)](https://info.skat.dk/data.aspx?oid=2061745)
- [ATP-satser, privat virksomhed (borger.dk)](https://www.borger.dk/pension-og-efterloen/ATP-Livslang-pension-oversigt/atp-bidraget/atp-satser-for-privat-virksomhed)
- [ATP-satser, offentlig virksomhed (borger.dk)](https://www.borger.dk/pension-og-efterloen/ATP-Livslang-pension-oversigt/atp-bidraget/ATP-satser-for-offentlig-virksomhed)

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

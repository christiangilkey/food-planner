# Food Planner

A meal and grocery planner that isn't a macro counter. It plans a week of meals around:

- **Your body**: calorie and protein targets from weight, height, age, sex, activity level and goal (Mifflin–St Jeor).
- **Fullness (satiety)**: every meal gets a fullness-per-calorie score based on energy density, protein share, fiber and sugar.
- **ADHD / dopamine**: an optional mode that favors low-effort meals (few steps, little hands-on time) and food that's rewarding to eat (crunchy, bold, novel, fun). It flags sugar-crash risks and has a "Hungry right now?" quick pick. A stimulant-medication setting shifts calories to breakfast and evening.
- **Snacking**: snacks are planned into the day instead of left to impulse.
- **Your kitchen**: only suggests recipes you have the equipment for, within your time limit.
- **Your pantry**: subtracts what's at home from the shopping list and favors meals that use it up.
- **Price by location**: US-average package prices scaled by a state multiplier, plus your own per-store prices. The shopping list shows where an item is cheaper.
- **Shopping list**: grouped by aisle, rounded up to real package sizes, warns about leftovers that will spoil, and moves bought items into your pantry.
- **Deficiencies and your brain**: weekly average of 17 micronutrients (including choline, B6 and selenium) against your recommended intake. Each one is linked to the areas a shortfall affects: memory, focus and thinking, mood and emotions, immunity, energy, sleep, bones, and heart. Each link is rated *strong*, *moderate* or *emerging* evidence. You also get absorption tips, foods and meals that fix it, and upper-limit and sodium warnings.
- **Water**: a daily target from body weight, activity, heat and medication, minus the water in that day's planned food, spread across the day as a drinking schedule.
- **Meal timing**: a daily timeline built from your wake time, bedtime and workout. It includes breakfast before stimulant medication, dinner 3+ hours before bed, snacks in the longest gaps (or before a workout), a caffeine cutoff, morning light and walks after meals.
- **Weekly food rotation**: guidelines for how often to eat seafood and fatty fish, legumes, nuts, leafy greens, cruciferous and red/orange veg, fruit, berries, whole grains and fermented foods. It also caps tuna (mercury), red and processed meat, and rice (arsenic), and tracks 30 plants a week. The planner switches sources to meet these, and each guideline cites its source and evidence level.
- **Biohacks**: evidence-rated tips chosen for your profile and week (blood sugar, sleep and rhythm, hydration, ADHD, gut, training, supplements), plus a specific tip on each planned meal.

- **Health conditions**: ADHD, anxiety, depression (with an MAOI safety switch), migraine, menopause (perimenopause, menopause, postmenopause), high blood pressure, high cholesterol, GERD, type 1 and type 2 diabetes, and chronic kidney disease. Each condition can set hard limits (daily sodium cap, saturated fat and added sugar shares, eggs per week, no blood-sugar-spiking meals, no food within 3 hours of bed, protein cap). It can also remove foods that could worsen it (with a re-allow option for individual triggers), add evidence-based food targets, and turn off unsafe tips. After building a week, the planner forces swaps until every hard limit is met, and the Plan tab warns if a week ever breaks one.
- **Sources for everything**: every health claim, target, limit and tip links to its source (PubMed, NIH fact sheets, clinical guidelines) and is labeled *strong*, *moderate* or *emerging* evidence. Numbers that are the app's own choice are labeled *app convention*. The Health → Sources screen lists them all.

- **Supplements & peptides**: about 30 supplements with research doses, evidence levels and sources, recommended from your conditions and this week's nutrient gaps. Each is screened against your conditions and medications (blood thinners, SSRIs, MAOIs, thyroid hormone, insulin or sulfonylureas, blood-pressure drugs, pregnancy); unsafe combinations are marked "Not for you" and never recommended. Popular supplements the evidence doesn't support are listed with the reason. Peptides cover approved prescription peptides (semaglutide, tirzepatide, insulin, bremelanotide, tesamorelin) and commonly used unapproved "research peptides" (BPC-157, TB-500, CJC-1295, ipamorelin and others), with what the FDA and the human evidence actually say. No doses are given for unapproved peptides.
- **Google Tasks export**: sends the meal plan (a task per meal, due that day, with ingredients), the shopping list and prep-day cooking to Google Tasks, straight from the browser. It needs a one-time Google Cloud OAuth client ID; the setup steps are in the app. "Copy as checklist" works with no setup.
- **Recipes with steps**: 115 recipes, each with numbered step-by-step instructions in its details sheet. Meat, fish and egg steps give USDA safe internal temperatures.
- **Caffeine and grapefruit**: coffee, green tea, dark chocolate and kombucha count toward a daily caffeine limit (400 mg, or 200 mg in pregnancy). Caffeinated drinks can be switched off, and GERD, anxiety and migraine treat them as triggers. A medication checkbox removes grapefruit for drugs with a grapefruit warning.
- **Feels like an app**: swipe left and right between tabs, line icons, subtle motion (turned off when your device asks for reduced motion), and every recipe name opens its details.

Everything is stored locally in the browser (`localStorage`). Back up and restore from the Profile screen.

## Use it

**Live app: https://christiangilkey.github.io/food-planner/**

- **Install on Android:** open the link in Chrome, then tap ⋮ → **Install app** (or **Add to Home screen**). It opens full-screen and works offline after the first visit.
- **Install on iPhone:** open the link in Safari, tap Share → **Add to Home Screen**.
- **Share it:** send anyone the link. Each person's profile, conditions, pantry and plans stay on their own device; nothing is uploaded and no account is needed.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Publish an update

```bash
npm run deploy
```

This runs the tests, builds the site, and pushes `dist/` to the `gh-pages` branch, which GitHub Pages serves. Changes appear at the live link within a minute or two. Installed copies update the next time they're opened online.

## Test

```bash
npm test
```

## Where things live

| Path | What |
| --- | --- |
| `src/data/foods.ts` | Food table: nutrients per 100 g (approximate USDA values), package sizes, prices, shelf life |
| `src/data/recipes.ts` | Recipes: ingredients, equipment, time, steps, "dopamine" traits |
| `src/data/methods.ts` | Step-by-step instructions for every recipe |
| `src/data/nutrients.ts` | Nutrient targets by sex/age, deficiency effects, upper limits |
| `src/data/regions.ts` | State grocery price multipliers |
| `src/data/sources.ts` | Every cited source (PubMed IDs verified against PubMed) |
| `src/data/conditions.ts` | Health conditions: limits, avoided foods, helpful foods, guidance, with sources |
| `src/lib/conditions.ts` | Applies conditions: avoided foods, merged limits, plan violation checks |
| `src/lib/safety.test.ts` | Safety tests: every condition and combinations, across kitchens and seeds |
| `src/data/rotation.ts` | Weekly food-frequency guidelines with sources |
| `src/lib/rotation.ts` | Food-group servings, rotation scoring and report |
| `src/lib/schedule.ts` | Meal times and the daily timeline |
| `src/lib/water.ts` | Water target |
| `src/lib/tips.ts` | Biohack tips and per-meal tips |
| `src/lib/energy.ts` | Calorie and macro targets |
| `src/lib/nutrition.ts` | Totals, fullness / reward / ease scores, pricing |
| `src/lib/planner.ts` | Weekly plan generation and meal ranking |
| `src/lib/shopping.ts` | Shopping list |
| `src/lib/analysis.ts` | Deficiency report |

To add a food or recipe, add an entry to `foods.ts` or `recipes.ts` (and its steps to `methods.ts`). The tests check that every recipe ingredient exists, every recipe has steps, and that each food's macros roughly add up to its calories.

Nutrition values and prices are estimates. This is a planning tool, not medical advice. Conditions such as diabetes, kidney disease and MAOI use need individual care from your clinicians.

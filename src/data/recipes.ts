import type { Equipment, Recipe } from '../types'

export const EQUIPMENT: { id: Equipment; label: string }[] = [
  { id: 'stove', label: 'Stovetop' },
  { id: 'skillet', label: 'Skillet / frying pan' },
  { id: 'pot', label: 'Saucepan / pot' },
  { id: 'oven', label: 'Oven' },
  { id: 'sheetpan', label: 'Sheet pan' },
  { id: 'microwave', label: 'Microwave' },
  { id: 'airfryer', label: 'Air fryer' },
  { id: 'toaster', label: 'Toaster' },
  { id: 'blender', label: 'Blender' },
  { id: 'ricecooker', label: 'Rice cooker' },
  { id: 'slowcooker', label: 'Slow cooker / Instant Pot' },
]

const d = (crunch: number, flavor: number, novelty: number, fun: number) => ({ crunch, flavor, novelty, fun })

// Ingredient grams are for the whole recipe; one plan entry is one serving.
export const RECIPES: Recipe[] = [
  // ── Breakfast ─────────────────────────────────────────────
  {
    id: 'overnight_oats', name: 'Overnight protein oats', slots: ['breakfast'], servings: 1,
    items: [{ food: 'oats', grams: 50 }, { food: 'milk', grams: 120 }, { food: 'greek_yogurt', grams: 100 }, { food: 'chia', grams: 10 }, { food: 'berries', grams: 75 }, { food: 'honey', grams: 5 }],
    equipment: [], activeMin: 4, totalMin: 4, steps: 2, dopamine: d(0, 1, 1, 1), batch: true,
    note: 'Stir everything in a jar the night before. Make 3–4 jars at once.',
  },
  {
    id: 'eggs_toast', name: 'Scrambled eggs, spinach & toast', slots: ['breakfast'], servings: 1,
    items: [{ food: 'egg', grams: 150 }, { food: 'bread', grams: 64 }, { food: 'butter', grams: 5 }, { food: 'spinach', grams: 30 }],
    equipment: ['stove', 'skillet'], activeMin: 8, totalMin: 8, steps: 3, dopamine: d(1, 1, 0, 1),
  },
  {
    id: 'yogurt_parfait', name: 'Greek yogurt crunch parfait', slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'greek_yogurt', grams: 200 }, { food: 'berries', grams: 75 }, { food: 'walnuts', grams: 15 }, { food: 'pumpkin_seeds', grams: 10 }, { food: 'honey', grams: 7 }],
    equipment: [], activeMin: 3, totalMin: 3, steps: 1, dopamine: d(2, 1, 1, 2),
  },
  {
    id: 'pb_banana_toast', name: 'Peanut butter banana toast', slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'bread', grams: 64 }, { food: 'peanut_butter', grams: 32 }, { food: 'banana', grams: 100 }, { food: 'chia', grams: 5 }],
    equipment: [], activeMin: 3, totalMin: 3, steps: 2, dopamine: d(1, 1, 0, 2),
    note: 'Toast it if you have a toaster or air fryer, but it works untoasted.',
  },
  {
    id: 'protein_smoothie', name: 'Berry protein smoothie', slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'protein_powder', grams: 30 }, { food: 'milk', grams: 250 }, { food: 'banana', grams: 100 }, { food: 'berries', grams: 75 }, { food: 'spinach', grams: 30 }],
    equipment: ['blender'], activeMin: 4, totalMin: 4, steps: 2, dopamine: d(0, 1, 1, 2),
    note: 'Drinkable calories: useful when meds kill your appetite.',
  },
  {
    id: 'breakfast_burritos', name: 'Freezer breakfast burritos', slots: ['breakfast', 'lunch'], servings: 4,
    items: [{ food: 'egg', grams: 300 }, { food: 'tortillas', grams: 180 }, { food: 'cheddar', grams: 60 }, { food: 'black_beans', grams: 125 }, { food: 'salsa', grams: 60 }],
    equipment: ['stove', 'skillet'], activeMin: 20, totalMin: 25, steps: 5, dopamine: d(0, 2, 1, 3), batch: true,
    note: 'Wrap in foil and freeze. Microwave 2 min from frozen.',
  },
  {
    id: 'cottage_bowl', name: 'Cottage cheese berry bowl', slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'cottage_cheese', grams: 200 }, { food: 'berries', grams: 75 }, { food: 'almonds', grams: 15 }, { food: 'honey', grams: 5 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(2, 1, 1, 1),
  },
  {
    id: 'egg_mug', name: 'Microwave egg & cheese mug', slots: ['breakfast'], servings: 1,
    items: [{ food: 'egg', grams: 100 }, { food: 'spinach', grams: 20 }, { food: 'cheddar', grams: 20 }, { food: 'bread', grams: 32 }],
    equipment: ['microwave'], activeMin: 4, totalMin: 4, steps: 2, dopamine: d(0, 1, 1, 1),
  },
  {
    id: 'cereal_milk', name: "Fortified O's with milk & banana", slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'cereal', grams: 50 }, { food: 'milk', grams: 240 }, { food: 'banana', grams: 60 }],
    equipment: [], activeMin: 1, totalMin: 1, steps: 1, dopamine: d(2, 0, 0, 1),
  },
  {
    id: 'potato_hash', name: 'Potato & pepper hash with eggs', slots: ['breakfast', 'dinner'], servings: 1,
    items: [{ food: 'potato', grams: 250 }, { food: 'egg', grams: 100 }, { food: 'onion', grams: 50 }, { food: 'bell_pepper', grams: 75 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 20, steps: 4, dopamine: d(2, 2, 1, 1),
  },

  // ── Lunch / dinner ───────────────────────────────────────
  {
    id: 'burrito_bowl', name: 'Chicken burrito bowls', slots: ['lunch', 'dinner'], servings: 4,
    items: [{ food: 'chicken_thigh', grams: 450 }, { food: 'white_rice', grams: 200 }, { food: 'black_beans', grams: 250 }, { food: 'salsa', grams: 200 }, { food: 'avocado', grams: 136 }, { food: 'cheddar', grams: 60 }, { food: 'onion', grams: 100 }, { food: 'bell_pepper', grams: 150 }, { food: 'olive_oil', grams: 15 }],
    equipment: ['stove', 'skillet', 'pot'], activeMin: 25, totalMin: 40, steps: 6, dopamine: d(1, 3, 2, 3), batch: true,
  },
  {
    id: 'sheetpan_chicken', name: 'Sheet-pan chicken, sweet potato & broccoli', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'chicken_breast', grams: 450 }, { food: 'sweet_potato', grams: 450 }, { food: 'broccoli', grams: 340 }, { food: 'olive_oil', grams: 30 }, { food: 'onion', grams: 150 }],
    equipment: ['oven', 'sheetpan'], activeMin: 12, totalMin: 40, steps: 4, dopamine: d(2, 2, 1, 1), batch: true,
    note: 'Everything on one pan at 425°F for about 30 minutes. One pan to wash.',
  },
  {
    id: 'turkey_tacos', name: 'Turkey tacos', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'ground_turkey', grams: 454 }, { food: 'tortillas', grams: 270 }, { food: 'salsa', grams: 120 }, { food: 'cheddar', grams: 60 }, { food: 'bell_pepper', grams: 150 }, { food: 'onion', grams: 100 }, { food: 'avocado', grams: 136 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['stove', 'skillet'], activeMin: 20, totalMin: 25, steps: 5, dopamine: d(1, 3, 2, 3),
  },
  {
    id: 'tuna_sandwich', name: 'Crunchy tuna sandwich + carrots', slots: ['lunch'], servings: 1,
    items: [{ food: 'tuna', grams: 142 }, { food: 'greek_yogurt', grams: 40 }, { food: 'pickles', grams: 40 }, { food: 'bread', grams: 64 }, { food: 'carrots', grams: 85 }],
    equipment: [], activeMin: 6, totalMin: 6, steps: 3, dopamine: d(3, 2, 1, 2),
    note: 'Greek yogurt stands in for mayo. Chopped pickles add the crunch.',
  },
  {
    id: 'lentil_soup', name: 'Lentil, potato & spinach soup', slots: ['lunch', 'dinner'], servings: 6,
    items: [{ food: 'lentils', grams: 400 }, { food: 'canned_tomatoes', grams: 411 }, { food: 'carrots', grams: 200 }, { food: 'onion', grams: 150 }, { food: 'spinach', grams: 140 }, { food: 'olive_oil', grams: 20 }, { food: 'potato', grams: 300 }],
    equipment: ['stove', 'pot'], alt: ['slowcooker'], activeMin: 15, totalMin: 50, steps: 4, dopamine: d(0, 2, 1, 0), batch: true,
    note: 'Freezes well. Dump it all in a slow cooker on low for 6–8 h if you prefer.',
  },
  {
    id: 'salmon_bowl', name: 'Salmon kimchi rice bowl', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'salmon', grams: 340 }, { food: 'white_rice', grams: 150 }, { food: 'cucumber', grams: 150 }, { food: 'avocado', grams: 136 }, { food: 'edamame', grams: 150 }, { food: 'soy_sauce', grams: 30 }, { food: 'kimchi', grams: 100 }],
    equipment: ['airfryer', 'ricecooker'], alt: ['oven', 'sheetpan', 'stove', 'pot'], activeMin: 15, totalMin: 30, steps: 5, dopamine: d(2, 3, 3, 3),
  },
  {
    id: 'meat_sauce_pasta', name: 'Pasta with spinach meat sauce', slots: ['lunch', 'dinner'], servings: 5,
    items: [{ food: 'pasta', grams: 454 }, { food: 'ground_beef', grams: 454 }, { food: 'canned_tomatoes', grams: 822 }, { food: 'onion', grams: 150 }, { food: 'spinach', grams: 140 }, { food: 'olive_oil', grams: 15 }],
    equipment: ['stove', 'pot', 'skillet'], activeMin: 20, totalMin: 30, steps: 4, dopamine: d(0, 2, 0, 1), batch: true,
  },
  {
    id: 'tofu_stirfry', name: 'Honey-soy tofu stir-fry', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'tofu', grams: 396 }, { food: 'stirfry_veg', grams: 454 }, { food: 'brown_rice', grams: 150 }, { food: 'soy_sauce', grams: 30 }, { food: 'olive_oil', grams: 20 }, { food: 'honey', grams: 10 }],
    equipment: ['stove', 'skillet', 'pot'], activeMin: 20, totalMin: 35, steps: 5, dopamine: d(2, 3, 2, 1),
  },
  {
    id: 'rotisserie_wrap', name: 'Rotisserie chicken hummus wrap', slots: ['lunch', 'dinner'], servings: 1,
    items: [{ food: 'rotisserie', grams: 120 }, { food: 'hummus', grams: 50 }, { food: 'cucumber', grams: 75 }, { food: 'bell_pepper', grams: 60 }, { food: 'tortillas', grams: 45 }, { food: 'spinach', grams: 20 }],
    equipment: [], activeMin: 5, totalMin: 5, steps: 2, dopamine: d(2, 2, 1, 3),
    note: 'No cooking. One store-bought rotisserie chicken covers 4–5 wraps.',
  },
  {
    id: 'loaded_potato', name: 'Microwave loaded baked potato', slots: ['lunch', 'dinner'], servings: 1,
    items: [{ food: 'potato', grams: 300 }, { food: 'cottage_cheese', grams: 120 }, { food: 'broccoli', grams: 100 }, { food: 'cheddar', grams: 25 }, { food: 'salsa', grams: 40 }],
    equipment: ['microwave'], activeMin: 5, totalMin: 12, steps: 3, dopamine: d(0, 2, 1, 2),
  },
  {
    id: 'chickpea_salad', name: 'Chopped chickpea salad', slots: ['lunch'], servings: 2,
    items: [{ food: 'chickpeas', grams: 250 }, { food: 'cucumber', grams: 150 }, { food: 'bell_pepper', grams: 150 }, { food: 'avocado', grams: 68 }, { food: 'onion', grams: 30 }, { food: 'olive_oil', grams: 15 }, { food: 'string_cheese', grams: 56 }],
    equipment: [], activeMin: 10, totalMin: 10, steps: 2, dopamine: d(2, 2, 2, 1), batch: true,
  },
  {
    id: 'shrimp_fried_rice', name: 'Shrimp fried rice', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'shrimp', grams: 340 }, { food: 'white_rice', grams: 200 }, { food: 'egg', grams: 100 }, { food: 'stirfry_veg', grams: 300 }, { food: 'soy_sauce', grams: 30 }, { food: 'olive_oil', grams: 20 }],
    equipment: ['stove', 'skillet', 'pot'], activeMin: 20, totalMin: 35, steps: 5, dopamine: d(1, 3, 2, 2),
  },
  {
    id: 'quesadillas', name: 'Black bean & spinach quesadillas', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'tortillas', grams: 180 }, { food: 'black_beans', grams: 250 }, { food: 'cheddar', grams: 80 }, { food: 'salsa', grams: 100 }, { food: 'spinach', grams: 60 }],
    equipment: ['stove', 'skillet'], alt: ['airfryer'], activeMin: 12, totalMin: 15, steps: 3, dopamine: d(2, 2, 1, 3),
  },
  {
    id: 'airfryer_thighs', name: 'Air-fryer soy chicken, rice & broccoli', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'chicken_thigh', grams: 450 }, { food: 'white_rice', grams: 200 }, { food: 'broccoli', grams: 340 }, { food: 'olive_oil', grams: 15 }, { food: 'soy_sauce', grams: 15 }],
    equipment: ['airfryer', 'ricecooker'], alt: ['oven', 'sheetpan', 'stove', 'pot'], activeMin: 10, totalMin: 30, steps: 3, dopamine: d(2, 2, 1, 1), batch: true,
  },
  {
    id: 'sardine_toast', name: 'Sardine avocado toast', slots: ['lunch', 'snack'], servings: 1,
    items: [{ food: 'sardines', grams: 106 }, { food: 'bread', grams: 64 }, { food: 'avocado', grams: 68 }, { food: 'pickles', grams: 30 }],
    equipment: [], activeMin: 5, totalMin: 5, steps: 2, dopamine: d(2, 3, 3, 2),
    note: 'A nutrient powerhouse: omega-3, vitamin D, B12 and calcium (from the soft bones).',
  },
  {
    id: 'chili', name: 'Beef & bean chili', slots: ['lunch', 'dinner'], servings: 6,
    items: [{ food: 'ground_beef', grams: 454 }, { food: 'black_beans', grams: 500 }, { food: 'canned_tomatoes', grams: 822 }, { food: 'onion', grams: 150 }, { food: 'bell_pepper', grams: 150 }, { food: 'cheddar', grams: 60 }],
    equipment: ['slowcooker'], alt: ['stove', 'pot'], activeMin: 15, totalMin: 240, steps: 3, dopamine: d(0, 3, 1, 1), batch: true,
    note: 'Brown the beef, dump everything in, walk away. Freezes for months.',
  },
  {
    id: 'snack_box', name: 'Turkey & cheese snack box', slots: ['lunch', 'snack'], servings: 1,
    items: [{ food: 'deli_turkey', grams: 85 }, { food: 'cheddar', grams: 30 }, { food: 'rice_cakes', grams: 18 }, { food: 'cucumber', grams: 75 }, { food: 'carrots', grams: 75 }],
    equipment: [], activeMin: 4, totalMin: 4, steps: 1, dopamine: d(3, 1, 1, 3),
    note: 'Like a grown-up Lunchable: lots of small things to pick at.',
  },
  {
    id: 'peanut_noodles', name: 'Cold peanut noodles with edamame', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'pasta', grams: 200 }, { food: 'peanut_butter', grams: 50 }, { food: 'soy_sauce', grams: 30 }, { food: 'honey', grams: 10 }, { food: 'edamame', grams: 150 }, { food: 'carrots', grams: 100 }, { food: 'cucumber', grams: 100 }],
    equipment: ['stove', 'pot'], activeMin: 15, totalMin: 20, steps: 4, dopamine: d(2, 3, 3, 2), batch: true,
  },

  {
    id: 'microwave_salmon', name: 'Microwave-steamed salmon, potatoes & broccoli', slots: ['lunch', 'dinner'], servings: 1,
    items: [{ food: 'salmon', grams: 150 }, { food: 'potato', grams: 200 }, { food: 'broccoli', grams: 150 }, { food: 'olive_oil', grams: 5 }],
    equipment: ['microwave'], activeMin: 6, totalMin: 14, steps: 3, dopamine: d(0, 1, 2, 1),
    note: 'Microwave the potatoes 5 min, then add the salmon and broccoli in a covered dish for 4–5 min until the fish flakes.',
  },
  {
    id: 'tuna_chickpea_salad', name: 'Tuna, chickpea & crunchy veg salad', slots: ['lunch', 'dinner'], servings: 1,
    items: [{ food: 'tuna', grams: 142 }, { food: 'chickpeas', grams: 125 }, { food: 'cucumber', grams: 100 }, { food: 'bell_pepper', grams: 75 }, { food: 'olive_oil', grams: 10 }],
    equipment: [], activeMin: 6, totalMin: 6, steps: 2, dopamine: d(3, 2, 1, 1),
  },
  {
    id: 'sweet_potato_bowl', name: 'Sweet potato & black bean bowl', slots: ['lunch', 'dinner'], servings: 1,
    items: [{ food: 'sweet_potato', grams: 250 }, { food: 'black_beans', grams: 125 }, { food: 'greek_yogurt', grams: 60 }, { food: 'spinach', grams: 30 }],
    equipment: ['microwave'], activeMin: 4, totalMin: 10, steps: 2, dopamine: d(0, 1, 2, 2),
  },
  {
    id: 'hummus_wrap', name: 'Hummus veggie wrap', slots: ['lunch'], servings: 1,
    items: [{ food: 'tortillas', grams: 45 }, { food: 'hummus', grams: 60 }, { food: 'chickpeas', grams: 60 }, { food: 'spinach', grams: 20 }, { food: 'bell_pepper', grams: 60 }, { food: 'cucumber', grams: 60 }],
    equipment: [], activeMin: 4, totalMin: 4, steps: 1, dopamine: d(2, 1, 1, 2),
  },

  // ── Snacks ───────────────────────────────────────────────
  {
    id: 'microwave_oatmeal', name: 'Microwave oatmeal with berries & walnuts', slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'oats', grams: 50 }, { food: 'milk', grams: 200 }, { food: 'berries', grams: 75 }, { food: 'walnuts', grams: 10 }],
    equipment: ['microwave'], activeMin: 3, totalMin: 4, steps: 2, dopamine: d(1, 1, 0, 1),
  },
  {
    id: 'apple_almonds', name: 'Apple + almonds', slots: ['snack'], servings: 1,
    items: [{ food: 'apple', grams: 180 }, { food: 'almonds', grams: 20 }],
    equipment: [], activeMin: 1, totalMin: 1, steps: 1, dopamine: d(3, 1, 0, 1),
  },
  {
    id: 'apple_pb', name: 'Apple slices + peanut butter', slots: ['snack'], servings: 1,
    items: [{ food: 'apple', grams: 180 }, { food: 'peanut_butter', grams: 32 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(3, 1, 0, 2),
  },
  {
    id: 'popcorn', name: 'Microwave popcorn (from kernels)', slots: ['snack'], servings: 1,
    items: [{ food: 'popcorn', grams: 30 }, { food: 'olive_oil', grams: 5 }],
    equipment: ['microwave'], alt: ['stove', 'pot'], activeMin: 3, totalMin: 4, steps: 2, dopamine: d(3, 1, 1, 3),
    note: 'Kernels in a folded paper bag, about 2.5 min. A huge bowl for very few calories.',
  },
  {
    id: 'edamame_snack', name: 'Salted edamame', slots: ['snack'], servings: 1,
    items: [{ food: 'edamame', grams: 150 }],
    equipment: ['microwave'], alt: ['stove', 'pot'], activeMin: 2, totalMin: 4, steps: 1, dopamine: d(1, 1, 2, 3),
  },
  {
    id: 'hummus_veg', name: 'Hummus & crunchy veggies', slots: ['snack'], servings: 1,
    items: [{ food: 'hummus', grams: 60 }, { food: 'carrots', grams: 75 }, { food: 'bell_pepper', grams: 75 }, { food: 'cucumber', grams: 75 }],
    equipment: [], activeMin: 3, totalMin: 3, steps: 1, dopamine: d(3, 2, 1, 3),
  },
  {
    id: 'cheese_clementines', name: 'String cheese + clementines', slots: ['snack'], servings: 1,
    items: [{ food: 'string_cheese', grams: 56 }, { food: 'clementine', grams: 150 }],
    equipment: [], activeMin: 1, totalMin: 1, steps: 1, dopamine: d(0, 1, 1, 2),
  },
  {
    id: 'choc_almonds', name: 'Dark chocolate + almonds', slots: ['snack'], servings: 1,
    items: [{ food: 'dark_chocolate', grams: 20 }, { food: 'almonds', grams: 20 }],
    equipment: [], activeMin: 1, totalMin: 1, steps: 1, dopamine: d(3, 2, 1, 1),
  },
  {
    id: 'jerky_pickle', name: 'Jerky + pickle spears', slots: ['snack'], servings: 1,
    items: [{ food: 'jerky', grams: 28 }, { food: 'pickles', grams: 60 }],
    equipment: [], activeMin: 1, totalMin: 1, steps: 1, dopamine: d(2, 3, 1, 2),
  },
  {
    id: 'bean_nachos', name: 'Bean nacho plate', slots: ['snack'], servings: 1,
    items: [{ food: 'tortilla_chips', grams: 30 }, { food: 'black_beans', grams: 60 }, { food: 'salsa', grams: 60 }, { food: 'cheddar', grams: 15 }],
    equipment: ['microwave'], activeMin: 3, totalMin: 4, steps: 2, dopamine: d(3, 3, 1, 3),
  },
  {
    id: 'ricecake_pb', name: 'Rice cakes, PB & banana', slots: ['snack'], servings: 1,
    items: [{ food: 'rice_cakes', grams: 18 }, { food: 'peanut_butter', grams: 16 }, { food: 'banana', grams: 60 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(3, 1, 1, 2),
  },
  {
    id: 'boiled_eggs', name: 'Hard-boiled eggs', slots: ['snack', 'breakfast'], servings: 1,
    items: [{ food: 'egg', grams: 100 }],
    equipment: ['stove', 'pot'], alt: ['airfryer'], activeMin: 2, totalMin: 15, steps: 2, dopamine: d(0, 1, 0, 1), batch: true,
    note: 'Boil a dozen on Sunday. Peel and salt as needed.',
  },
  {
    id: 'nice_cream', name: 'Berry banana "nice cream"', slots: ['snack'], servings: 1,
    items: [{ food: 'banana', grams: 120 }, { food: 'berries', grams: 75 }, { food: 'greek_yogurt', grams: 60 }],
    equipment: ['blender'], activeMin: 4, totalMin: 4, steps: 2, dopamine: d(0, 2, 3, 3),
  },
  {
    id: 'trail_mix', name: 'Dark chocolate trail mix', slots: ['snack'], servings: 1,
    items: [{ food: 'almonds', grams: 15 }, { food: 'pumpkin_seeds', grams: 15 }, { food: 'dark_chocolate', grams: 10 }],
    equipment: [], activeMin: 1, totalMin: 1, steps: 1, dopamine: d(3, 2, 2, 2), batch: true,
  },
  {
    id: 'chia_pudding', name: 'Chia pudding', slots: ['snack', 'breakfast'], servings: 1,
    items: [{ food: 'chia', grams: 25 }, { food: 'milk', grams: 150 }, { food: 'honey', grams: 5 }, { food: 'berries', grams: 50 }],
    equipment: [], activeMin: 3, totalMin: 3, steps: 2, dopamine: d(0, 1, 2, 2), batch: true,
  },
  // ── Added: more everyday recipes ─────────────────────────
  // Breakfast
  {
    id: 'veggie_omelet', name: 'Spinach, mushroom & feta omelet', slots: ['breakfast'], servings: 1,
    items: [{ food: 'egg', grams: 150 }, { food: 'spinach', grams: 30 }, { food: 'mushrooms', grams: 50 }, { food: 'bell_pepper', grams: 40 }, { food: 'feta', grams: 20 }, { food: 'olive_oil', grams: 5 }],
    equipment: ['stove', 'skillet'], activeMin: 10, totalMin: 10, steps: 3, dopamine: d(0, 2, 1, 1),
  },
  {
    id: 'kefir_smoothie', name: 'Berry kefir flax smoothie', slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'kefir', grams: 250 }, { food: 'berries', grams: 100 }, { food: 'banana', grams: 80 }, { food: 'flaxseed', grams: 10 }],
    equipment: ['blender'], activeMin: 4, totalMin: 4, steps: 2, dopamine: d(0, 1, 1, 2),
  },
  {
    id: 'strawberry_yogurt', name: 'Strawberry yogurt bowl with sunflower seeds', slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'greek_yogurt', grams: 200 }, { food: 'strawberries', grams: 120 }, { food: 'sunflower_seeds', grams: 12 }, { food: 'honey', grams: 5 }],
    equipment: [], activeMin: 3, totalMin: 3, steps: 1, dopamine: d(1, 1, 1, 2),
  },
  {
    id: 'avocado_egg_toast', name: 'Avocado toast with a fried egg', slots: ['breakfast', 'lunch'], servings: 1,
    items: [{ food: 'bread', grams: 64 }, { food: 'avocado', grams: 70 }, { food: 'egg', grams: 100 }, { food: 'lemon', grams: 5 }],
    equipment: ['stove', 'skillet'], alt: ['microwave'], activeMin: 7, totalMin: 7, steps: 3, dopamine: d(1, 2, 1, 2),
  },
  {
    id: 'pb_oatmeal', name: 'Peanut butter banana oatmeal', slots: ['breakfast'], servings: 1,
    items: [{ food: 'oats', grams: 50 }, { food: 'milk', grams: 200 }, { food: 'peanut_butter', grams: 16 }, { food: 'banana', grams: 60 }],
    equipment: ['microwave'], alt: ['stove', 'pot'], activeMin: 4, totalMin: 5, steps: 2, dopamine: d(0, 1, 0, 1),
  },
  {
    id: 'breakfast_tacos', name: 'Egg & black bean breakfast tacos', slots: ['breakfast', 'lunch'], servings: 1,
    items: [{ food: 'corn_tortillas', grams: 60 }, { food: 'egg', grams: 100 }, { food: 'black_beans', grams: 60 }, { food: 'salsa', grams: 40 }],
    equipment: ['stove', 'skillet'], activeMin: 8, totalMin: 8, steps: 3, dopamine: d(1, 3, 1, 3),
  },
  {
    id: 'egg_muffins', name: 'Make-ahead veggie egg muffins', slots: ['breakfast', 'snack'], servings: 6,
    items: [{ food: 'egg', grams: 600 }, { food: 'spinach', grams: 100 }, { food: 'mushrooms', grams: 150 }, { food: 'bell_pepper', grams: 100 }, { food: 'cheddar', grams: 60 }],
    equipment: ['oven'], activeMin: 15, totalMin: 35, steps: 3, dopamine: d(0, 1, 1, 2), batch: true,
    note: 'Bake in a muffin tin at 350°F for about 20 minutes. Keeps 4 days in the fridge; reheat 30 seconds.',
  },
  {
    id: 'almond_milk_oats', name: 'Overnight oats with almond milk & mango', slots: ['breakfast'], servings: 1,
    items: [{ food: 'oats', grams: 50 }, { food: 'almond_milk', grams: 180 }, { food: 'greek_yogurt', grams: 80 }, { food: 'mango', grams: 80 }, { food: 'chia', grams: 10 }],
    equipment: [], activeMin: 4, totalMin: 4, steps: 2, dopamine: d(0, 1, 1, 1), batch: true,
  },

  // Lunch & dinner
  {
    id: 'greek_chicken_salad', name: 'Greek chicken salad', slots: ['lunch', 'dinner'], servings: 1,
    items: [{ food: 'rotisserie', grams: 120 }, { food: 'romaine', grams: 100 }, { food: 'cucumber', grams: 80 }, { food: 'tomato', grams: 80 }, { food: 'feta', grams: 30 }, { food: 'olive_oil', grams: 10 }, { food: 'lemon', grams: 10 }],
    equipment: [], activeMin: 8, totalMin: 8, steps: 2, dopamine: d(2, 2, 1, 1),
  },
  {
    id: 'turkey_chili', name: 'Turkey & kidney bean chili', slots: ['lunch', 'dinner'], servings: 6,
    items: [{ food: 'ground_turkey', grams: 454 }, { food: 'kidney_beans', grams: 500 }, { food: 'canned_tomatoes', grams: 822 }, { food: 'onion', grams: 150 }, { food: 'bell_pepper', grams: 150 }, { food: 'garlic', grams: 10 }],
    equipment: ['slowcooker'], alt: ['stove', 'pot'], activeMin: 15, totalMin: 240, steps: 3, dopamine: d(0, 3, 1, 1), batch: true,
  },
  {
    id: 'baked_cod', name: 'Lemon-garlic baked cod with potatoes & green beans', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'cod', grams: 450 }, { food: 'potato', grams: 450 }, { food: 'green_beans', grams: 340 }, { food: 'olive_oil', grams: 20 }, { food: 'lemon', grams: 30 }, { food: 'garlic', grams: 6 }],
    equipment: ['oven', 'sheetpan'], activeMin: 12, totalMin: 35, steps: 3, dopamine: d(1, 1, 1, 1),
  },
  {
    id: 'fish_tacos', name: 'Fish tacos with crunchy slaw', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'tilapia', grams: 340 }, { food: 'corn_tortillas', grams: 180 }, { food: 'cabbage', grams: 150 }, { food: 'greek_yogurt', grams: 60 }, { food: 'lemon', grams: 15 }, { food: 'avocado', grams: 68 }],
    equipment: ['stove', 'skillet'], alt: ['airfryer'], activeMin: 18, totalMin: 20, steps: 4, dopamine: d(3, 3, 2, 3),
  },
  {
    id: 'salmon_patties', name: 'Canned salmon patties', slots: ['lunch', 'dinner'], servings: 4,
    items: [{ food: 'canned_salmon', grams: 418 }, { food: 'egg', grams: 50 }, { food: 'oats', grams: 30 }, { food: 'onion', grams: 50 }, { food: 'lemon', grams: 10 }, { food: 'olive_oil', grams: 15 }],
    equipment: ['stove', 'skillet'], alt: ['airfryer'], activeMin: 15, totalMin: 20, steps: 3, dopamine: d(2, 2, 2, 2), batch: true,
    note: 'Mash the soft bones in with the salmon: they are where the calcium is.',
  },
  {
    id: 'pork_sheetpan', name: 'Sheet-pan pork tenderloin, sweet potato & broccoli', slots: ['dinner'], servings: 3,
    items: [{ food: 'pork_loin', grams: 454 }, { food: 'sweet_potato', grams: 400 }, { food: 'broccoli', grams: 300 }, { food: 'olive_oil', grams: 20 }, { food: 'garlic', grams: 6 }],
    equipment: ['oven', 'sheetpan'], activeMin: 12, totalMin: 40, steps: 3, dopamine: d(1, 2, 1, 1), batch: true,
  },
  {
    id: 'steak_dinner', name: 'Seared sirloin, potatoes & green beans', slots: ['dinner'], servings: 2,
    items: [{ food: 'sirloin', grams: 340 }, { food: 'potato', grams: 400 }, { food: 'green_beans', grams: 300 }, { food: 'olive_oil', grams: 10 }, { food: 'garlic', grams: 6 }],
    equipment: ['stove', 'skillet', 'microwave'], activeMin: 18, totalMin: 25, steps: 4, dopamine: d(1, 2, 1, 2),
  },
  {
    id: 'chicken_veg_soup', name: 'Chicken vegetable noodle soup', slots: ['lunch', 'dinner'], servings: 6,
    items: [{ food: 'chicken_breast', grams: 450 }, { food: 'carrots', grams: 200 }, { food: 'celery', grams: 150 }, { food: 'onion', grams: 150 }, { food: 'broth', grams: 1400 }, { food: 'ww_pasta', grams: 120 }, { food: 'garlic', grams: 6 }],
    equipment: ['stove', 'pot'], alt: ['slowcooker'], activeMin: 15, totalMin: 45, steps: 3, dopamine: d(0, 1, 0, 1), batch: true,
  },
  {
    id: 'quinoa_chickpea_bowl', name: 'Mediterranean quinoa chickpea bowl', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'quinoa', grams: 150 }, { food: 'chickpeas', grams: 250 }, { food: 'cucumber', grams: 150 }, { food: 'tomato', grams: 150 }, { food: 'feta', grams: 60 }, { food: 'olive_oil', grams: 20 }, { food: 'lemon', grams: 30 }],
    equipment: ['stove', 'pot'], alt: ['ricecooker'], activeMin: 12, totalMin: 25, steps: 3, dopamine: d(2, 2, 2, 2), batch: true,
  },
  {
    id: 'pasta_primavera', name: 'Whole-wheat pasta primavera', slots: ['lunch', 'dinner'], servings: 4,
    items: [{ food: 'ww_pasta', grams: 340 }, { food: 'zucchini', grams: 200 }, { food: 'bell_pepper', grams: 150 }, { food: 'peas', grams: 150 }, { food: 'parmesan', grams: 40 }, { food: 'olive_oil', grams: 25 }, { food: 'garlic', grams: 8 }],
    equipment: ['stove', 'pot', 'skillet'], activeMin: 18, totalMin: 25, steps: 4, dopamine: d(0, 2, 1, 1), batch: true,
  },
  {
    id: 'turkey_marinara_pasta', name: 'Turkey marinara with whole-wheat spaghetti', slots: ['lunch', 'dinner'], servings: 4,
    items: [{ food: 'ww_pasta', grams: 340 }, { food: 'ground_turkey', grams: 454 }, { food: 'marinara', grams: 500 }, { food: 'spinach', grams: 100 }],
    equipment: ['stove', 'pot', 'skillet'], activeMin: 15, totalMin: 25, steps: 3, dopamine: d(0, 2, 0, 2), batch: true,
  },
  {
    id: 'kale_caesar', name: 'Kale chicken Caesar (yogurt dressing)', slots: ['lunch'], servings: 1,
    items: [{ food: 'rotisserie', grams: 120 }, { food: 'kale', grams: 80 }, { food: 'parmesan', grams: 15 }, { food: 'greek_yogurt', grams: 30 }, { food: 'lemon', grams: 10 }, { food: 'bread', grams: 30 }],
    equipment: [], activeMin: 8, totalMin: 8, steps: 2, dopamine: d(2, 2, 1, 1),
    note: 'Massage the kale with the lemon for a minute to soften it. Toast or tear the bread for croutons.',
  },
  {
    id: 'pinto_bowl', name: 'Pinto bean burrito bowls', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'brown_rice', grams: 120 }, { food: 'pinto_beans', grams: 250 }, { food: 'corn', grams: 150 }, { food: 'salsa', grams: 100 }, { food: 'avocado', grams: 68 }, { food: 'romaine', grams: 60 }, { food: 'greek_yogurt', grams: 60 }],
    equipment: ['stove', 'pot'], alt: ['ricecooker'], activeMin: 12, totalMin: 40, steps: 3, dopamine: d(1, 3, 2, 3), batch: true,
  },
  {
    id: 'cauli_fried_rice', name: 'Cauliflower egg fried rice', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'cauliflower', grams: 400 }, { food: 'egg', grams: 150 }, { food: 'peas', grams: 100 }, { food: 'carrots', grams: 80 }, { food: 'soy_sauce', grams: 20 }, { food: 'olive_oil', grams: 15 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 15, steps: 3, dopamine: d(1, 2, 2, 1),
  },
  {
    id: 'shrimp_zucchini', name: 'Garlic shrimp & zucchini over quinoa', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'shrimp', grams: 340 }, { food: 'zucchini', grams: 300 }, { food: 'garlic', grams: 10 }, { food: 'olive_oil', grams: 15 }, { food: 'lemon', grams: 15 }, { food: 'quinoa', grams: 150 }],
    equipment: ['stove', 'skillet', 'pot'], activeMin: 18, totalMin: 25, steps: 4, dopamine: d(1, 2, 2, 1),
  },
  {
    id: 'tuna_pasta_salad', name: 'Mediterranean tuna pasta salad', slots: ['lunch'], servings: 3,
    items: [{ food: 'ww_pasta', grams: 200 }, { food: 'tuna', grams: 284 }, { food: 'tomato', grams: 200 }, { food: 'cucumber', grams: 150 }, { food: 'olive_oil', grams: 20 }, { food: 'lemon', grams: 20 }, { food: 'parmesan', grams: 20 }],
    equipment: ['stove', 'pot'], activeMin: 12, totalMin: 20, steps: 3, dopamine: d(2, 2, 1, 1), batch: true,
  },
  {
    id: 'lentil_spinach_stew', name: 'Spiced lentil & spinach stew with brown rice', slots: ['lunch', 'dinner'], servings: 5,
    items: [{ food: 'lentils', grams: 300 }, { food: 'canned_tomatoes', grams: 411 }, { food: 'spinach', grams: 150 }, { food: 'onion', grams: 150 }, { food: 'garlic', grams: 10 }, { food: 'olive_oil', grams: 15 }, { food: 'brown_rice', grams: 200 }],
    equipment: ['stove', 'pot'], alt: ['slowcooker', 'ricecooker'], activeMin: 15, totalMin: 45, steps: 3, dopamine: d(0, 3, 2, 1), batch: true,
    note: 'Season with cumin, turmeric and chili from your spice rack.',
  },
  {
    id: 'chicken_fajitas', name: 'Sheet-pan chicken fajitas', slots: ['dinner'], servings: 4,
    items: [{ food: 'chicken_breast', grams: 450 }, { food: 'bell_pepper', grams: 300 }, { food: 'onion', grams: 150 }, { food: 'olive_oil', grams: 20 }, { food: 'corn_tortillas', grams: 240 }, { food: 'salsa', grams: 100 }],
    equipment: ['oven', 'sheetpan'], activeMin: 12, totalMin: 30, steps: 3, dopamine: d(2, 3, 1, 3),
  },
  {
    id: 'black_bean_soup', name: '15-minute black bean soup', slots: ['lunch', 'dinner'], servings: 4,
    items: [{ food: 'black_beans', grams: 750 }, { food: 'salsa', grams: 200 }, { food: 'broth', grams: 500 }, { food: 'onion', grams: 100 }, { food: 'greek_yogurt', grams: 60 }],
    equipment: ['stove', 'pot'], activeMin: 8, totalMin: 15, steps: 2, dopamine: d(0, 2, 1, 1), batch: true,
  },
  {
    id: 'salmon_salad_wrap', name: 'Salmon salad wrap', slots: ['lunch'], servings: 1,
    items: [{ food: 'canned_salmon', grams: 85 }, { food: 'greek_yogurt', grams: 30 }, { food: 'celery', grams: 30 }, { food: 'romaine', grams: 30 }, { food: 'tortillas', grams: 45 }],
    equipment: [], activeMin: 5, totalMin: 5, steps: 2, dopamine: d(2, 2, 1, 2),
  },
  {
    id: 'cobb_salad', name: 'Chicken Cobb salad', slots: ['lunch', 'dinner'], servings: 1,
    items: [{ food: 'romaine', grams: 120 }, { food: 'egg', grams: 50 }, { food: 'rotisserie', grams: 80 }, { food: 'avocado', grams: 50 }, { food: 'tomato', grams: 60 }, { food: 'cheddar', grams: 15 }, { food: 'olive_oil', grams: 10 }],
    equipment: [], activeMin: 8, totalMin: 8, steps: 2, dopamine: d(2, 2, 1, 2),
  },
  {
    id: 'turkey_lettuce_wraps', name: 'Turkey lettuce wraps', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'ground_turkey', grams: 454 }, { food: 'romaine', grams: 150 }, { food: 'carrots', grams: 100 }, { food: 'mushrooms', grams: 150 }, { food: 'soy_sauce', grams: 25 }, { food: 'garlic', grams: 6 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 15, steps: 3, dopamine: d(3, 3, 2, 3),
  },
  {
    id: 'tomato_feta_salad', name: 'Tomato, cucumber & feta salad', slots: ['lunch', 'snack'], servings: 1,
    items: [{ food: 'tomato', grams: 150 }, { food: 'cucumber', grams: 150 }, { food: 'feta', grams: 30 }, { food: 'chickpeas', grams: 80 }, { food: 'olive_oil', grams: 10 }],
    equipment: [], activeMin: 5, totalMin: 5, steps: 1, dopamine: d(2, 2, 1, 1),
  },

  // Snacks
  {
    id: 'grapes_cheese', name: 'Grapes + string cheese', slots: ['snack'], servings: 1,
    items: [{ food: 'grapes', grams: 120 }, { food: 'string_cheese', grams: 28 }],
    equipment: [], activeMin: 1, totalMin: 1, steps: 1, dopamine: d(1, 1, 1, 2),
  },
  {
    id: 'celery_pb', name: 'Celery + peanut butter', slots: ['snack'], servings: 1,
    items: [{ food: 'celery', grams: 120 }, { food: 'peanut_butter', grams: 32 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(3, 1, 0, 2),
  },
  {
    id: 'cashews_clementine', name: 'Cashews + a clementine', slots: ['snack'], servings: 1,
    items: [{ food: 'cashews', grams: 25 }, { food: 'clementine', grams: 75 }],
    equipment: [], activeMin: 1, totalMin: 1, steps: 1, dopamine: d(3, 1, 1, 1),
  },
  {
    id: 'mango_yogurt', name: 'Mango Greek yogurt cup', slots: ['snack', 'breakfast'], servings: 1,
    items: [{ food: 'greek_yogurt', grams: 170 }, { food: 'mango', grams: 100 }, { food: 'flaxseed', grams: 5 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(0, 2, 1, 2),
  },
  {
    id: 'roasted_chickpeas', name: 'Crispy roasted chickpeas', slots: ['snack'], servings: 3,
    items: [{ food: 'chickpeas', grams: 250 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['airfryer'], alt: ['oven', 'sheetpan'], activeMin: 4, totalMin: 25, steps: 2, dopamine: d(3, 2, 2, 2), batch: true,
  },
  {
    id: 'kale_chips', name: 'Parmesan kale chips', slots: ['snack'], servings: 2,
    items: [{ food: 'kale', grams: 150 }, { food: 'olive_oil', grams: 10 }, { food: 'parmesan', grams: 10 }],
    equipment: ['oven', 'sheetpan'], alt: ['airfryer'], activeMin: 5, totalMin: 20, steps: 2, dopamine: d(3, 2, 3, 2),
  },
  {
    id: 'strawberries_cottage', name: 'Strawberries + cottage cheese', slots: ['snack'], servings: 1,
    items: [{ food: 'strawberries', grams: 150 }, { food: 'cottage_cheese', grams: 120 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(1, 1, 1, 2),
  },
  // ── Added: beets, citrus, pomegranate, ginger, pumpkin, squash, dates, couscous, coffee & tea ──
  {
    id: 'beet_goat_cheese_salad', name: 'Beet, arugula & goat cheese salad', slots: ['lunch', 'snack'], servings: 1,
    items: [{ food: 'beets', grams: 150 }, { food: 'arugula', grams: 50 }, { food: 'goat_cheese', grams: 30 }, { food: 'walnuts', grams: 15 }, { food: 'balsamic', grams: 15 }, { food: 'olive_oil', grams: 10 }],
    equipment: [], activeMin: 5, totalMin: 5, steps: 2, dopamine: d(2, 2, 2, 2),
  },
  {
    id: 'beet_berry_smoothie', name: 'Beet, berry & ginger smoothie', slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'beets', grams: 80 }, { food: 'berries', grams: 100 }, { food: 'banana', grams: 80 }, { food: 'greek_yogurt', grams: 150 }, { food: 'ginger', grams: 3 }],
    equipment: ['blender'], activeMin: 4, totalMin: 4, steps: 2, dopamine: d(0, 2, 3, 2),
  },
  {
    id: 'beet_quinoa_bowl', name: 'Beet & chickpea quinoa bowl', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'quinoa', grams: 150 }, { food: 'beets', grams: 240 }, { food: 'chickpeas', grams: 250 }, { food: 'arugula', grams: 80 }, { food: 'goat_cheese', grams: 60 }, { food: 'lemon', grams: 30 }, { food: 'olive_oil', grams: 20 }],
    equipment: ['stove', 'pot'], alt: ['ricecooker'], activeMin: 10, totalMin: 25, steps: 3, dopamine: d(2, 2, 3, 2), batch: true,
  },
  {
    id: 'orange_beet_salad', name: 'Orange & beet salad', slots: ['lunch', 'snack'], servings: 1,
    items: [{ food: 'beets', grams: 120 }, { food: 'orange', grams: 140 }, { food: 'arugula', grams: 40 }, { food: 'goat_cheese', grams: 20 }, { food: 'walnuts', grams: 10 }, { food: 'olive_oil', grams: 5 }],
    equipment: [], activeMin: 6, totalMin: 6, steps: 2, dopamine: d(2, 2, 3, 2),
  },
  {
    id: 'pomegranate_yogurt', name: 'Pomegranate crunch yogurt bowl', slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'greek_yogurt', grams: 200 }, { food: 'pomegranate', grams: 80 }, { food: 'pumpkin_seeds', grams: 10 }, { food: 'honey', grams: 5 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(3, 2, 2, 3),
  },
  {
    id: 'pomegranate_kale_salad', name: 'Kale, pomegranate & chickpea salad', slots: ['lunch'], servings: 1,
    items: [{ food: 'kale', grams: 80 }, { food: 'pomegranate', grams: 60 }, { food: 'chickpeas', grams: 100 }, { food: 'feta', grams: 20 }, { food: 'lemon', grams: 15 }, { food: 'olive_oil', grams: 10 }],
    equipment: [], activeMin: 8, totalMin: 8, steps: 2, dopamine: d(2, 2, 2, 2),
  },
  {
    id: 'grapefruit_chicken_salad', name: 'Grapefruit, avocado & chicken salad', slots: ['lunch'], servings: 1,
    items: [{ food: 'rotisserie', grams: 100 }, { food: 'grapefruit', grams: 150 }, { food: 'avocado', grams: 70 }, { food: 'arugula', grams: 40 }, { food: 'olive_oil', grams: 5 }],
    equipment: [], activeMin: 7, totalMin: 7, steps: 2, dopamine: d(2, 2, 3, 2),
  },
  {
    id: 'grapefruit_cottage', name: 'Grapefruit & cinnamon cottage cheese', slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'grapefruit', grams: 200 }, { food: 'cottage_cheese', grams: 150 }, { food: 'cinnamon', grams: 1 }],
    equipment: [], activeMin: 3, totalMin: 3, steps: 1, dopamine: d(0, 2, 2, 1),
  },
  {
    id: 'ginger_salmon', name: 'Ginger-lime salmon, brown rice & broccoli', slots: ['dinner'], servings: 2,
    items: [{ food: 'salmon', grams: 340 }, { food: 'brown_rice', grams: 150 }, { food: 'broccoli', grams: 300 }, { food: 'ginger', grams: 10 }, { food: 'soy_sauce', grams: 20 }, { food: 'lime', grams: 15 }, { food: 'garlic', grams: 5 }],
    equipment: ['oven', 'sheetpan', 'stove', 'pot'], alt: ['airfryer', 'ricecooker'], activeMin: 12, totalMin: 35, steps: 3, dopamine: d(1, 3, 2, 2),
  },
  {
    id: 'ginger_chicken_curry', name: 'Ginger chicken & spinach curry', slots: ['lunch', 'dinner'], servings: 4,
    items: [{ food: 'chicken_thigh', grams: 450 }, { food: 'coconut_milk', grams: 200 }, { food: 'canned_tomatoes', grams: 200 }, { food: 'spinach', grams: 100 }, { food: 'ginger', grams: 15 }, { food: 'garlic', grams: 8 }, { food: 'onion', grams: 100 }, { food: 'brown_rice', grams: 200 }],
    equipment: ['stove', 'skillet', 'pot'], alt: ['slowcooker', 'ricecooker'], activeMin: 20, totalMin: 45, steps: 4, dopamine: d(0, 3, 3, 1), batch: true,
  },
  {
    id: 'ginger_lime_shrimp', name: 'Ginger-lime shrimp stir-fry', slots: ['dinner'], servings: 3,
    items: [{ food: 'shrimp', grams: 340 }, { food: 'stirfry_veg', grams: 400 }, { food: 'ginger', grams: 10 }, { food: 'lime', grams: 20 }, { food: 'soy_sauce', grams: 20 }, { food: 'olive_oil', grams: 15 }, { food: 'brown_rice', grams: 150 }],
    equipment: ['stove', 'skillet', 'pot'], alt: ['ricecooker'], activeMin: 18, totalMin: 40, steps: 4, dopamine: d(1, 3, 2, 1),
  },
  {
    id: 'pumpkin_oats', name: 'Pumpkin pie oatmeal', slots: ['breakfast'], servings: 1,
    items: [{ food: 'oats', grams: 50 }, { food: 'pumpkin', grams: 80 }, { food: 'milk', grams: 200 }, { food: 'cinnamon', grams: 1 }, { food: 'pumpkin_seeds', grams: 10 }, { food: 'honey', grams: 5 }],
    equipment: ['microwave'], alt: ['stove', 'pot'], activeMin: 4, totalMin: 5, steps: 2, dopamine: d(1, 1, 2, 1),
  },
  {
    id: 'pumpkin_chili', name: 'Pumpkin turkey two-bean chili', slots: ['lunch', 'dinner'], servings: 6,
    items: [{ food: 'ground_turkey', grams: 454 }, { food: 'pumpkin', grams: 425 }, { food: 'kidney_beans', grams: 250 }, { food: 'pinto_beans', grams: 250 }, { food: 'canned_tomatoes', grams: 411 }, { food: 'onion', grams: 150 }, { food: 'cinnamon', grams: 1 }],
    equipment: ['slowcooker'], alt: ['stove', 'pot'], activeMin: 15, totalMin: 240, steps: 3, dopamine: d(0, 3, 2, 1), batch: true,
  },
  {
    id: 'pumpkin_parfait', name: 'Pumpkin spice yogurt cup', slots: ['snack'], servings: 1,
    items: [{ food: 'pumpkin', grams: 60 }, { food: 'greek_yogurt', grams: 170 }, { food: 'cinnamon', grams: 1 }, { food: 'walnuts', grams: 10 }, { food: 'honey', grams: 5 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(1, 1, 2, 1),
  },
  {
    id: 'squash_soup', name: 'Roasted butternut squash & ginger soup', slots: ['lunch', 'dinner'], servings: 4,
    items: [{ food: 'squash', grams: 800 }, { food: 'onion', grams: 150 }, { food: 'broth', grams: 700 }, { food: 'coconut_milk', grams: 150 }, { food: 'ginger', grams: 10 }, { food: 'olive_oil', grams: 15 }, { food: 'pumpkin_seeds', grams: 30 }],
    equipment: ['oven', 'sheetpan', 'stove', 'pot', 'blender'], alt: ['slowcooker', 'blender'], activeMin: 15, totalMin: 50, steps: 4, dopamine: d(1, 2, 2, 1), batch: true,
  },
  {
    id: 'squash_couscous_bowl', name: 'Butternut squash, chickpea & feta couscous', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'couscous', grams: 150 }, { food: 'squash', grams: 450 }, { food: 'chickpeas', grams: 250 }, { food: 'feta', grams: 45 }, { food: 'arugula', grams: 60 }, { food: 'olive_oil', grams: 20 }, { food: 'cinnamon', grams: 1 }],
    equipment: ['oven', 'sheetpan'], alt: ['airfryer'], activeMin: 12, totalMin: 35, steps: 3, dopamine: d(1, 2, 3, 2), batch: true,
  },
  {
    id: 'moroccan_chicken_couscous', name: 'Moroccan chicken with dates & couscous', slots: ['dinner'], servings: 4,
    items: [{ food: 'chicken_thigh', grams: 450 }, { food: 'couscous', grams: 180 }, { food: 'chickpeas', grams: 250 }, { food: 'dates', grams: 60 }, { food: 'onion', grams: 100 }, { food: 'cinnamon', grams: 2 }, { food: 'lemon', grams: 20 }, { food: 'broth', grams: 300 }, { food: 'olive_oil', grams: 15 }],
    equipment: ['stove', 'skillet', 'pot'], activeMin: 20, totalMin: 35, steps: 4, dopamine: d(1, 3, 3, 2),
  },
  {
    id: 'lemon_herb_couscous_salmon', name: 'Lemon-herb couscous with canned salmon', slots: ['lunch'], servings: 2,
    items: [{ food: 'couscous', grams: 100 }, { food: 'canned_salmon', grams: 200 }, { food: 'cucumber', grams: 150 }, { food: 'tomato', grams: 120 }, { food: 'cilantro', grams: 8 }, { food: 'lemon', grams: 20 }, { food: 'olive_oil', grams: 15 }],
    equipment: ['microwave'], alt: ['stove', 'pot'], activeMin: 10, totalMin: 12, steps: 3, dopamine: d(2, 2, 2, 1),
  },
  {
    id: 'date_pb_bites', name: 'Date, oat & peanut butter bites', slots: ['snack'], servings: 6,
    items: [{ food: 'dates', grams: 150 }, { food: 'oats', grams: 90 }, { food: 'peanut_butter', grams: 80 }, { food: 'cinnamon', grams: 1 }, { food: 'flaxseed', grams: 15 }],
    equipment: ['blender'], activeMin: 10, totalMin: 15, steps: 3, dopamine: d(1, 2, 2, 3), batch: true,
    note: 'Makes about 12 bites; a serving is 2. Keeps a week in the fridge.',
  },
  {
    id: 'dates_almonds', name: 'Dates + almonds', slots: ['snack'], servings: 1,
    items: [{ food: 'dates', grams: 30 }, { food: 'almonds', grams: 20 }],
    equipment: [], activeMin: 1, totalMin: 1, steps: 1, dopamine: d(2, 2, 1, 2),
  },
  {
    id: 'kombucha_snack', name: 'Kombucha + roasted chickpeas', slots: ['snack'], servings: 1,
    items: [{ food: 'kombucha', grams: 240 }, { food: 'chickpeas', grams: 80 }, { food: 'olive_oil', grams: 5 }],
    equipment: ['airfryer'], alt: ['oven', 'sheetpan'], activeMin: 3, totalMin: 20, steps: 2, dopamine: d(3, 2, 2, 2),
  },
  {
    id: 'cilantro_lime_bowl', name: 'Cilantro-lime brown rice & black bean bowl', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'brown_rice', grams: 150 }, { food: 'black_beans', grams: 250 }, { food: 'lime', grams: 20 }, { food: 'cilantro', grams: 10 }, { food: 'corn', grams: 150 }, { food: 'avocado', grams: 70 }, { food: 'salsa', grams: 60 }],
    equipment: ['stove', 'pot'], alt: ['ricecooker'], activeMin: 10, totalMin: 40, steps: 3, dopamine: d(1, 3, 2, 3), batch: true,
  },
  {
    id: 'lime_chicken_tacos', name: 'Cilantro-lime chicken tacos', slots: ['dinner'], servings: 4,
    items: [{ food: 'chicken_thigh', grams: 450 }, { food: 'corn_tortillas', grams: 240 }, { food: 'cabbage', grams: 150 }, { food: 'lime', grams: 30 }, { food: 'cilantro', grams: 15 }, { food: 'greek_yogurt', grams: 60 }],
    equipment: ['stove', 'skillet'], alt: ['airfryer'], activeMin: 18, totalMin: 25, steps: 4, dopamine: d(2, 3, 2, 3),
  },
  {
    id: 'cinnamon_sweet_potato_bowl', name: 'Cinnamon sweet potato & pinto bean bowl', slots: ['lunch', 'dinner'], servings: 1,
    items: [{ food: 'sweet_potato', grams: 250 }, { food: 'pinto_beans', grams: 125 }, { food: 'cinnamon', grams: 1 }, { food: 'greek_yogurt', grams: 50 }, { food: 'pumpkin_seeds', grams: 10 }, { food: 'olive_oil', grams: 5 }],
    equipment: ['microwave'], alt: ['oven', 'sheetpan'], activeMin: 5, totalMin: 12, steps: 3, dopamine: d(1, 2, 2, 2),
  },
  {
    id: 'quinoa_breakfast', name: 'Cinnamon quinoa breakfast bowl', slots: ['breakfast'], servings: 1,
    items: [{ food: 'quinoa', grams: 45 }, { food: 'milk', grams: 200 }, { food: 'berries', grams: 75 }, { food: 'cinnamon', grams: 1 }, { food: 'almonds', grams: 15 }],
    equipment: ['stove', 'pot'], activeMin: 5, totalMin: 20, steps: 2, dopamine: d(1, 1, 2, 1),
  },
  {
    id: 'choc_pomegranate_bark', name: 'Dark chocolate pomegranate bark', slots: ['snack'], servings: 4,
    items: [{ food: 'dark_chocolate', grams: 80 }, { food: 'pomegranate', grams: 120 }, { food: 'pumpkin_seeds', grams: 20 }],
    equipment: ['microwave'], activeMin: 8, totalMin: 40, steps: 3, dopamine: d(3, 3, 3, 3), batch: true,
  },
  {
    id: 'coffee_banana_smoothie', name: 'Coffee banana protein smoothie', slots: ['breakfast'], servings: 1,
    items: [{ food: 'coffee', grams: 150 }, { food: 'banana', grams: 100 }, { food: 'milk', grams: 150 }, { food: 'peanut_butter', grams: 16 }, { food: 'protein_powder', grams: 20 }, { food: 'cinnamon', grams: 1 }],
    equipment: ['blender'], activeMin: 4, totalMin: 4, steps: 2, dopamine: d(0, 2, 2, 2),
    note: 'About 60 mg caffeine. Brew the coffee ahead and chill it.',
  },
  {
    id: 'mocha_overnight_oats', name: 'Mocha overnight oats', slots: ['breakfast'], servings: 1,
    items: [{ food: 'oats', grams: 50 }, { food: 'coffee', grams: 100 }, { food: 'milk', grams: 100 }, { food: 'greek_yogurt', grams: 80 }, { food: 'dark_chocolate', grams: 10 }, { food: 'chia', grams: 10 }],
    equipment: [], activeMin: 4, totalMin: 4, steps: 2, dopamine: d(0, 2, 2, 2), batch: true,
    note: 'About 50 mg caffeine. Make the night before.',
  },
  {
    id: 'coffee_pb_toast', name: 'Café au lait & peanut butter toast', slots: ['breakfast'], servings: 1,
    items: [{ food: 'coffee', grams: 240 }, { food: 'milk', grams: 60 }, { food: 'bread', grams: 64 }, { food: 'peanut_butter', grams: 24 }],
    equipment: [], activeMin: 4, totalMin: 4, steps: 2, dopamine: d(1, 1, 0, 1),
    note: 'About 95 mg caffeine in one 8-oz cup.',
  },
  {
    id: 'green_tea_smoothie', name: 'Green tea, mango & ginger smoothie', slots: ['breakfast'], servings: 1,
    items: [{ food: 'green_tea', grams: 150 }, { food: 'mango', grams: 120 }, { food: 'spinach', grams: 30 }, { food: 'greek_yogurt', grams: 120 }, { food: 'ginger', grams: 3 }, { food: 'lime', grams: 5 }],
    equipment: ['blender'], activeMin: 4, totalMin: 4, steps: 2, dopamine: d(0, 2, 3, 2),
    note: 'About 18 mg caffeine. Brew the tea ahead and chill it.',
  },
  // ── Diet-friendly: AIP, paleo, keto, vegan, pescatarian ─────────
  {
    id: 'aip_turkey_hash', name: 'Turkey, sweet potato & spinach hash', slots: ['breakfast', 'lunch'], servings: 1,
    items: [{ food: 'ground_turkey', grams: 120 }, { food: 'sweet_potato', grams: 180 }, { food: 'spinach', grams: 40 }, { food: 'onion', grams: 50 }, { food: 'coconut_oil', grams: 8 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 20, steps: 3, dopamine: d(1, 1, 1, 1),
  },
  {
    id: 'bacon_sweet_potato_plate', name: 'Bacon, sweet potato & avocado plate', slots: ['breakfast'], servings: 1,
    items: [{ food: 'bacon', grams: 30 }, { food: 'sweet_potato', grams: 200 }, { food: 'avocado', grams: 70 }],
    equipment: ['microwave', 'stove', 'skillet'], alt: ['oven', 'sheetpan'], activeMin: 8, totalMin: 15, steps: 3, dopamine: d(2, 2, 1, 2),
  },
  {
    id: 'salmon_avocado_plate', name: 'Salmon, avocado & sauerkraut plate', slots: ['breakfast', 'lunch'], servings: 1,
    items: [{ food: 'canned_salmon', grams: 100 }, { food: 'avocado', grams: 70 }, { food: 'cucumber', grams: 100 }, { food: 'sauerkraut', grams: 40 }, { food: 'olive_oil', grams: 5 }],
    equipment: [], activeMin: 5, totalMin: 5, steps: 2, dopamine: d(1, 2, 2, 1),
    note: 'No cooking. Canned salmon with the soft bones adds calcium.',
  },
  {
    id: 'apple_turkey_patties', name: 'Apple-cinnamon turkey patties & roasted sweet potato', slots: ['breakfast'], servings: 4,
    items: [{ food: 'ground_turkey', grams: 450 }, { food: 'apple', grams: 200 }, { food: 'sweet_potato', grams: 600 }, { food: 'coconut_oil', grams: 15 }, { food: 'cinnamon', grams: 2 }],
    equipment: ['oven', 'sheetpan'], activeMin: 20, totalMin: 40, steps: 4, dopamine: d(1, 2, 2, 2), batch: true,
    note: 'Bake once, reheat all week.',
  },
  {
    id: 'chicken_berry_plate', name: 'Chicken, avocado & strawberry plate', slots: ['breakfast', 'lunch'], servings: 1,
    items: [{ food: 'rotisserie', grams: 110 }, { food: 'avocado', grams: 60 }, { food: 'strawberries', grams: 120 }, { food: 'arugula', grams: 30 }, { food: 'olive_oil', grams: 5 }],
    equipment: [], activeMin: 5, totalMin: 5, steps: 2, dopamine: d(1, 1, 2, 2),
  },
  {
    id: 'bacon_brussels_hash', name: 'Bacon & Brussels sprout hash', slots: ['breakfast', 'lunch'], servings: 1,
    items: [{ food: 'bacon', grams: 40 }, { food: 'brussels', grams: 150 }, { food: 'sweet_potato', grams: 120 }, { food: 'onion', grams: 40 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 20, steps: 3, dopamine: d(3, 3, 2, 1),
  },
  {
    id: 'veggie_frittata', name: 'Spinach & mushroom frittata', slots: ['breakfast', 'lunch'], servings: 4,
    items: [{ food: 'egg', grams: 600 }, { food: 'spinach', grams: 100 }, { food: 'mushrooms', grams: 150 }, { food: 'bell_pepper', grams: 100 }, { food: 'onion', grams: 80 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['stove', 'skillet', 'oven'], activeMin: 15, totalMin: 35, steps: 4, dopamine: d(0, 1, 1, 1), batch: true,
    note: 'Cut into 4 wedges; keeps 4 days in the fridge.',
  },
  {
    id: 'eggs_sweet_potato', name: 'Eggs, sweet potato & avocado', slots: ['breakfast'], servings: 1,
    items: [{ food: 'egg', grams: 150 }, { food: 'sweet_potato', grams: 200 }, { food: 'avocado', grams: 50 }, { food: 'olive_oil', grams: 5 }],
    equipment: ['microwave', 'stove', 'skillet'], activeMin: 8, totalMin: 12, steps: 3, dopamine: d(1, 1, 1, 1),
  },
  {
    id: 'almond_banana_smoothie', name: 'Almond butter banana smoothie', slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'almond_milk', grams: 250 }, { food: 'banana', grams: 100 }, { food: 'almond_butter', grams: 32 }, { food: 'spinach', grams: 30 }, { food: 'hemp_seeds', grams: 20 }],
    equipment: ['blender'], activeMin: 4, totalMin: 4, steps: 2, dopamine: d(0, 1, 1, 2),
  },
  {
    id: 'bacon_eggs_avocado', name: 'Bacon, eggs & avocado', slots: ['breakfast'], servings: 1,
    items: [{ food: 'egg', grams: 150 }, { food: 'bacon', grams: 30 }, { food: 'avocado', grams: 70 }, { food: 'spinach', grams: 30 }],
    equipment: ['stove', 'skillet'], activeMin: 10, totalMin: 12, steps: 3, dopamine: d(2, 2, 0, 1),
  },
  {
    id: 'coconut_chia_pudding', name: 'Coconut chia pudding', slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'chia', grams: 30 }, { food: 'coconut_milk', grams: 200 }, { food: 'berries', grams: 40 }, { food: 'hemp_seeds', grams: 15 }],
    equipment: [], activeMin: 3, totalMin: 3, steps: 2, dopamine: d(1, 1, 2, 2), batch: true,
    note: 'Make it the night before.',
  },
  {
    id: 'keto_yogurt_bowl', name: 'Greek yogurt, nut & berry bowl', slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'greek_yogurt', grams: 170 }, { food: 'walnuts', grams: 20 }, { food: 'pecans', grams: 15 }, { food: 'berries', grams: 30 }, { food: 'chia', grams: 10 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(3, 1, 1, 1),
  },
  {
    id: 'salmon_cucumber_rollups', name: 'Salmon & cream cheese cucumber bites', slots: ['breakfast', 'lunch', 'snack'], servings: 1,
    items: [{ food: 'canned_salmon', grams: 100 }, { food: 'cream_cheese', grams: 30 }, { food: 'cucumber', grams: 150 }, { food: 'lemon', grams: 5 }],
    equipment: [], activeMin: 6, totalMin: 6, steps: 2, dopamine: d(2, 2, 2, 3),
  },
  {
    id: 'tofu_scramble', name: 'Tofu scramble with spinach & mushrooms', slots: ['breakfast', 'lunch'], servings: 1,
    items: [{ food: 'tofu', grams: 200 }, { food: 'spinach', grams: 40 }, { food: 'mushrooms', grams: 60 }, { food: 'onion', grams: 30 }, { food: 'nutritional_yeast', grams: 8 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['stove', 'skillet'], activeMin: 10, totalMin: 12, steps: 3, dopamine: d(0, 2, 2, 1),
    note: 'Nutritional yeast gives a cheesy flavor and (if fortified) vitamin B12.',
  },
  {
    id: 'vegan_overnight_oats', name: 'Vegan overnight oats', slots: ['breakfast'], servings: 1,
    items: [{ food: 'oats', grams: 50 }, { food: 'soy_milk', grams: 150 }, { food: 'soy_yogurt', grams: 100 }, { food: 'chia', grams: 10 }, { food: 'berries', grams: 75 }, { food: 'walnuts', grams: 10 }],
    equipment: [], activeMin: 4, totalMin: 4, steps: 2, dopamine: d(1, 1, 1, 1), batch: true,
  },
  {
    id: 'vegan_pb_oatmeal', name: 'Peanut butter banana oatmeal (soy milk)', slots: ['breakfast'], servings: 1,
    items: [{ food: 'oats', grams: 50 }, { food: 'soy_milk', grams: 250 }, { food: 'peanut_butter', grams: 20 }, { food: 'banana', grams: 60 }, { food: 'hemp_seeds', grams: 10 }],
    equipment: ['microwave'], activeMin: 4, totalMin: 5, steps: 2, dopamine: d(1, 1, 0, 1),
  },
  {
    id: 'chickpea_avocado_toast', name: 'Smashed chickpea avocado toast', slots: ['breakfast', 'lunch'], servings: 1,
    items: [{ food: 'bread', grams: 64 }, { food: 'avocado', grams: 70 }, { food: 'chickpeas', grams: 80 }, { food: 'lemon', grams: 5 }, { food: 'hemp_seeds', grams: 10 }],
    equipment: [], activeMin: 5, totalMin: 5, steps: 2, dopamine: d(2, 2, 2, 2),
  },
  {
    id: 'tempeh_hash', name: 'Tempeh & sweet potato hash', slots: ['breakfast', 'lunch'], servings: 1,
    items: [{ food: 'tempeh', grams: 100 }, { food: 'sweet_potato', grams: 150 }, { food: 'spinach', grams: 40 }, { food: 'onion', grams: 50 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 20, steps: 3, dopamine: d(2, 2, 2, 1),
  },
  {
    id: 'soy_yogurt_bowl', name: 'Soy yogurt, berry & hemp bowl', slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'soy_yogurt', grams: 170 }, { food: 'berries', grams: 60 }, { food: 'hemp_seeds', grams: 10 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(1, 1, 1, 1),
  },

  // Lunch & dinner
  {
    id: 'tofu_veg_curry', name: 'Tofu & spinach coconut curry', slots: ['lunch', 'dinner'], servings: 4,
    items: [{ food: 'tofu', grams: 400 }, { food: 'coconut_milk', grams: 400 }, { food: 'canned_tomatoes', grams: 400 }, { food: 'spinach', grams: 150 }, { food: 'onion', grams: 150 }, { food: 'garlic', grams: 10 }, { food: 'ginger', grams: 10 }, { food: 'brown_rice', grams: 180 }],
    equipment: ['stove', 'pot'], activeMin: 20, totalMin: 45, steps: 4, dopamine: d(0, 3, 2, 1), batch: true,
  },
  {
    id: 'chickpea_spinach_curry', name: 'Chickpea & spinach curry', slots: ['lunch', 'dinner'], servings: 4,
    items: [{ food: 'chickpeas', grams: 500 }, { food: 'coconut_milk', grams: 400 }, { food: 'canned_tomatoes', grams: 400 }, { food: 'spinach', grams: 150 }, { food: 'onion', grams: 150 }, { food: 'garlic', grams: 10 }, { food: 'ginger', grams: 10 }, { food: 'brown_rice', grams: 200 }],
    equipment: ['stove', 'pot'], alt: ['slowcooker', 'ricecooker'], activeMin: 15, totalMin: 45, steps: 4, dopamine: d(0, 3, 2, 1), batch: true,
  },
  {
    id: 'tempeh_stirfry', name: 'Ginger tempeh stir-fry', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'tempeh', grams: 227 }, { food: 'stirfry_veg', grams: 400 }, { food: 'soy_sauce', grams: 20 }, { food: 'brown_rice', grams: 150 }, { food: 'olive_oil', grams: 15 }, { food: 'ginger', grams: 5 }, { food: 'garlic', grams: 6 }],
    equipment: ['stove', 'skillet', 'pot'], activeMin: 20, totalMin: 45, steps: 4, dopamine: d(2, 3, 2, 1),
  },
  {
    id: 'lentil_bolognese', name: 'Lentil bolognese with whole-wheat pasta', slots: ['lunch', 'dinner'], servings: 4,
    items: [{ food: 'lentils', grams: 200 }, { food: 'marinara', grams: 680 }, { food: 'onion', grams: 150 }, { food: 'carrots', grams: 150 }, { food: 'ww_pasta', grams: 320 }, { food: 'nutritional_yeast', grams: 16 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['stove', 'pot'], activeMin: 20, totalMin: 40, steps: 4, dopamine: d(0, 2, 1, 1), batch: true,
  },
  {
    id: 'sweet_potato_bean_tacos', name: 'Roasted sweet potato & black bean tacos', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'black_beans', grams: 250 }, { food: 'sweet_potato', grams: 400 }, { food: 'corn_tortillas', grams: 200 }, { food: 'avocado', grams: 140 }, { food: 'salsa', grams: 120 }, { food: 'lime', grams: 15 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['oven', 'sheetpan'], alt: ['microwave'], activeMin: 15, totalMin: 35, steps: 4, dopamine: d(2, 3, 2, 3),
  },
  {
    id: 'tahini_buddha_bowl', name: 'Quinoa buddha bowl with lemon tahini', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'quinoa', grams: 90 }, { food: 'chickpeas', grams: 240 }, { food: 'kale', grams: 120 }, { food: 'sweet_potato', grams: 300 }, { food: 'tahini', grams: 30 }, { food: 'lemon', grams: 20 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['oven', 'sheetpan', 'stove', 'pot'], activeMin: 20, totalMin: 35, steps: 4, dopamine: d(2, 2, 3, 2), batch: true,
  },
  {
    id: 'peanut_tofu_bowl', name: 'Peanut tofu rice bowl', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'tofu', grams: 300 }, { food: 'brown_rice', grams: 140 }, { food: 'edamame', grams: 150 }, { food: 'carrots', grams: 100 }, { food: 'cucumber', grams: 150 }, { food: 'peanut_butter', grams: 40 }, { food: 'soy_sauce', grams: 20 }, { food: 'lime', grams: 15 }],
    equipment: ['stove', 'skillet', 'pot'], activeMin: 20, totalMin: 45, steps: 4, dopamine: d(2, 3, 2, 2),
  },
  {
    id: 'vegan_chili', name: 'Three-bean vegan chili', slots: ['lunch', 'dinner'], servings: 5,
    items: [{ food: 'kidney_beans', grams: 500 }, { food: 'black_beans', grams: 250 }, { food: 'canned_tomatoes', grams: 800 }, { food: 'onion', grams: 150 }, { food: 'bell_pepper', grams: 200 }, { food: 'corn', grams: 150 }, { food: 'veg_broth', grams: 240 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['stove', 'pot'], alt: ['slowcooker'], activeMin: 15, totalMin: 45, steps: 3, dopamine: d(0, 3, 1, 1), batch: true,
  },
  {
    id: 'hummus_tempeh_wrap', name: 'Hummus & tempeh wrap', slots: ['lunch'], servings: 1,
    items: [{ food: 'tortillas', grams: 90 }, { food: 'hummus', grams: 60 }, { food: 'tempeh', grams: 85 }, { food: 'spinach', grams: 30 }, { food: 'cucumber', grams: 60 }],
    equipment: ['microwave'], activeMin: 6, totalMin: 7, steps: 3, dopamine: d(1, 2, 2, 2),
  },
  {
    id: 'salmon_asparagus', name: 'Lemon-garlic salmon & asparagus', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'salmon', grams: 300 }, { food: 'asparagus', grams: 300 }, { food: 'olive_oil', grams: 15 }, { food: 'lemon', grams: 15 }, { food: 'garlic', grams: 6 }],
    equipment: ['oven', 'sheetpan'], alt: ['airfryer'], activeMin: 8, totalMin: 20, steps: 3, dopamine: d(1, 2, 1, 1),
  },
  {
    id: 'lemon_chicken_broccoli', name: 'Lemon-garlic chicken thighs & broccoli', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'chicken_thigh', grams: 450 }, { food: 'broccoli', grams: 340 }, { food: 'olive_oil', grams: 15 }, { food: 'lemon', grams: 20 }, { food: 'garlic', grams: 10 }],
    equipment: ['oven', 'sheetpan'], alt: ['airfryer'], activeMin: 10, totalMin: 35, steps: 3, dopamine: d(1, 2, 1, 1), batch: true,
  },
  {
    id: 'burger_bowl', name: 'Cheeseburger lettuce bowl', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'ground_beef', grams: 450 }, { food: 'romaine', grams: 200 }, { food: 'cheddar', grams: 60 }, { food: 'pickles', grams: 60 }, { food: 'tomato', grams: 120 }, { food: 'avocado', grams: 140 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 15, steps: 3, dopamine: d(2, 3, 1, 3), batch: true,
  },
  {
    id: 'garlic_shrimp_zoodles', name: 'Garlic shrimp zucchini noodles', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'shrimp', grams: 300 }, { food: 'zucchini', grams: 400 }, { food: 'olive_oil', grams: 20 }, { food: 'garlic', grams: 10 }, { food: 'parmesan', grams: 20 }, { food: 'lemon', grams: 10 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 15, steps: 3, dopamine: d(1, 3, 2, 2),
  },
  {
    id: 'steak_cauli_mash', name: 'Steak, garlic cauliflower mash & spinach', slots: ['dinner'], servings: 2,
    items: [{ food: 'sirloin', grams: 340 }, { food: 'cauliflower', grams: 340 }, { food: 'butter', grams: 20 }, { food: 'garlic', grams: 6 }, { food: 'spinach', grams: 100 }],
    equipment: ['stove', 'skillet', 'microwave'], activeMin: 20, totalMin: 25, steps: 4, dopamine: d(1, 2, 1, 1),
  },
  {
    id: 'egg_roll_bowl', name: 'Egg roll in a bowl', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'ground_turkey', grams: 450 }, { food: 'cabbage', grams: 450 }, { food: 'carrots', grams: 60 }, { food: 'soy_sauce', grams: 30 }, { food: 'ginger', grams: 6 }, { food: 'garlic', grams: 6 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 20, steps: 3, dopamine: d(2, 3, 2, 1), batch: true,
  },
  {
    id: 'tuna_lettuce_cups', name: 'Tuna avocado lettuce cups', slots: ['lunch'], servings: 1,
    items: [{ food: 'tuna', grams: 142 }, { food: 'avocado', grams: 100 }, { food: 'celery', grams: 60 }, { food: 'lemon', grams: 10 }, { food: 'olive_oil', grams: 5 }, { food: 'romaine', grams: 80 }],
    equipment: [], activeMin: 6, totalMin: 6, steps: 2, dopamine: d(3, 1, 1, 3),
  },
  {
    id: 'mackerel_salad', name: 'Mackerel, olive & arugula salad', slots: ['lunch', 'dinner'], servings: 1,
    items: [{ food: 'canned_mackerel', grams: 125 }, { food: 'arugula', grams: 60 }, { food: 'cucumber', grams: 100 }, { food: 'olives', grams: 30 }, { food: 'olive_oil', grams: 10 }, { food: 'lemon', grams: 10 }],
    equipment: [], activeMin: 5, totalMin: 5, steps: 2, dopamine: d(1, 3, 2, 1),
  },
  {
    id: 'chicken_brussels_bacon', name: 'Sheet-pan chicken, Brussels sprouts & bacon', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'chicken_thigh', grams: 450 }, { food: 'brussels', grams: 450 }, { food: 'bacon', grams: 60 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['oven', 'sheetpan'], activeMin: 10, totalMin: 35, steps: 3, dopamine: d(3, 3, 1, 1), batch: true,
  },
  {
    id: 'beef_sweet_potato_skillet', name: 'Beef, sweet potato & kale skillet', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'ground_beef', grams: 450 }, { food: 'sweet_potato', grams: 400 }, { food: 'kale', grams: 150 }, { food: 'onion', grams: 100 }, { food: 'olive_oil', grams: 10 }, { food: 'garlic', grams: 6 }],
    equipment: ['stove', 'skillet'], activeMin: 20, totalMin: 30, steps: 3, dopamine: d(1, 2, 1, 1), batch: true,
  },
  {
    id: 'aip_chicken_soup', name: 'Chicken & vegetable soup (no noodles)', slots: ['lunch', 'dinner'], servings: 5,
    items: [{ food: 'chicken_breast', grams: 450 }, { food: 'carrots', grams: 200 }, { food: 'celery', grams: 150 }, { food: 'onion', grams: 150 }, { food: 'zucchini', grams: 200 }, { food: 'broth', grams: 1500 }, { food: 'garlic', grams: 10 }],
    equipment: ['stove', 'pot'], alt: ['slowcooker'], activeMin: 15, totalMin: 45, steps: 3, dopamine: d(0, 1, 0, 0), batch: true,
  },
  {
    id: 'pork_plantains', name: 'Roast pork, plantains & lime cabbage', slots: ['dinner'], servings: 3,
    items: [{ food: 'pork_loin', grams: 450 }, { food: 'plantains', grams: 400 }, { food: 'cabbage', grams: 300 }, { food: 'coconut_oil', grams: 15 }, { food: 'lime', grams: 15 }, { food: 'garlic', grams: 6 }],
    equipment: ['oven', 'sheetpan'], activeMin: 15, totalMin: 40, steps: 4, dopamine: d(2, 2, 3, 2),
  },
  {
    id: 'coconut_squash_curry', name: 'Coconut chicken & squash curry (nightshade-free)', slots: ['lunch', 'dinner'], servings: 4,
    items: [{ food: 'chicken_thigh', grams: 450 }, { food: 'coconut_milk', grams: 400 }, { food: 'squash', grams: 400 }, { food: 'spinach', grams: 100 }, { food: 'ginger', grams: 10 }, { food: 'garlic', grams: 10 }, { food: 'onion', grams: 100 }],
    equipment: ['stove', 'pot'], alt: ['slowcooker'], activeMin: 15, totalMin: 40, steps: 3, dopamine: d(0, 2, 2, 1), batch: true,
  },
  {
    id: 'shrimp_cauli_rice', name: 'Ginger shrimp & cauliflower rice', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'shrimp', grams: 300 }, { food: 'cauliflower', grams: 340 }, { food: 'zucchini', grams: 200 }, { food: 'coconut_aminos', grams: 20 }, { food: 'garlic', grams: 6 }, { food: 'ginger', grams: 5 }, { food: 'olive_oil', grams: 15 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 20, steps: 3, dopamine: d(1, 2, 2, 1),
  },
  {
    id: 'trout_beets_arugula', name: 'Roast trout with beets & arugula', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'trout', grams: 300 }, { food: 'beets', grams: 250 }, { food: 'arugula', grams: 100 }, { food: 'olive_oil', grams: 15 }, { food: 'balsamic', grams: 10 }, { food: 'lemon', grams: 10 }],
    equipment: ['oven', 'sheetpan'], alt: ['airfryer'], activeMin: 8, totalMin: 20, steps: 3, dopamine: d(1, 2, 3, 2),
  },

  // Snacks
  {
    id: 'apple_coconut', name: 'Apple slices & coconut flakes', slots: ['snack'], servings: 1,
    items: [{ food: 'apple', grams: 150 }, { food: 'coconut_flakes', grams: 15 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(3, 1, 1, 2),
  },
  {
    id: 'plantain_chips_guac', name: 'Baked plantain chips & guacamole', slots: ['snack'], servings: 2,
    items: [{ food: 'plantains', grams: 300 }, { food: 'avocado', grams: 140 }, { food: 'lime', grams: 10 }, { food: 'coconut_oil', grams: 15 }],
    equipment: ['oven', 'sheetpan'], alt: ['airfryer'], activeMin: 10, totalMin: 30, steps: 3, dopamine: d(3, 2, 3, 3),
  },
  {
    id: 'olives_veggies', name: 'Olives with cucumber & carrots', slots: ['snack'], servings: 1,
    items: [{ food: 'olives', grams: 40 }, { food: 'cucumber', grams: 150 }, { food: 'carrots', grams: 80 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(3, 2, 1, 2),
  },
  {
    id: 'berries_coconut_cream', name: 'Berries with coconut cream', slots: ['snack'], servings: 1,
    items: [{ food: 'berries', grams: 120 }, { food: 'coconut_milk', grams: 100 }, { food: 'coconut_flakes', grams: 10 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(1, 1, 1, 2),
  },
  {
    id: 'sardine_cucumber_bites', name: 'Sardines on cucumber rounds', slots: ['snack', 'lunch'], servings: 1,
    items: [{ food: 'sardines', grams: 106 }, { food: 'cucumber', grams: 150 }, { food: 'lemon', grams: 5 }],
    equipment: [], activeMin: 4, totalMin: 4, steps: 2, dopamine: d(2, 3, 2, 2),
  },
  {
    id: 'mango_coconut', name: 'Mango with coconut & lime', slots: ['snack'], servings: 1,
    items: [{ food: 'mango', grams: 120 }, { food: 'coconut_flakes', grams: 10 }, { food: 'lime', grams: 5 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(1, 2, 2, 2),
  },
  {
    id: 'chicken_avocado_bites', name: 'Chicken & avocado bites', slots: ['snack'], servings: 1,
    items: [{ food: 'rotisserie', grams: 60 }, { food: 'avocado', grams: 50 }, { food: 'lime', grams: 5 }],
    equipment: [], activeMin: 3, totalMin: 3, steps: 1, dopamine: d(0, 1, 1, 2),
  },
  {
    id: 'cheese_olives', name: 'Mozzarella & olives', slots: ['snack'], servings: 1,
    items: [{ food: 'mozzarella', grams: 40 }, { food: 'olives', grams: 30 }],
    equipment: [], activeMin: 1, totalMin: 1, steps: 1, dopamine: d(1, 2, 1, 1),
  },
  {
    id: 'celery_cream_cheese', name: 'Celery & cream cheese', slots: ['snack'], servings: 1,
    items: [{ food: 'celery', grams: 100 }, { food: 'cream_cheese', grams: 30 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(3, 1, 0, 2),
  },
  {
    id: 'brazil_pecan_mix', name: 'Brazil nut & pecan mix', slots: ['snack'], servings: 1,
    items: [{ food: 'brazil_nuts', grams: 5 }, { food: 'pecans', grams: 20 }, { food: 'coconut_flakes', grams: 5 }],
    equipment: [], activeMin: 1, totalMin: 1, steps: 1, dopamine: d(3, 1, 1, 1),
    note: 'One Brazil nut has about 95 µg selenium; stick to one or two a day (upper limit 400 µg).',
  },
  {
    id: 'tuscan_chicken', name: 'Creamy Tuscan chicken with spinach', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'chicken_thigh', grams: 450 }, { food: 'heavy_cream', grams: 120 }, { food: 'spinach', grams: 100 }, { food: 'parmesan', grams: 30 }, { food: 'tomato', grams: 100 }, { food: 'garlic', grams: 6 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['stove', 'skillet'], activeMin: 20, totalMin: 25, steps: 4, dopamine: d(0, 3, 2, 1), batch: true,
  },
  {
    id: 'salmon_avocado_salsa', name: 'Salmon with avocado-cucumber salsa', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'salmon', grams: 300 }, { food: 'avocado', grams: 140 }, { food: 'cucumber', grams: 100 }, { food: 'olive_oil', grams: 15 }, { food: 'lime', grams: 15 }, { food: 'cilantro', grams: 10 }],
    equipment: ['oven', 'sheetpan'], alt: ['airfryer'], activeMin: 10, totalMin: 22, steps: 3, dopamine: d(1, 3, 2, 2),
  },
  {
    id: 'cream_cheese_eggs', name: 'Creamy scrambled eggs with avocado', slots: ['breakfast'], servings: 1,
    items: [{ food: 'egg', grams: 150 }, { food: 'cream_cheese', grams: 30 }, { food: 'butter', grams: 10 }, { food: 'avocado', grams: 70 }, { food: 'spinach', grams: 30 }],
    equipment: ['stove', 'skillet'], activeMin: 8, totalMin: 8, steps: 3, dopamine: d(0, 2, 1, 1),
  },
  {
    id: 'cheese_almond_plate', name: 'Cheddar & almonds', slots: ['snack'], servings: 1,
    items: [{ food: 'cheddar', grams: 30 }, { food: 'almonds', grams: 30 }],
    equipment: [], activeMin: 1, totalMin: 1, steps: 1, dopamine: d(3, 2, 0, 1),
  },
  {
    id: 'avocado_hemp_snack', name: 'Avocado with olive oil & hemp seeds', slots: ['snack', 'breakfast'], servings: 1,
    items: [{ food: 'avocado', grams: 140 }, { food: 'olive_oil', grams: 10 }, { food: 'hemp_seeds', grams: 15 }],
    equipment: [], activeMin: 2, totalMin: 2, steps: 1, dopamine: d(1, 1, 1, 1),
  },
  {
    id: 'pecan_dark_choc', name: 'Pecans & dark chocolate', slots: ['snack'], servings: 1,
    items: [{ food: 'pecans', grams: 30 }, { food: 'dark_chocolate', grams: 15 }],
    equipment: [], activeMin: 1, totalMin: 1, steps: 1, dopamine: d(3, 2, 1, 2),
  },
]

export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]))

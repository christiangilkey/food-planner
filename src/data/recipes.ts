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
]

export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]))

// Chicken, turkey, pork and beef mains.
// Each recipe is original: inspired by well-loved dishes, written in this app's own words.
// Ingredient grams are for the whole recipe; one plan entry is one serving.
import type { Recipe } from '../../types'

const d = (crunch: number, flavor: number, novelty: number, fun: number) => ({ crunch, flavor, novelty, fun })

export const RECIPES_MEAT: Recipe[] = [
  // ── Chicken ───────────────────────────────────────────────
  // Inspired by: sticky gochujang thigh recipes (Foodess, Eat With Carmen) and Budget Bytes' sticky ginger-soy chicken,
  // where the marinade reduces into the glaze; Korean smashed-cucumber side dishes for cold crunch.
  {
    id: 'gochujang_chicken_thighs', name: 'Sticky gochujang-style chicken thighs with smashed cucumbers', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'chicken_thigh', grams: 454 }, { food: 'white_rice', grams: 180 }, { food: 'cucumber', grams: 300 }, { food: 'broccoli', grams: 340 }, { food: 'soy_sauce', grams: 25 }, { food: 'honey', grams: 30 }, { food: 'garlic', grams: 9 }, { food: 'ginger', grams: 10 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['stove', 'skillet', 'ricecooker'], alt: ['stove', 'skillet', 'pot'], activeMin: 20, totalMin: 30, steps: 5, dopamine: d(2, 3, 2, 3), batch: true,
    note: 'No gochujang needed: sriracha, smoked paprika and honey get close. Pack the cucumbers separately.',
  },
  // Inspired by: sheet-pan shawarma traybakes (BBC Good Food Middle East shawarma salad, Nigella's oven shawarma) and the
  // garlic-yogurt sheet-pan chicken that went viral from NYT Cooking's most-popular list.
  {
    id: 'sheetpan_chicken_shawarma', name: 'Sheet-pan chicken shawarma with crispy chickpeas & garlic yogurt', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'chicken_thigh', grams: 454 }, { food: 'chickpeas', grams: 250 }, { food: 'onion', grams: 150 }, { food: 'tomato', grams: 200 }, { food: 'cucumber', grams: 200 }, { food: 'greek_yogurt', grams: 170 }, { food: 'garlic', grams: 9 }, { food: 'lemon', grams: 30 }, { food: 'olive_oil', grams: 25 }],
    equipment: ['oven', 'sheetpan'], alt: ['airfryer'], activeMin: 15, totalMin: 40, steps: 5, dopamine: d(2, 3, 2, 3), batch: true,
    note: 'Marinate the chicken the night before for the deepest flavour. Keep the salad and sauce separate.',
  },
  // Inspired by: America's Test Kitchen's butter chicken (yogurt coating for charred spots) and Tasting Table's butter-chicken
  // tips (marinate in yogurt, stir yogurt in off the heat so it doesn't split).
  {
    id: 'butter_chicken_peas', name: 'Weeknight butter chicken with peas & rice', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'chicken_thigh', grams: 454 }, { food: 'canned_tomatoes', grams: 411 }, { food: 'greek_yogurt', grams: 170 }, { food: 'butter', grams: 20 }, { food: 'heavy_cream', grams: 60 }, { food: 'onion', grams: 150 }, { food: 'garlic', grams: 12 }, { food: 'ginger', grams: 15 }, { food: 'white_rice', grams: 200 }, { food: 'peas', grams: 150 }, { food: 'lemon', grams: 15 }, { food: 'cilantro', grams: 10 }],
    equipment: ['stove', 'skillet', 'pot'], alt: ['slowcooker', 'ricecooker'], activeMin: 25, totalMin: 45, steps: 5, dopamine: d(0, 3, 2, 2), batch: true,
    note: 'Freezes well without the rice. Slow cooker: skip the browning and cook all but the peas and last of the yogurt on low 5 hours.',
  },
  // Inspired by: Greek sheet-pan lemon chicken and potatoes (Diane Kochilas, The Kitchn): roast the potatoes first, then pour
  // lemony broth over them, not the chicken, so they soak it up while the chicken browns.
  {
    id: 'greek_lemon_chicken_potatoes', name: 'Greek lemon chicken, potatoes & green beans', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'chicken_thigh', grams: 454 }, { food: 'potato', grams: 600 }, { food: 'green_beans', grams: 340 }, { food: 'lemon', grams: 45 }, { food: 'garlic', grams: 12 }, { food: 'olive_oil', grams: 30 }, { food: 'broth', grams: 150 }, { food: 'olives', grams: 30 }],
    equipment: ['oven', 'sheetpan'], activeMin: 15, totalMin: 55, steps: 5, dopamine: d(2, 3, 1, 2), batch: true,
    note: 'Paleo and dairy-free. The potatoes taste even better the next day.',
  },
  // Inspired by: chicken adobo, a favourite in Reddit budget-meal threads (rounded up by BuzzFeed), plus RecipeTin Eats and
  // Once Upon a Chef: sear first, add the vinegar last and don't stir so its sharpness mellows, then reduce to a glaze.
  {
    id: 'chicken_adobo_spinach', name: 'Chicken adobo with crispy garlic, green beans & spinach', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'chicken_thigh', grams: 454 }, { food: 'white_rice', grams: 200 }, { food: 'green_beans', grams: 340 }, { food: 'spinach', grams: 283 }, { food: 'garlic', grams: 15 }, { food: 'soy_sauce', grams: 30 }, { food: 'honey', grams: 10 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['stove', 'skillet', 'ricecooker'], alt: ['slowcooker', 'ricecooker'], activeMin: 15, totalMin: 45, steps: 4, dopamine: d(2, 3, 2, 2), batch: true,
    note: 'Even better on day two. Slow cooker: everything but the vegetables on low 5 hours, then reduce the sauce on the stove.',
  },
  // Inspired by: slow-cooker tortilla soups (Cooking Classy, Well Plated, Cook's Country) and the Reddit budget-thread version
  // with beans, corn and tomatoes; crunchy chips, lime and avocado on top are what make it.
  {
    id: 'chicken_tortilla_soup', name: 'Slow-cooker chicken tortilla soup', slots: ['lunch', 'dinner'], servings: 4,
    items: [{ food: 'chicken_breast', grams: 454 }, { food: 'black_beans', grams: 250 }, { food: 'corn', grams: 200 }, { food: 'canned_tomatoes', grams: 411 }, { food: 'broth', grams: 700 }, { food: 'onion', grams: 150 }, { food: 'bell_pepper', grams: 150 }, { food: 'garlic', grams: 9 }, { food: 'lime', grams: 30 }, { food: 'cilantro', grams: 10 }, { food: 'avocado', grams: 136 }, { food: 'tortilla_chips', grams: 60 }],
    equipment: ['slowcooker'], alt: ['stove', 'pot'], activeMin: 15, totalMin: 255, steps: 4, dopamine: d(2, 3, 1, 2), batch: true,
    note: 'Freezes well. Keep the chips and avocado separate until serving. Stovetop: simmer 30 minutes.',
  },
  // Inspired by: jerk chicken with coconut rice and peas (Delicious magazine, Supergolden Bakes, Vikalinka): kidney beans and
  // coconut milk cooked into the rice, a fruity salsa to cut the heat.
  {
    id: 'jerk_chicken_rice_peas', name: 'Jerk-spiced chicken with coconut rice & beans and mango salsa', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'chicken_thigh', grams: 454 }, { food: 'white_rice', grams: 200 }, { food: 'kidney_beans', grams: 250 }, { food: 'coconut_milk', grams: 200 }, { food: 'mango', grams: 200 }, { food: 'bell_pepper', grams: 150 }, { food: 'lime', grams: 30 }, { food: 'onion', grams: 100 }, { food: 'garlic', grams: 9 }, { food: 'ginger', grams: 10 }, { food: 'honey', grams: 15 }, { food: 'cilantro', grams: 10 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['airfryer', 'ricecooker'], alt: ['oven', 'sheetpan', 'stove', 'pot'], activeMin: 20, totalMin: 40, steps: 5, dopamine: d(1, 3, 3, 3), batch: true,
    note: 'Marinate the chicken up to a day ahead. Five-spice stands in for allspice.',
  },
  // Inspired by: Budget Bytes' West African peanut stew (as covered by Well+Good) and maafe recipes from Food Network and
  // Kitchen Sanctuary: peanut butter whisked into broth with tomato, ginger and sweet potato.
  {
    id: 'chicken_peanut_stew', name: 'West African-style chicken peanut stew with sweet potato & kale', slots: ['dinner', 'lunch'], servings: 5,
    items: [{ food: 'chicken_thigh', grams: 454 }, { food: 'peanut_butter', grams: 96 }, { food: 'canned_tomatoes', grams: 411 }, { food: 'sweet_potato', grams: 454 }, { food: 'kale', grams: 150 }, { food: 'onion', grams: 150 }, { food: 'garlic', grams: 9 }, { food: 'ginger', grams: 15 }, { food: 'broth', grams: 700 }, { food: 'brown_rice', grams: 200 }, { food: 'lime', grams: 30 }, { food: 'cilantro', grams: 10 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['stove', 'pot', 'ricecooker'], alt: ['slowcooker', 'ricecooker'], activeMin: 20, totalMin: 50, steps: 4, dopamine: d(0, 3, 3, 2), batch: true,
    note: 'Freezes beautifully. It thickens in the fridge, so loosen with a splash of water when reheating.',
  },
  // Inspired by: buffalo chicken lettuce wraps and the rotisserie-chicken shortcuts praised in r/EatCheapAndHealthy roundups;
  // a yogurt "ranch" with dill keeps it light and tangy.
  {
    id: 'buffalo_chicken_lettuce_wraps', name: 'Buffalo rotisserie chicken lettuce wraps with yogurt ranch', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'rotisserie', grams: 280 }, { food: 'butter', grams: 15 }, { food: 'greek_yogurt', grams: 150 }, { food: 'celery', grams: 100 }, { food: 'carrots', grams: 100 }, { food: 'romaine', grams: 150 }, { food: 'lemon', grams: 10 }],
    equipment: ['microwave'], activeMin: 10, totalMin: 10, steps: 3, dopamine: d(3, 3, 1, 3),
    note: 'Keto-friendly and ready in 10 minutes. Make the ranch ahead; it keeps 5 days.',
  },
  // Inspired by: Reddit budget threads on shredding a store rotisserie chicken for quick meals (via BuzzFeed) and Mexican
  // tostadas: a crisp tortilla, refried-style beans, a sharp lime slaw.
  {
    id: 'rotisserie_tostadas', name: '15-minute rotisserie chicken tostadas with lime slaw', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'rotisserie', grams: 170 }, { food: 'corn_tortillas', grams: 150 }, { food: 'black_beans', grams: 250 }, { food: 'cabbage', grams: 150 }, { food: 'lime', grams: 30 }, { food: 'cilantro', grams: 10 }, { food: 'salsa', grams: 60 }, { food: 'avocado', grams: 136 }, { food: 'greek_yogurt', grams: 60 }],
    equipment: ['airfryer', 'microwave'], alt: ['oven', 'sheetpan', 'microwave'], activeMin: 15, totalMin: 15, steps: 3, dopamine: d(3, 3, 2, 3),
  },
  // Inspired by: keto chicken-bacon-ranch cauliflower casseroles (That Low Carb Life, Creations by Kara) and r/ketorecipes-style
  // comfort food; drying the cauliflower well keeps it from going watery.
  {
    id: 'chicken_bacon_cauli_bake', name: 'Chicken, bacon & cauliflower cheese bake', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'chicken_breast', grams: 454 }, { food: 'cauliflower', grams: 680 }, { food: 'bacon', grams: 85 }, { food: 'cheddar', grams: 85 }, { food: 'cream_cheese', grams: 60 }, { food: 'spinach', grams: 140 }, { food: 'garlic', grams: 6 }],
    equipment: ['stove', 'skillet', 'oven', 'microwave'], activeMin: 20, totalMin: 40, steps: 4, dopamine: d(1, 3, 1, 2), batch: true,
    note: 'Keto. Reheats well; portion it into containers once cool.',
  },
  // Inspired by: oyakodon from Just One Cookbook and America's Test Kitchen: chicken and onion simmered in a sweet-savoury
  // broth, eggs poured over at the end. Cooked here until just set, per food-safety guidance.
  {
    id: 'oyakodon_bowls', name: 'Oyakodon-style chicken & egg rice bowls', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'chicken_thigh', grams: 454 }, { food: 'egg', grams: 300 }, { food: 'onion', grams: 200 }, { food: 'white_rice', grams: 200 }, { food: 'broth', grams: 180 }, { food: 'soy_sauce', grams: 22 }, { food: 'honey', grams: 15 }, { food: 'spinach', grams: 100 }],
    equipment: ['stove', 'skillet', 'ricecooker'], alt: ['stove', 'skillet', 'pot'], activeMin: 20, totalMin: 30, steps: 4, dopamine: d(0, 3, 2, 2),
  },
  // Inspired by: BBQ-spiced chicken and sweet potato meal-prep bowls from r/MealPrepSunday-style roundups and Budget Bytes,
  // with a tangy apple-cabbage slaw for crunch (dairy-free, paleo).
  {
    id: 'bbq_chicken_sweet_potato_bowls', name: 'BBQ-rubbed chicken & sweet potato bowls with apple slaw', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'chicken_breast', grams: 454 }, { food: 'sweet_potato', grams: 454 }, { food: 'cabbage', grams: 300 }, { food: 'carrots', grams: 100 }, { food: 'apple', grams: 150 }, { food: 'olive_oil', grams: 25 }, { food: 'honey', grams: 15 }, { food: 'avocado', grams: 136 }],
    equipment: ['airfryer'], alt: ['oven', 'sheetpan'], activeMin: 15, totalMin: 40, steps: 4, dopamine: d(3, 3, 2, 2), batch: true,
    note: 'Paleo and dairy-free. The slaw stays crunchy for 3 days; slice the avocado fresh.',
  },

  // ── Ground meat ───────────────────────────────────────────
  // Inspired by: Damn Delicious' Korean beef bowl (a weekly repeat in its comments) and bibimbap toppings: spinach, carrots, kimchi.
  {
    id: 'korean_beef_bowls', name: 'Korean-style beef bowls with spinach, carrots & kimchi', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'ground_beef', grams: 454 }, { food: 'white_rice', grams: 200 }, { food: 'spinach', grams: 200 }, { food: 'carrots', grams: 150 }, { food: 'kimchi', grams: 150 }, { food: 'soy_sauce', grams: 30 }, { food: 'honey', grams: 25 }, { food: 'garlic', grams: 9 }, { food: 'ginger', grams: 10 }],
    equipment: ['stove', 'skillet', 'ricecooker'], alt: ['stove', 'skillet', 'pot'], activeMin: 15, totalMin: 25, steps: 4, dopamine: d(1, 3, 2, 3), batch: true,
  },
  // Inspired by: Thai larb (Hot Thai Kitchen, Eating Thai Food): warm minced meat dressed with lime, chili and herbs. Toasted
  // cashews stand in for toasted rice powder to keep it keto.
  {
    id: 'beef_larb_cabbage', name: 'Thai-style beef larb with crunchy cabbage & cashews', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'ground_beef', grams: 454 }, { food: 'cabbage', grams: 300 }, { food: 'cucumber', grams: 150 }, { food: 'onion', grams: 60 }, { food: 'lime', grams: 45 }, { food: 'cilantro', grams: 20 }, { food: 'cashews', grams: 30 }, { food: 'soy_sauce', grams: 15 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 15, steps: 3, dopamine: d(3, 3, 3, 2), batch: true,
    note: 'Keto. Not keto? Toast 2 tbsp raw rice in a dry pan, grind it and stir it in, the classic way. Pack the slaw separately.',
  },
  // Inspired by: British cottage pie (BBC Good Food, Kitchen Sanctuary, RecipeTin Eats) and the shepherd's pie Reddit budget
  // threads call better the next day; well-browned beef and a fork-raked cheddar mash for crisp ridges.
  {
    id: 'cottage_pie', name: 'Cottage pie with a crispy cheddar mash', slots: ['dinner', 'lunch'], servings: 5,
    items: [{ food: 'ground_beef', grams: 454 }, { food: 'potato', grams: 900 }, { food: 'onion', grams: 150 }, { food: 'carrots', grams: 200 }, { food: 'peas', grams: 200 }, { food: 'mushrooms', grams: 227 }, { food: 'canned_tomatoes', grams: 200 }, { food: 'broth', grams: 300 }, { food: 'milk', grams: 100 }, { food: 'butter', grams: 15 }, { food: 'cheddar', grams: 50 }, { food: 'soy_sauce', grams: 10 }, { food: 'garlic', grams: 6 }],
    equipment: ['stove', 'pot', 'skillet', 'oven'], activeMin: 30, totalMin: 60, steps: 5, dopamine: d(2, 3, 1, 2), batch: true,
    note: 'Freezes for months. Mushrooms stretch the beef and add savouriness; soy sauce stands in for Worcestershire.',
  },
  // Inspired by: lighter Swedish meatballs (Skinnytaste, Well Plated, Feasting at Home) with a Greek-yogurt gravy, plus the
  // classic sides: dill potatoes, quick pressed cucumbers and a tart berry stand-in for lingonberries.
  {
    id: 'swedish_turkey_meatballs', name: 'Swedish-style turkey meatballs with yogurt gravy & quick pickles', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'ground_turkey', grams: 454 }, { food: 'egg', grams: 50 }, { food: 'oats', grams: 30 }, { food: 'onion', grams: 100 }, { food: 'broth', grams: 300 }, { food: 'greek_yogurt', grams: 150 }, { food: 'butter', grams: 15 }, { food: 'potato', grams: 700 }, { food: 'cucumber', grams: 300 }, { food: 'berries', grams: 100 }],
    equipment: ['oven', 'sheetpan', 'stove', 'pot', 'skillet'], alt: ['airfryer', 'stove', 'pot', 'skillet'], activeMin: 30, totalMin: 45, steps: 4, dopamine: d(1, 3, 3, 3), batch: true,
    note: 'Meatballs and gravy freeze well. Bring the yogurt to room temperature so the gravy stays smooth.',
  },
  // Inspired by: stuffed peppers from Once Upon a Chef and Cookie and Kate: roast the pepper halves first so they're tender,
  // not crunchy, and cook the rice right in the filling.
  {
    id: 'turkey_stuffed_peppers', name: 'Tex-Mex turkey & rice stuffed peppers', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'ground_turkey', grams: 454 }, { food: 'bell_pepper', grams: 600 }, { food: 'white_rice', grams: 100 }, { food: 'canned_tomatoes', grams: 411 }, { food: 'black_beans', grams: 250 }, { food: 'onion', grams: 100 }, { food: 'garlic', grams: 6 }, { food: 'cheddar', grams: 60 }, { food: 'cilantro', grams: 10 }, { food: 'greek_yogurt', grams: 80 }, { food: 'lime', grams: 15 }],
    equipment: ['oven', 'sheetpan', 'stove', 'skillet'], activeMin: 25, totalMin: 50, steps: 5, dopamine: d(1, 3, 1, 2), batch: true,
    note: 'Freeze cooked halves individually and reheat to 165°F.',
  },

  // ── Pork and steak ────────────────────────────────────────
  // Inspired by: skillet pork tenderloin with cabbage and apples (A Mind Full Mom, My Gourmet Connection): sear, braise the
  // cabbage with cider vinegar and mustard, then finish the pork gently in the pan.
  {
    id: 'pork_apple_cabbage', name: 'Mustard pork tenderloin with apples, cabbage & crispy potatoes', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'pork_loin', grams: 454 }, { food: 'apple', grams: 300 }, { food: 'cabbage', grams: 450 }, { food: 'onion', grams: 150 }, { food: 'potato', grams: 450 }, { food: 'olive_oil', grams: 25 }],
    equipment: ['stove', 'skillet', 'microwave'], activeMin: 25, totalMin: 35, steps: 4, dopamine: d(1, 3, 2, 2), batch: true,
    note: 'Paleo and dairy-free. One skillet does it all.',
  },
  // Inspired by: Cuban mojo pork (America's Test Kitchen, the AHA mojo tenderloin): orange, lime, garlic, cumin and oregano,
  // with half the mojo kept back as a fresh sauce, served Cuban-style with black beans and rice.
  {
    id: 'mojo_pork_bowls', name: 'Cuban mojo pork with black beans, rice & pickled onions', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'pork_loin', grams: 454 }, { food: 'orange', grams: 130 }, { food: 'lime', grams: 30 }, { food: 'garlic', grams: 12 }, { food: 'olive_oil', grams: 20 }, { food: 'white_rice', grams: 180 }, { food: 'black_beans', grams: 250 }, { food: 'onion', grams: 120 }, { food: 'bell_pepper', grams: 150 }, { food: 'cilantro', grams: 10 }],
    equipment: ['oven', 'sheetpan', 'ricecooker', 'microwave'], alt: ['airfryer', 'stove', 'pot'], activeMin: 20, totalMin: 45, steps: 5, dopamine: d(1, 3, 3, 2), batch: true,
    note: 'Marinate the pork up to a day ahead. Dairy-free.',
  },
  // Inspired by: beef and broccoli adapted from Kenji López-Alt's Food Lab method (via Once Upon a Chef): thin slices seared
  // hot in batches so they brown instead of steam, then a quick glossy ginger-garlic sauce.
  {
    id: 'ginger_beef_broccoli', name: 'Ginger beef & broccoli with rice', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'sirloin', grams: 454 }, { food: 'broccoli', grams: 680 }, { food: 'white_rice', grams: 200 }, { food: 'soy_sauce', grams: 30 }, { food: 'honey', grams: 25 }, { food: 'garlic', grams: 9 }, { food: 'ginger', grams: 15 }, { food: 'olive_oil', grams: 15 }],
    equipment: ['stove', 'skillet', 'ricecooker'], alt: ['stove', 'skillet', 'pot'], activeMin: 20, totalMin: 30, steps: 4, dopamine: d(1, 3, 1, 2), batch: true,
    note: '15 minutes in the freezer makes the steak much easier to slice thin.',
  },
  // Inspired by: steak salads with balsamic (Bon Appétit-style bistro salads) and the dry-brine and hot-pan searing advice
  // from Serious Eats' Food Lab (as summarised by Food Republic and The Splendid Table); hot crispy potatoes make it a meal.
  {
    id: 'balsamic_steak_salad', name: 'Balsamic steak salad with crispy potatoes & feta', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'sirloin', grams: 360 }, { food: 'potato', grams: 450 }, { food: 'romaine', grams: 250 }, { food: 'tomato', grams: 200 }, { food: 'cucumber', grams: 150 }, { food: 'onion', grams: 50 }, { food: 'balsamic', grams: 40 }, { food: 'honey', grams: 10 }, { food: 'olive_oil', grams: 30 }, { food: 'feta', grams: 40 }, { food: 'garlic', grams: 3 }],
    equipment: ['airfryer', 'stove', 'skillet'], alt: ['oven', 'sheetpan', 'stove', 'skillet'], activeMin: 20, totalMin: 30, steps: 4, dopamine: d(3, 3, 2, 2),
    note: 'Salt the steak up to a day ahead and leave it uncovered in the fridge for a better crust.',
  },
]

export const METHODS_MEAT: Record<string, string[]> = {
  gochujang_chicken_thighs: [
    'Start the rice in a rice cooker (or a pot). Smash the cucumbers with the flat of a knife, break them into chunks and toss with a pinch of salt, 1 tbsp rice vinegar, a third of the garlic and a pinch of red pepper flakes; chill.',
    'Make the glaze: whisk the soy sauce, honey, grated ginger, the rest of the garlic, 1 tbsp sriracha, 1 tbsp rice vinegar, 1 tsp smoked paprika and 1 tsp red pepper flakes.',
    'Put the broccoli in a large skillet with 3 tbsp water, cover and steam over medium-high heat 4 minutes until bright green; tip it out and wipe the pan dry.',
    'Pat the thighs dry and salt them lightly. Heat the oil in the skillet over medium-high and cook the thighs without moving them, 5–6 minutes per side, until deeply browned and 165°F inside.',
    'Lower the heat, pour in the glaze and let it bubble 1–2 minutes, turning the chicken, until sticky and glossy. Slice and serve over rice with the broccoli and the cold cucumbers.',
  ],
  sheetpan_chicken_shawarma: [
    'Heat the oven to 425°F. Mix a third of the lemon juice, 1 tbsp of the oil, half the garlic, 2 tsp cumin, 2 tsp paprika, 1 tsp turmeric, 1 tsp oregano, ½ tsp salt and pepper; toss the chicken thighs in it (overnight is great, 10 minutes is fine).',
    'Drain, rinse and pat the chickpeas very dry. Slice the onion. Toss both with the rest of the oil, a pinch of cumin and salt, and spread on the sheet pan with the chicken in the middle, nothing piled up.',
    'Roast 25–30 minutes, stirring the chickpeas once, until the chicken is charred at the edges and reaches 165°F and the chickpeas are crisp.',
    'Meanwhile stir the Greek yogurt with the remaining garlic, half the remaining lemon juice and a pinch of salt. Dice the tomato and cucumber and toss with the last of the lemon juice and salt.',
    'Slice the chicken and pile it with the chickpeas and onions, the salad and a big spoonful of garlic yogurt. Finish with a pinch of red pepper flakes.',
  ],
  butter_chicken_peas: [
    'Start the rice. Cut the chicken into bite-size pieces and toss with half the Greek yogurt, 1 tsp garam masala, 1 tsp chili powder, ½ tsp turmeric and ½ tsp salt (10 minutes, or overnight).',
    'Melt half the butter in a large skillet over medium-high. Brown the chicken in a single layer, 3 minutes per side, until spotted dark brown (it finishes cooking later); set aside.',
    'Add the rest of the butter and the diced onion and cook 6–8 minutes until golden. Stir in the grated ginger, garlic, 2 tsp garam masala, 1 tsp cumin and 1 tsp paprika for 1 minute until fragrant.',
    'Add the canned tomatoes, simmer 10 minutes and mash (or blend) until fairly smooth. Stir in the cream, return the chicken and add the peas; simmer 8–10 minutes until the chicken reaches 165°F.',
    'Take the pan off the heat and stir in the remaining yogurt and the lemon juice. Taste for salt and serve over rice, topped with cilantro.',
  ],
  greek_lemon_chicken_potatoes: [
    'Heat the oven to 425°F. Cut the potatoes into wedges and toss them on the sheet pan with half the oil, 2 tsp oregano, salt and pepper. Roast 20 minutes.',
    'Meanwhile toss the chicken with the rest of the oil, a third of the lemon juice, the minced garlic, 1 tsp oregano and salt.',
    'Turn the potatoes, nestle the chicken between them and pour the broth and another third of the lemon juice over the potatoes, not the chicken. Roast 15 minutes.',
    'Add the green beans around the edges and roast 10–15 minutes more, until the potatoes have soaked up the liquid and are golden at the edges and the chicken reaches 165°F.',
    'Scatter over the chopped olives, squeeze over the last of the lemon juice and spoon the pan juices on top.',
  ],
  chicken_adobo_spinach: [
    'Start the rice. Thinly slice a third of the garlic and fry it in the oil in a deep skillet over medium heat 2–3 minutes until golden; scoop the crispy garlic onto a plate. Pat the chicken thighs dry and brown them in the same oil over medium-high, 4 minutes per side.',
    'Add the remaining garlic, smashed, for 30 seconds, then the soy sauce, ⅓ cup vinegar, ½ cup water, the honey, 3 bay leaves and 1 tsp cracked black pepper. Bring to a boil and leave it unstirred 2 minutes so the vinegar mellows, then cover and simmer on low 20 minutes until the chicken is tender and 165°F.',
    'Uncover, turn the heat up and simmer 5–8 minutes, turning the chicken, until the sauce reduces to a glossy glaze. Lift out the chicken and discard the bay leaves.',
    'Stir the green beans into the sauce, cover and cook 4–5 minutes until tender, then stir in the spinach for 1 minute until wilted. Serve the chicken over rice with the vegetables and sauce, topped with the crispy garlic.',
  ],
  chicken_tortilla_soup: [
    'Dice the onion and bell pepper and mince the garlic. Put them in the slow cooker with the tomatoes and their juice, the drained beans, corn, broth, 2 tsp cumin, 2 tsp chili powder, 1 tsp smoked paprika, 1 tsp oregano and 1 tsp salt. Lay the chicken breasts on top.',
    'Cook on high 3–4 hours (or low 6–7) until the chicken shreds easily and reaches 165°F.',
    'Lift out the chicken, shred it with two forks and stir it back in with half the lime juice. Taste for salt.',
    'Serve topped with diced avocado, cilantro, crushed tortilla chips and the rest of the lime juice. Reheat leftovers to 165°F.',
  ],
  jerk_chicken_rice_peas: [
    'Finely chop half the onion and mince the garlic and ginger. Mix them with half the lime juice, the honey, the oil, 1 tbsp hot sauce, 2 tsp thyme, 1 tsp five-spice, 1 tsp smoked paprika, 1 tsp black pepper, ½ tsp red pepper flakes and 1 tsp salt. Coat the chicken (marinate up to a day).',
    'Rinse the rice and put it in the rice cooker with the coconut milk, drained kidney beans, 1 tsp thyme, a bay leaf, ½ tsp salt and water up to the line for that amount of rice. Cook.',
    'Air-fry the chicken at 400°F for 16–18 minutes, flipping halfway, until charred at the edges and 165°F (or roast on a sheet pan at 425°F for 25 minutes).',
    'Dice the thawed mango, the bell pepper and the remaining onion; toss with the rest of the lime juice, the chopped cilantro and a pinch of salt.',
    'Slice the chicken and serve over the coconut rice and beans with the mango salsa.',
  ],
  chicken_peanut_stew: [
    'Start the brown rice. Dice the onion, grate the ginger and garlic, cube the sweet potato (skin on) and cut the chicken into chunks.',
    'Heat the oil in a large pot over medium-high and brown the chicken 5 minutes. Add the onion for 4 minutes, then the ginger, garlic, 2 tsp cumin, 1 tsp smoked paprika and ½ tsp red pepper flakes for 1 minute.',
    'Whisk the peanut butter into the broth and add it with the tomatoes and sweet potato. Simmer, partly covered, 20–25 minutes until the sweet potato is tender and the chicken reaches 165°F.',
    'Stir in the chopped kale for 3–4 minutes until wilted. Add the lime juice and salt to taste, and serve over the rice with cilantro and hot sauce.',
  ],
  buffalo_chicken_lettuce_wraps: [
    'Make the ranch: stir the Greek yogurt with the lemon juice, 1 tsp dried dill, ½ tsp garlic powder, ½ tsp onion powder, salt and pepper.',
    'Shred the rotisserie chicken into a bowl with the butter and 3 tbsp hot sauce. Cover and microwave 60–90 seconds, stirring once, until steaming hot (165°F).',
    'Cut the celery and carrots into thin sticks. Spoon the chicken into the romaine leaves and top with the celery, carrots and ranch.',
  ],
  rotisserie_tostadas: [
    'Mist the corn tortillas with cooking spray and air-fry at 400°F for 4–6 minutes, in batches, flipping once, until golden and crisp (or bake at 425°F for 8 minutes).',
    'Meanwhile toss the shredded cabbage with half the lime juice, the cilantro and a pinch of salt. Mash the drained beans with 1 tsp cumin, ½ tsp chili powder and a splash of water, and microwave 1 minute. Shred the chicken, mix with the salsa and microwave 1 minute until hot.',
    'Mash the avocado with the rest of the lime juice and salt. Spread the beans on the tostadas and top with chicken, slaw, avocado, a spoonful of Greek yogurt and hot sauce.',
  ],
  chicken_bacon_cauli_bake: [
    'Heat the oven to 400°F. Microwave the cauliflower, covered, with a splash of water 6–8 minutes until just tender; drain very well and pat dry.',
    'In an oven-safe skillet, cook the chopped bacon over medium 5–6 minutes until crisp; scoop it out, leaving about 1 tbsp fat. Cook the bite-size chicken in the fat 6–7 minutes until golden and 165°F. Add the minced garlic and the spinach and stir until wilted.',
    'Off the heat, stir in the cream cheese until melted, then 1 tsp Dijon, 1 tsp dried dill, ½ tsp garlic powder, ½ tsp onion powder, pepper, the cauliflower and half the cheddar.',
    'Top with the rest of the cheddar and the bacon and bake 15 minutes until bubbling and browned. Serve with hot sauce.',
  ],
  oyakodon_bowls: [
    'Start the rice. Slice the onion thinly and cut the chicken into bite-size pieces. Mix the broth, soy sauce and honey.',
    'Simmer the onion in the sauce in a wide skillet over medium 3–4 minutes until soft. Add the chicken in a single layer, cover and simmer 6–8 minutes, turning once, until it reaches 165°F.',
    'Stir in the spinach to wilt. Beat the eggs lightly and pour them evenly over the top, cover and cook on medium-low 3–4 minutes until the eggs are softly set with no runny egg left.',
    'Slide the chicken and egg over bowls of rice with the sauce, and finish with a pinch of red pepper flakes and a few drops of rice vinegar.',
  ],
  bbq_chicken_sweet_potato_bowls: [
    'Cube the sweet potato and toss with 1 tbsp of the oil, 1 tsp smoked paprika and salt. Air-fry at 400°F for 15–18 minutes, shaking twice, until browned at the edges and tender (oven: 425°F on a sheet pan for 25 minutes, with the chicken added for the last 20).',
    'Pound the chicken to an even thickness and rub with a little oil, 2 tsp smoked paprika, 1 tsp chili powder, 1 tsp garlic powder, 1 tsp onion powder, ½ tsp cumin, salt and pepper. Air-fry at 380°F for 14–16 minutes, flipping halfway, until 165°F; brush with half the honey mixed with 1 tsp hot sauce for the last 2 minutes.',
    'Shred the cabbage, grate the carrots and cut the apple into matchsticks. Toss with 2 tbsp cider vinegar, the remaining oil and honey, 1 tsp Dijon and salt.',
    'Slice the chicken and serve over the sweet potato with the slaw and sliced avocado.',
  ],
  korean_beef_bowls: [
    'Start the rice. Mix the soy sauce, honey, grated ginger, half the garlic, 1 tbsp rice vinegar, 1 tsp sriracha and ½ tsp red pepper flakes.',
    'Brown the beef in a large skillet over medium-high, breaking it up but leaving it alone a minute at a time so crispy bits form, 7–8 minutes until it reaches 160°F. Spoon off extra fat.',
    'Add the rest of the garlic for 30 seconds, then the sauce, and simmer 2 minutes until glossy. Push the beef aside and stir the spinach and grated carrots in the clear space for 1–2 minutes with a pinch of salt.',
    'Serve the beef over rice with the spinach, carrots and kimchi.',
  ],
  beef_larb_cabbage: [
    'Toast the chopped cashews in a dry skillet over medium 2–3 minutes until golden; tip them out.',
    'Cook the beef in the same skillet over medium-high, breaking it up, 7–8 minutes until browned and 160°F. Spoon off most of the fat. Off the heat stir in the lime juice, soy sauce, 1 tsp red pepper flakes (to taste), the thinly sliced onion and most of the chopped cilantro.',
    'Toss the shredded cabbage and sliced cucumber with a pinch of salt, pile the warm larb on top and finish with the cashews and the rest of the cilantro.',
  ],
  cottage_pie: [
    'Heat the oven to 400°F. Cut the potatoes into chunks and boil in salted water 15 minutes until very tender. Drain and mash with the milk, butter, salt and pepper.',
    'Meanwhile brown the beef in a large oven-safe skillet over high heat, breaking it up, 8 minutes until well browned and 160°F; spoon off excess fat. Add the diced onion, carrots and chopped mushrooms and cook 8 minutes until the mushrooms brown.',
    'Stir in the minced garlic, 1 tsp thyme and ½ tsp rosemary, then the tomatoes, broth, soy sauce and 1 tsp Dijon. Simmer 10 minutes until thick and gravy-like, then stir in the peas.',
    'Spread the mash over the filling, rake it with a fork to make deep ridges and scatter the grated cheddar on top.',
    'Bake 20–25 minutes until bubbling at the edges and golden on the ridges (broil 2 minutes for extra crunch). Rest 5 minutes before serving.',
  ],
  swedish_turkey_meatballs: [
    'Thinly slice the cucumber and toss with ¼ cup vinegar, 2 tbsp water, 1 tsp dried dill and ½ tsp salt; chill. Halve the potatoes and boil in salted water 15–18 minutes until tender.',
    'Heat the oven to 425°F. Mix the turkey, egg, oats, half the onion (grated), 1 tsp salt, ½ tsp pepper and ½ tsp garlic powder. Roll into about 20 balls, set on a sheet pan misted with cooking spray and bake 15–18 minutes until browned and 165°F (air fryer: 400°F for 10–12 minutes).',
    'Melt the butter in a skillet and cook the rest of the onion, finely chopped, 4 minutes. Add the broth, 1 tsp Dijon and plenty of pepper and simmer 5 minutes to reduce by a third. Turn off the heat, stir in the room-temperature Greek yogurt and roll the meatballs in the gravy.',
    'Microwave the berries 1–2 minutes and mash with a fork. Toss the potatoes with a pinch of dill and serve with the meatballs, gravy, pickled cucumbers and berries.',
  ],
  turkey_stuffed_peppers: [
    'Heat the oven to 425°F. Halve the peppers through the stem and seed them. Roast cut side down on a sheet pan misted with cooking spray 12–15 minutes until softened and browned at the edges.',
    'Meanwhile brown the turkey with the diced onion in a large skillet over medium-high, 6–7 minutes. Add the minced garlic, 2 tsp cumin, 2 tsp chili powder, 1 tsp oregano and 1 tsp salt.',
    'Add the tomatoes with their juice, the rinsed rice, the drained beans and ¾ cup water. Bring to a boil, cover and simmer on low 18–20 minutes until the rice is tender and the liquid absorbed; the turkey will be well past 165°F.',
    'Flip the peppers cut side up, pile in the filling and top with the cheddar. Bake 10–12 minutes until the cheese bubbles and browns.',
    'Stir the Greek yogurt with the lime juice and a pinch of salt and spoon it over, with cilantro and hot sauce.',
  ],
  pork_apple_cabbage: [
    'Cut the potatoes into small cubes and microwave, covered, with a splash of water 5–6 minutes until just tender.',
    'Cut the pork into 1-inch medallions, pat dry and season with salt, pepper and 1 tsp thyme. Sear in half the oil in a large skillet over medium-high, 2–3 minutes per side until browned; set aside (it finishes later).',
    'Add the rest of the oil, the potatoes and the sliced onion and cook 5 minutes until the potatoes crisp in spots. Add the shredded cabbage, sliced apples, 1 tsp thyme and salt and cook 6–8 minutes until the cabbage wilts and browns at the edges.',
    'Stir in 2 tbsp cider vinegar, 1 tbsp Dijon and ¼ cup water. Nestle the pork back in, cover and cook on low 4–5 minutes until it reaches 145°F, then rest 3 minutes before serving.',
  ],
  mojo_pork_bowls: [
    'Make the mojo: mix the juice of the orange and lime with the minced garlic, half the oil, 1 tsp cumin, 1 tsp oregano, salt and pepper. Pour half over the pork (30 minutes to overnight) and keep the other half aside for serving.',
    'Thinly slice half the onion, cover with 3 tbsp vinegar and a pinch of salt and set aside to pickle. Start the rice.',
    'Heat the oven to 425°F. Put the pork and the sliced bell pepper on a sheet pan with the rest of the oil and roast 20–25 minutes until the pork reaches 145°F. Rest 3 minutes, then slice.',
    'Microwave the drained beans with the rest of the onion, diced, 1 tsp cumin, ½ tsp oregano and a splash of water, 3 minutes, until hot.',
    'Serve the pork over rice and beans with the peppers and pickled onions, spoon over the reserved mojo and top with cilantro.',
  ],
  ginger_beef_broccoli: [
    'Start the rice. Slice the steak thin (¼ inch) against the grain and toss with 1 tbsp of the soy sauce and pepper. Mix the rest of the soy sauce with the honey, grated ginger, garlic, 3 tbsp water, 1 tbsp rice vinegar and ½ tsp red pepper flakes.',
    'Heat half the oil in a large skillet over high until shimmering. Sear the beef in two batches without crowding, 1–2 minutes per side, until browned and 145°F; let it rest on a plate while you cook the broccoli.',
    'Add the rest of the oil, the broccoli and 3 tbsp water. Cover 3–4 minutes until bright green and crisp-tender, then uncover and let it char a little.',
    'Pour in the sauce and bubble 1–2 minutes until syrupy. Return the beef and its juices and toss 30 seconds. Serve over rice.',
  ],
  balsamic_steak_salad: [
    'Cut the potatoes into 1-inch cubes and toss with 1 tbsp of the oil, 1 tsp rosemary and salt. Air-fry at 400°F for 18–20 minutes, shaking twice, until crisp and golden (or roast at 425°F for 30 minutes).',
    'Pat the steak dry and salt it well. Heat a skillet over high with 1 tsp of the oil until smoking and sear 3–5 minutes per side, flipping every minute or two, until 145°F. Rest at least 3 minutes.',
    'Whisk the balsamic, honey, 1 tsp Dijon, grated garlic, the remaining oil, salt and pepper. Slice the onion thin and let it sit in a spoonful of the dressing to soften.',
    'Chop the romaine, tomato and cucumber and toss with most of the dressing. Slice the steak thin against the grain and pile it on with the hot potatoes, onion and crumbled feta; drizzle with the rest of the dressing.',
  ],
}

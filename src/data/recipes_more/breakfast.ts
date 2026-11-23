// Breakfasts: sweet and savoury, quick and make-ahead.
// Each recipe is original: inspired by well-loved dishes, written in this app's own words.
// Ingredient grams are for the whole recipe; one plan entry is one serving.
import type { Recipe } from '../../types'

const d = (crunch: number, flavor: number, novelty: number, fun: number) => ({ crunch, flavor, novelty, fun })

export const RECIPES_BREAKFAST: Recipe[] = [
  // ── Savoury ──────────────────────────────────────────────
  // Inspired by: shakshuka write-ups citing Serious Eats (spoon hot sauce over the whites so they set before the yolks), America's Test Kitchen and Budget Bytes' menemen.
  {
    id: 'smoky_shakshuka_feta', name: 'Smoky shakshuka with feta & dippy toast', slots: ['breakfast', 'lunch'], servings: 2,
    items: [{ food: 'canned_tomatoes', grams: 411 }, { food: 'bell_pepper', grams: 150 }, { food: 'onion', grams: 100 }, { food: 'garlic', grams: 6 }, { food: 'olive_oil', grams: 15 }, { food: 'egg', grams: 200 }, { food: 'feta', grams: 40 }, { food: 'cilantro', grams: 8 }, { food: 'lemon', grams: 10 }, { food: 'bread', grams: 64 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 30, steps: 5, dopamine: d(1, 3, 2, 3),
    note: 'Simmer the sauce until thick before the eggs go in, or it ends up watery.',
  },
  // Inspired by: gyeran-bap (Korean egg rice) recipes from Korean home-cooking blogs, and "leftovers with an egg on top" replies on r/EatCheapAndHealthy.
  {
    id: 'kimchi_egg_rice_bowl', name: 'Korean-style kimchi egg rice bowl (gyeran-bap)', slots: ['breakfast', 'lunch'], servings: 1,
    items: [{ food: 'white_rice', grams: 60 }, { food: 'egg', grams: 100 }, { food: 'kimchi', grams: 60 }, { food: 'edamame', grams: 60 }, { food: 'cucumber', grams: 60 }, { food: 'soy_sauce', grams: 6 }, { food: 'olive_oil', grams: 5 }],
    equipment: ['ricecooker', 'stove', 'skillet'], alt: ['stove', 'pot', 'skillet'], activeMin: 8, totalMin: 25, steps: 4, dopamine: d(2, 3, 2, 2),
    note: 'With leftover rice (about 1 heaping cup cooked) it’s a 6-minute breakfast.',
  },
  // Inspired by: chilaquiles technique from America's Test Kitchen and Serious Eats (crisp your own tortilla wedges, reduce the sauce, sauce at the last second).
  {
    id: 'chilaquiles_rojos_eggs', name: 'Crispy-edged chilaquiles rojos with fried eggs', slots: ['breakfast', 'lunch'], servings: 1,
    items: [{ food: 'corn_tortillas', grams: 75 }, { food: 'olive_oil', grams: 8 }, { food: 'salsa', grams: 70 }, { food: 'canned_tomatoes', grams: 120 }, { food: 'garlic', grams: 3 }, { food: 'black_beans', grams: 60 }, { food: 'egg', grams: 100 }, { food: 'greek_yogurt', grams: 30 }, { food: 'lime', grams: 10 }, { food: 'onion', grams: 20 }, { food: 'cilantro', grams: 5 }],
    equipment: ['airfryer', 'stove', 'skillet'], alt: ['oven', 'sheetpan', 'stove', 'skillet'], activeMin: 15, totalMin: 20, steps: 5, dopamine: d(3, 3, 3, 3),
    note: 'Fold the chips into the sauce right before eating so they stay crunchy-chewy, not soggy.',
  },
  // Inspired by: everything-bagel-and-lox toasts (Skinnytaste's smoked salmon toast) adapted to canned salmon, plus quick-pickled onions from countless deli-style recipes.
  {
    id: 'lox_style_salmon_toast', name: 'Lox-style salmon toast with quick-pickled onion', slots: ['breakfast', 'lunch'], servings: 1,
    items: [{ food: 'bread', grams: 64 }, { food: 'cream_cheese', grams: 25 }, { food: 'canned_salmon', grams: 85 }, { food: 'cucumber', grams: 50 }, { food: 'tomato', grams: 50 }, { food: 'onion', grams: 15 }, { food: 'lemon', grams: 5 }],
    equipment: ['toaster'], alt: ['airfryer'], activeMin: 8, totalMin: 8, steps: 4, dopamine: d(2, 3, 2, 2),
    note: 'Mash the soft salmon bones in with a fork: you won’t notice them, and they add calcium.',
  },
  // Inspired by: the viral cottage cheese toast (Well Plated, Eating Bird Food) crossed with pan con tomate's garlic-rubbed toast.
  {
    id: 'cottage_tomato_toast', name: 'Peppery cottage cheese & tomato toast with balsamic', slots: ['breakfast', 'lunch', 'snack'], servings: 1,
    items: [{ food: 'bread', grams: 64 }, { food: 'garlic', grams: 3 }, { food: 'cottage_cheese', grams: 150 }, { food: 'tomato', grams: 150 }, { food: 'arugula', grams: 15 }, { food: 'olive_oil', grams: 5 }, { food: 'balsamic', grams: 8 }],
    equipment: ['toaster'], alt: ['airfryer'], activeMin: 5, totalMin: 5, steps: 3, dopamine: d(2, 2, 1, 1),
    note: 'Salt the tomato slices a minute before topping: they get juicier and taste more like tomato.',
  },
  // Inspired by: savoury oatmeal posts (toast the oats first, cook them in broth, crown with a runny-yolk egg) and an r/EatCheapAndHealthy favourite of cheesy savoury oats.
  {
    id: 'cheddar_savory_oats_egg', name: 'Grits-style cheddar oats with a crispy fried egg', slots: ['breakfast'], servings: 1,
    items: [{ food: 'oats', grams: 50 }, { food: 'olive_oil', grams: 5 }, { food: 'garlic', grams: 3 }, { food: 'veg_broth', grams: 240 }, { food: 'spinach', grams: 30 }, { food: 'cheddar', grams: 20 }, { food: 'egg', grams: 100 }],
    equipment: ['stove', 'pot', 'skillet'], activeMin: 10, totalMin: 10, steps: 4, dopamine: d(1, 2, 3, 1),
    note: 'Think cheesy grits, not sweet porridge. Hot sauce is a must.',
  },
  // Inspired by: Austin-style potato breakfast tacos and papas con chorizo; turkey seasoned like chorizo (smoked paprika, chili, cumin and a splash of vinegar).
  {
    id: 'turkey_chorizo_potato_tacos', name: 'Chorizo-spiced turkey, potato & egg breakfast tacos', slots: ['breakfast', 'lunch'], servings: 4,
    items: [{ food: 'ground_turkey', grams: 454 }, { food: 'potato', grams: 400 }, { food: 'onion', grams: 100 }, { food: 'garlic', grams: 9 }, { food: 'olive_oil', grams: 15 }, { food: 'egg', grams: 200 }, { food: 'corn_tortillas', grams: 300 }, { food: 'salsa', grams: 120 }, { food: 'cilantro', grams: 10 }, { food: 'lime', grams: 30 }],
    equipment: ['stove', 'skillet'], activeMin: 25, totalMin: 35, steps: 5, dopamine: d(2, 3, 2, 3), batch: true,
    note: 'The filling keeps 4 days. Reheat a scoop and warm 3 tortillas for a 3-minute breakfast.',
  },
  // Inspired by: copycat sous-vide egg bites (Once Upon a Chef, Little Spice Jar): blend with cottage cheese and bake in a water bath for a velvety, not rubbery, texture.
  {
    id: 'red_pepper_feta_egg_bites', name: 'Velvety red pepper & feta egg bites', slots: ['breakfast', 'snack'], servings: 4,
    items: [{ food: 'egg', grams: 600 }, { food: 'cottage_cheese', grams: 225 }, { food: 'feta', grams: 85 }, { food: 'bell_pepper', grams: 150 }, { food: 'spinach', grams: 60 }],
    equipment: ['oven', 'blender'], activeMin: 15, totalMin: 45, steps: 5, dopamine: d(0, 2, 1, 2), batch: true,
    note: 'Makes 12; a serving is 3. Fridge 4 days or freeze a month. Keto-friendly.',
  },
  // Inspired by: Indian egg/tofu bhurji and tofu-scramble tips from Rainbow Plant Life (crumble by hand into uneven curds, let it brown before stirring).
  {
    id: 'tofu_bhurji_peas', name: 'Tofu bhurji (spiced Indian scramble) with peas & warm tortillas', slots: ['breakfast', 'lunch'], servings: 2,
    items: [{ food: 'tofu', grams: 396 }, { food: 'onion', grams: 100 }, { food: 'garlic', grams: 6 }, { food: 'ginger', grams: 10 }, { food: 'olive_oil', grams: 12 }, { food: 'tomato', grams: 150 }, { food: 'peas', grams: 100 }, { food: 'lime', grams: 20 }, { food: 'cilantro', grams: 10 }, { food: 'corn_tortillas', grams: 100 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 20, steps: 4, dopamine: d(1, 3, 2, 2), batch: true,
    note: 'Vegan and gluten-free. Leftovers reheat well for tomorrow’s breakfast.',
  },
  // Inspired by: Cantonese-style chicken jook / congee (a rice-cooker and slow-cooker meal-prep favourite), topped for crunch the way congee shops do.
  {
    id: 'ginger_chicken_congee', name: 'Ginger-garlic chicken congee with crunchy cashews', slots: ['breakfast', 'lunch'], servings: 4,
    items: [{ food: 'cashews', grams: 30 }, { food: 'white_rice', grams: 150 }, { food: 'broth', grams: 946 }, { food: 'ginger', grams: 20 }, { food: 'garlic', grams: 9 }, { food: 'chicken_thigh', grams: 454 }, { food: 'spinach', grams: 100 }, { food: 'soy_sauce', grams: 15 }, { food: 'cilantro', grams: 10 }],
    equipment: ['stove', 'pot'], alt: ['slowcooker'], activeMin: 15, totalMin: 90, steps: 5, dopamine: d(2, 2, 3, 1), batch: true,
    note: 'Gentle, warming and easy on a low-appetite morning. It thickens in the fridge; loosen with water.',
  },
  // Inspired by: Colombian huevos pericos with maduros (sweet fried plantain), a paleo-friendly favourite on food blogs and Latin breakfast round-ups.
  {
    id: 'huevos_pericos_plantain', name: 'Huevos pericos with caramelized sweet plantain', slots: ['breakfast'], servings: 1,
    items: [{ food: 'plantains', grams: 100 }, { food: 'olive_oil', grams: 8 }, { food: 'onion', grams: 40 }, { food: 'tomato', grams: 100 }, { food: 'egg', grams: 150 }, { food: 'avocado', grams: 40 }, { food: 'lime', grams: 5 }, { food: 'cilantro', grams: 5 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 15, steps: 5, dopamine: d(1, 2, 3, 2),
    note: 'Paleo, dairy-free and gluten-free. Use a plantain with lots of black spots: it caramelizes like candy.',
  },

  // ── Sweet ────────────────────────────────────────────────
  // Inspired by: BBC Good Food's viral blended baked oats (blend to a batter, bake until cake-like) and Budget Bytes' blueberry banana baked oatmeal.
  {
    id: 'blueberry_banana_baked_oats', name: 'Blueberry-banana baked oats (cake for breakfast)', slots: ['breakfast'], servings: 1,
    items: [{ food: 'oats', grams: 50 }, { food: 'banana', grams: 60 }, { food: 'egg', grams: 50 }, { food: 'greek_yogurt', grams: 75 }, { food: 'milk', grams: 60 }, { food: 'cinnamon', grams: 1 }, { food: 'berries', grams: 60 }],
    equipment: ['oven', 'blender'], alt: ['airfryer', 'blender'], activeMin: 5, totalMin: 30, steps: 4, dopamine: d(1, 2, 2, 3),
    note: 'Blend it the night before and keep it in the fridge; bake straight from cold.',
  },
  // Inspired by: blender protein pancakes from Well Plated and Love and Lemons (rest the batter, don't over-blend, cover the pan so they puff), with cottage cheese for extra protein.
  {
    id: 'cottage_banana_oat_pancakes', name: 'Fluffy cottage cheese banana-oat blender pancakes', slots: ['breakfast'], servings: 1,
    items: [{ food: 'oats', grams: 50 }, { food: 'banana', grams: 80 }, { food: 'egg', grams: 100 }, { food: 'cottage_cheese', grams: 80 }, { food: 'cinnamon', grams: 1 }, { food: 'berries', grams: 75 }, { food: 'butter', grams: 5 }],
    equipment: ['blender', 'stove', 'skillet'], activeMin: 15, totalMin: 20, steps: 4, dopamine: d(1, 2, 1, 3),
    note: 'No protein powder needed: the eggs and cottage cheese give about 29 g protein.',
  },
  // Inspired by: the existing chia puddings' make-ahead jar format, given a peanut-butter-and-jelly twist and soy milk for a vegan, higher-protein version.
  {
    id: 'pbj_chia_pudding', name: 'PB&J chia pudding with smashed berry jam', slots: ['breakfast'], servings: 1,
    items: [{ food: 'soy_milk', grams: 200 }, { food: 'peanut_butter', grams: 16 }, { food: 'chia', grams: 30 }, { food: 'dates', grams: 12 }, { food: 'berries', grams: 100 }, { food: 'soy_yogurt', grams: 100 }],
    equipment: [], activeMin: 6, totalMin: 245, steps: 4, dopamine: d(0, 2, 2, 2), batch: true,
    note: 'Vegan. Make 3 jars on Sunday; they keep 4 days.',
  },
  // Inspired by: carrot cake overnight oats (Crowded Kitchen's cinnamon-yogurt swirl, Budget Bytes' carrot cake baked oatmeal).
  {
    id: 'carrot_cake_overnight_oats', name: 'Carrot cake overnight oats with cream cheese swirl', slots: ['breakfast'], servings: 1,
    items: [{ food: 'carrots', grams: 50 }, { food: 'dates', grams: 15 }, { food: 'walnuts', grams: 10 }, { food: 'oats', grams: 50 }, { food: 'milk', grams: 100 }, { food: 'greek_yogurt', grams: 100 }, { food: 'cinnamon', grams: 1 }, { food: 'cream_cheese', grams: 15 }],
    equipment: [], activeMin: 7, totalMin: 247, steps: 4, dopamine: d(1, 2, 2, 2), batch: true,
    note: 'Make the night before. Add the walnuts in the morning so they stay crunchy.',
  },
  // Inspired by: mango lassi flavours and tropical yogurt bowls; toasting the coconut and nuts is the cheap trick that makes it taste like dessert.
  {
    id: 'mango_coconut_lime_yogurt', name: 'Mango-coconut yogurt bowl with lime & toasted cashews', slots: ['breakfast', 'snack'], servings: 1,
    items: [{ food: 'mango', grams: 120 }, { food: 'lime', grams: 5 }, { food: 'coconut_flakes', grams: 10 }, { food: 'cashews', grams: 12 }, { food: 'greek_yogurt', grams: 200 }],
    equipment: ['microwave'], alt: ['stove', 'skillet'], activeMin: 4, totalMin: 5, steps: 3, dopamine: d(2, 2, 2, 2),
    note: 'For a vegan bowl, use soy yogurt and add a spoon of hemp seeds.',
  },
  // Inspired by: thick smoothie-bowl tips (frozen fruit, very little liquid, add it slowly; no ice) from Simple Green Smoothies and America's Test Kitchen.
  {
    id: 'pb_berry_smoothie_bowl', name: 'Thick PB-berry smoothie bowl with crunchy seeds', slots: ['breakfast'], servings: 1,
    items: [{ food: 'soy_milk', grams: 40 }, { food: 'soy_yogurt', grams: 150 }, { food: 'berries', grams: 120 }, { food: 'banana', grams: 100 }, { food: 'peanut_butter', grams: 16 }, { food: 'hemp_seeds', grams: 10 }, { food: 'pumpkin_seeds', grams: 10 }],
    equipment: ['blender'], activeMin: 5, totalMin: 5, steps: 3, dopamine: d(2, 2, 1, 3),
    note: 'Vegan. Keep sliced banana in the freezer so this is always 5 minutes away.',
  },
  // Inspired by: overnight French toast casseroles (Well Plated's lighter version; dry bread soaks custard without going mushy) with seasonal pumpkin spice.
  {
    id: 'pumpkin_french_toast_bake', name: 'Pumpkin spice French toast bake with pecan crunch', slots: ['breakfast'], servings: 5,
    items: [{ food: 'bread', grams: 340 }, { food: 'egg', grams: 300 }, { food: 'milk', grams: 300 }, { food: 'greek_yogurt', grams: 200 }, { food: 'pumpkin', grams: 212 }, { food: 'cinnamon', grams: 4 }, { food: 'honey', grams: 30 }, { food: 'pecans', grams: 40 }, { food: 'butter', grams: 10 }],
    equipment: ['oven'], activeMin: 15, totalMin: 110, steps: 5, dopamine: d(2, 3, 2, 3), batch: true,
    note: 'Assemble the night before and bake in the morning. Freeze the other half-can of pumpkin for pumpkin oats.',
  },

  // ── Make-ahead ───────────────────────────────────────────
  // Inspired by: Budget Bytes' apple cinnamon and blueberry banana baked oatmeals (a reader says they've made one weekly for years) and Good Cheap Eats' tip to bake it in a pan and cut squares for the week.
  {
    id: 'apple_pie_baked_oatmeal', name: 'Apple pie baked oatmeal squares', slots: ['breakfast', 'snack'], servings: 6,
    items: [{ food: 'apple', grams: 360 }, { food: 'walnuts', grams: 60 }, { food: 'egg', grams: 150 }, { food: 'milk', grams: 500 }, { food: 'greek_yogurt', grams: 300 }, { food: 'honey', grams: 40 }, { food: 'butter', grams: 15 }, { food: 'oats', grams: 300 }, { food: 'cinnamon', grams: 5 }],
    equipment: ['oven'], activeMin: 15, totalMin: 60, steps: 5, dopamine: d(1, 2, 1, 2), batch: true,
    note: 'Keeps 5 days in the fridge; squares freeze well. Good cold, too.',
  },
  // Inspired by: freezer burritos, the most-mentioned make-ahead breakfast in meal-prep round-ups (Instacart, Food Republic), made vegan with a browned tofu scramble; cool the filling before rolling so they don't go soggy.
  {
    id: 'smoky_tofu_sweet_potato_burritos', name: 'Smoky tofu, sweet potato & black bean freezer burritos', slots: ['breakfast', 'lunch'], servings: 6,
    items: [{ food: 'sweet_potato', grams: 454 }, { food: 'olive_oil', grams: 15 }, { food: 'onion', grams: 100 }, { food: 'tofu', grams: 396 }, { food: 'nutritional_yeast', grams: 10 }, { food: 'black_beans', grams: 250 }, { food: 'spinach', grams: 60 }, { food: 'lime', grams: 15 }, { food: 'salsa', grams: 150 }, { food: 'tortillas', grams: 270 }],
    equipment: ['oven', 'sheetpan', 'stove', 'skillet'], alt: ['airfryer', 'stove', 'skillet'], activeMin: 25, totalMin: 45, steps: 5, dopamine: d(1, 2, 2, 2), batch: true,
    note: 'Vegan. Freeze up to 3 months; microwave 2–3 minutes from frozen.',
  },
  // Inspired by: cream cheese "keto pancakes", among Diet Doctor's most-viewed keto breakfasts, made with almond flour.
  {
    id: 'keto_cream_cheese_pancakes', name: 'Keto almond flour cream cheese pancakes with berries', slots: ['breakfast'], servings: 1,
    items: [{ food: 'egg', grams: 100 }, { food: 'cream_cheese', grams: 30 }, { food: 'almond_flour', grams: 40 }, { food: 'berries', grams: 40 }, { food: 'butter', grams: 5 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 15, steps: 4, dopamine: d(1, 2, 2, 2),
    note: 'About 10 g net carbs. Keep them small (3 inches): they’re more delicate than flour pancakes.',
  },
]

export const METHODS_BREAKFAST: Record<string, string[]> = {
  smoky_shakshuka_feta: [
    'Thinly slice the onion and bell pepper and mince the garlic.',
    'Heat the olive oil in a large skillet over medium heat. Cook the onion and pepper, stirring now and then, until soft and browned at the edges, 8–10 minutes. Add the garlic, 1 tsp cumin, 1 tsp smoked paprika and ½ tsp red pepper flakes and stir for 1 minute until fragrant.',
    'Pour in the tomatoes with a big pinch of salt and simmer until thick enough that a spoon dragged through leaves a clear trail, 8–10 minutes.',
    'Make 4 hollows and crack an egg into each. Spoon a little of the simmering tomato sauce over the whites (not the yolks) so they set faster, cover, and cook on low until the whites are completely set and the yolks have thickened, 6–8 minutes (2–3 minutes longer for firm yolks).',
    'Toast the bread. Crumble the feta over the pan, scatter the cilantro, add a squeeze of lemon and plenty of black pepper, and dip the toast.',
  ],
  kimchi_egg_rice_bowl: [
    'Cook the rice in the rice cooker (or a small pot, about 18 minutes), or warm leftover rice. Microwave or boil the edamame for 2 minutes.',
    'Slice the cucumber thin and toss it with a pinch of salt and a splash of rice vinegar.',
    'Heat the olive oil in a skillet over medium-high heat. Fry the eggs until the edges are lacy and crisp and the whites are fully set, 2–3 minutes (cover for 1 minute for firmer yolks).',
    'Pile the hot rice in a bowl, slide the eggs on top and drizzle with the soy sauce. Add the kimchi, edamame and cucumber, sprinkle with red pepper flakes or sriracha, then break the yolks and mix everything together.',
  ],
  chilaquiles_rojos_eggs: [
    'Cut the corn tortillas into 6 wedges each, toss with half the olive oil and a pinch of salt, and air-fry at 380°F for 6–8 minutes, shaking halfway, until golden and crisp (or bake on a sheet pan at 400°F for 10–12 minutes).',
    'Meanwhile, mince the garlic and simmer it in a skillet with the salsa, canned tomatoes, drained black beans, ½ tsp cumin and ½ tsp chili powder over medium heat until slightly thickened, about 5 minutes. Tip into a shallow bowl.',
    'Wipe the skillet, add the remaining oil over medium-high heat, and fry the eggs until the whites are set and the edges crisp, about 3 minutes.',
    'Stir half the lime juice and a pinch of salt into the Greek yogurt for a quick crema. Finely dice the onion.',
    'Fold the chips into the warm sauce for 30–60 seconds, just until coated but still crunchy at the edges. Top with the eggs, crema, onion, cilantro and the rest of the lime.',
  ],
  lox_style_salmon_toast: [
    'Slice the onion paper-thin, cover with 2 tbsp vinegar and a pinch of salt, and leave 5 minutes to quick-pickle.',
    'Toast the bread. Stir the cream cheese with the lemon juice, ½ tsp dried dill and a pinch of garlic powder.',
    'Drain the salmon and flake it with a fork, mashing in the soft bones, with black pepper and ¼ tsp onion powder.',
    'Spread the cream cheese on the toast and layer on sliced cucumber, sliced tomato, the salmon and the drained pickled onion. Finish with more dill and pepper.',
  ],
  cottage_tomato_toast: [
    'Toast the bread and rub the cut side of a halved garlic clove over the hot toast.',
    'Slice the tomato, sprinkle with salt and let it sit 1–2 minutes while you spread the cottage cheese on the toast.',
    'Top with the arugula and tomato, drizzle with the olive oil and balsamic, and finish with lots of black pepper, a pinch of oregano and red pepper flakes.',
  ],
  cheddar_savory_oats_egg: [
    'Heat half the olive oil in a small pot over medium heat. Toast the oats, stirring, until nutty and fragrant, about 2 minutes; add the minced garlic for 30 seconds.',
    'Pour in the broth (it will sputter) with ½ tsp smoked paprika and simmer, stirring, until thick and creamy, 4–5 minutes. Stir in the spinach and cheddar until melted and season with black pepper.',
    'Meanwhile, heat the remaining oil in a skillet over medium-high heat and fry the eggs until the whites are set and the edges are brown and crisp, 2–3 minutes.',
    'Spoon the oats into a bowl, top with the eggs and shake over plenty of hot sauce. Break the yolk into the oats as you eat.',
  ],
  turkey_chorizo_potato_tacos: [
    'Dice the potatoes into ½-inch cubes, dice the onion and mince the garlic. Mix the turkey with 2 tsp smoked paprika, 1 tbsp chili powder, 1 tsp cumin, 1 tsp oregano, 1 tbsp cider vinegar and 1 tsp salt.',
    'Heat the olive oil in a large skillet over medium-high heat. Add the potatoes, cover, and cook 8–10 minutes, stirring a few times, until tender and browned.',
    'Add the onion and turkey, breaking it up, and cook until browned with crispy bits and cooked to 165°F, 7–8 minutes. Stir in the garlic for 1 minute.',
    'Push the filling to one side, crack the eggs into the empty space and scramble them gently until fully set, about 2 minutes, then fold everything together.',
    'Warm the tortillas in a dry pan, about 30 seconds a side. Fill with the hash and top with salsa, cilantro and a squeeze of lime. Store leftover filling up to 4 days and reheat to 165°F.',
  ],
  red_pepper_feta_egg_bites: [
    'Heat the oven to 325°F. Set a baking dish on the lowest rack and pour in about 1 inch of boiling water. Spray a 12-cup muffin tin.',
    'Finely dice the bell pepper and chop the spinach. Divide them and the crumbled feta between the cups.',
    'Blend the eggs, cottage cheese, ½ tsp garlic powder, a dash of hot sauce and black pepper for 20–30 seconds, just until smooth (not foamy).',
    'Pour the egg mix over the fillings, about ¾ full. Bake on the middle rack, above the water, until the centers are set and spring back when pressed (160°F), 25–30 minutes.',
    'Cool 5 minutes, then loosen with a knife. Refrigerate up to 4 days or freeze; reheat 45–60 seconds in the microwave until hot.',
  ],
  tofu_bhurji_peas: [
    'Pat the tofu dry and crumble it by hand into uneven curds. Dice the onion and tomato; mince the garlic and ginger.',
    'Heat the olive oil in a skillet over medium-high heat. Cook the onion until golden at the edges, 4–5 minutes, then add the garlic, ginger, 1 tsp cumin, ½ tsp turmeric and ½ tsp chili powder and stir for 30–60 seconds until fragrant.',
    'Add the tofu, spread it out and leave it 2 minutes to brown before stirring. Add the tomato, peas, 1 tsp garam masala and salt, and cook until the tomato softens and the peas are hot, 4–5 minutes.',
    'Off the heat, squeeze in the lime and add the cilantro. Warm the tortillas in a dry pan for 30 seconds a side and use them to scoop. Reheat leftovers until steaming (165°F).',
  ],
  ginger_chicken_congee: [
    'Toast the cashews in a dry pot over medium heat until golden, about 3 minutes, then chop and set aside. Rinse the rice; cut the ginger into thin matchsticks and smash the garlic.',
    'Add the rice, broth, 4 cups water, ginger, garlic and whole chicken thighs to the pot. Bring to a boil, then simmer on low, partly covered, stirring every 15 minutes, until the rice breaks down into a creamy porridge and the chicken reaches 165°F, 60–75 minutes. (Slow cooker: low for 6–8 hours.)',
    'Lift out the chicken, shred it with two forks and return it. Stir in the spinach until wilted, then season with the soy sauce, black pepper and a little water if it’s too thick.',
    'Ladle into bowls and top with the cashews, cilantro, a few drops of rice vinegar and sriracha if you like.',
    'Refrigerate leftovers up to 4 days; they thicken, so reheat with a splash of water until steaming (165°F).',
  ],
  huevos_pericos_plantain: [
    'Peel the plantain and slice it on the diagonal about ½ inch thick. Dice the onion and tomato.',
    'Heat half the olive oil in a skillet over medium heat and fry the plantain until deep golden and caramelized, 3–4 minutes a side. Salt lightly and move to a plate.',
    'Add the remaining oil and the onion and cook until soft, about 3 minutes. Add the tomato, a pinch of cumin and salt and cook until saucy, 2–3 minutes.',
    'Beat the eggs with a pinch of salt, pour them in and stir gently over medium-low heat until softly set with no runny egg left, 2–3 minutes.',
    'Serve with the plantain and sliced avocado squeezed with lime and salted, and scatter the cilantro on top.',
  ],
  blueberry_banana_baked_oats: [
    'Heat the oven to 375°F (or the air fryer to 350°F). Blend the oats to a coarse flour, then add the banana, egg, Greek yogurt, milk, cinnamon, ½ tsp baking powder, ½ tsp vanilla and a pinch of salt and blend until smooth.',
    'Pour into a sprayed oven-safe dish or large ramekin and press the berries into the top.',
    'Bake until risen and golden and a knife in the center comes out clean, 20–25 minutes (12–15 minutes in the air fryer).',
    'Rest 3 minutes so the middle firms up, then eat from the dish.',
  ],
  cottage_banana_oat_pancakes: [
    'Blend the oats, half the banana, the eggs, cottage cheese, cinnamon, 1 tsp baking powder, ½ tsp vanilla and a pinch of salt just until smooth. Let the batter rest 5–10 minutes to thicken.',
    'Warm the berries in a nonstick skillet over medium heat until juicy, about 2 minutes, mash lightly with a fork and tip into a bowl. Slice the rest of the banana.',
    'Wipe the pan, set it over medium-low heat and swirl in a little butter. Pour in ¼-cup scoops, cover, and cook until the edges look set and bubbles appear, 2–3 minutes; flip and cook 1–2 minutes more until cooked through. Repeat with the remaining butter.',
    'Stack the pancakes and top with the warm berries and sliced banana.',
  ],
  pbj_chia_pudding: [
    'In a jar, whisk the soy milk with the peanut butter, ½ tsp vanilla and a pinch of salt until smooth.',
    'Finely chop the dates and stir them in with the chia seeds. Wait 5 minutes and stir again so no clumps form.',
    'Cover and refrigerate at least 4 hours or overnight, until thick and spoonable.',
    'Mash the thawed berries into a rough jam. Top the pudding with the soy yogurt and the berry jam and swirl.',
  ],
  carrot_cake_overnight_oats: [
    'Finely grate the carrots and chop the dates and walnuts.',
    'In a jar, stir together the oats, carrot, dates, milk, three-quarters of the Greek yogurt, the cinnamon, ¼ tsp ground ginger, ½ tsp vanilla and a pinch of salt.',
    'Beat the cream cheese with the remaining yogurt until smooth and spoon it on top as the "frosting." Cover and refrigerate at least 4 hours or overnight.',
    'In the morning, scatter over the walnuts and eat cold, or microwave 1 minute if you like it warm.',
  ],
  mango_coconut_lime_yogurt: [
    'Microwave the frozen mango for 45–60 seconds until just thawed, then squeeze the lime over it.',
    'Spread the coconut flakes and cashews on a plate and microwave in 30-second bursts, stirring each time, until golden and fragrant, 1–2 minutes (or toast in a dry skillet over medium heat for 2–3 minutes). Watch closely: coconut burns fast.',
    'Spoon the Greek yogurt into a bowl and top with the mango and its juices, the toasted coconut and cashews, and a tiny pinch of salt.',
  ],
  pb_berry_smoothie_bowl: [
    'Pour the soy milk into the blender, then add the soy yogurt, frozen berries and frozen banana slices.',
    'Blend on low, stopping to scrape down and push the fruit toward the blades, until thick like soft-serve, 1–2 minutes. Add another splash of soy milk only if it won’t move.',
    'Spoon into a bowl and top with the peanut butter, hemp seeds and pumpkin seeds.',
  ],
  pumpkin_french_toast_bake: [
    'Cut the bread into 1-inch cubes. If it’s fresh, dry the cubes in a 300°F oven for 10 minutes so they soak up custard without going mushy. Spray a 9x13-inch baking dish.',
    'Whisk the eggs, milk, Greek yogurt, pumpkin, cinnamon, ½ tsp ground ginger, 2 tsp vanilla, half the honey and a pinch of salt until smooth.',
    'Spread the bread in the dish, pour over the custard and press down so every cube is soaked. Cover and refrigerate at least 1 hour or overnight.',
    'Heat the oven to 350°F. Chop the pecans and toss them with the melted butter and remaining honey, then scatter over the top.',
    'Bake covered for 20 minutes, then uncovered for 20–25 minutes more, until puffed and golden and a knife in the center comes out clean with no wet custard (160°F). Rest 5 minutes. Reheat leftover portions to 165°F.',
  ],
  apple_pie_baked_oatmeal: [
    'Heat the oven to 375°F and spray an 8- or 9-inch square baking dish. Dice the apples (peel on) and chop the walnuts.',
    'Whisk the eggs, milk, Greek yogurt, honey, melted butter, 1 tsp vanilla and ½ tsp salt. In another bowl mix the oats, cinnamon, 1½ tsp baking powder and ¼ tsp ground ginger, then stir in the wet mix and most of the apples.',
    'Pour into the dish and scatter the rest of the apples and the walnuts on top.',
    'Bake until golden at the edges and set in the middle (a knife comes out without wet batter), 40–45 minutes. Cool 10 minutes, then cut into 6 squares.',
    'Refrigerate up to 5 days or freeze. Eat cold or microwave 45–60 seconds until hot.',
  ],
  smoky_tofu_sweet_potato_burritos: [
    'Heat the oven to 425°F. Dice the sweet potatoes into ½-inch cubes, toss with half the olive oil, 1 tsp smoked paprika, ½ tsp cumin and salt, and roast on a sheet pan until tender and browned at the edges, 20–25 minutes (or air-fry at 400°F for about 15 minutes).',
    'Meanwhile, dice the onion and cook it in the remaining oil in a skillet over medium-high heat for 4 minutes. Crumble in the tofu, leave it 2 minutes to brown, then stir in 1 tsp chili powder, ½ tsp garlic powder, a pinch of turmeric, the nutritional yeast and salt. Cook until golden and fairly dry, 6–8 minutes.',
    'Stir in the drained black beans and spinach until the spinach wilts, then fold in the sweet potatoes, lime juice and salsa.',
    'Let the filling cool for 10 minutes (steam makes frozen burritos soggy), then divide it between the tortillas and roll up tightly, tucking in the sides.',
    'Eat now, or wrap each in foil and freeze. To reheat, unwrap, wrap in a damp paper towel and microwave 2–3 minutes, turning halfway, until steaming in the center (165°F).',
  ],
  keto_cream_cheese_pancakes: [
    'Whisk the eggs with the softened cream cheese until smooth, then whisk in the almond flour, ½ tsp baking powder, ½ tsp vanilla and a pinch of salt. Rest 3 minutes.',
    'Warm the berries in a nonstick skillet over medium heat until juicy, about 2 minutes; mash lightly and set aside.',
    'Melt a little of the butter in the skillet over medium-low heat. Spoon in 3-inch pancakes and cook until the edges are set and the bottoms golden, 2–3 minutes, then flip gently and cook 1–2 minutes more until cooked through. Repeat with the remaining butter.',
    'Serve with the warm berries spooned over.',
  ],
}

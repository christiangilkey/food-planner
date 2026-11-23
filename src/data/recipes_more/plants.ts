// Vegetarian and vegan mains, soups, salads and bowls.
// Each recipe is original: inspired by well-loved dishes, written in this app's own words.
// Ingredient grams are for the whole recipe; one plan entry is one serving.
import type { Recipe } from '../../types'

const d = (crunch: number, flavor: number, novelty: number, fun: number) => ({ crunch, flavor, novelty, fun })

export const RECIPES_PLANTS: Recipe[] = [
  // ── Tofu & tempeh ──────────────────────────────────────────
  // Inspired by: the "tear your tofu" tip (America's Test Kitchen, Epicurious) and air-fryer tofu posts on r/EatCheapAndHealthy; a crunchy slaw instead of rice.
  {
    id: 'crispy_tofu_peanut_slaw', name: 'Crispy torn tofu with peanut-lime crunch slaw', slots: ['dinner', 'lunch'], servings: 2,
    items: [{ food: 'tofu', grams: 396 }, { food: 'olive_oil', grams: 10 }, { food: 'soy_sauce', grams: 20 }, { food: 'cabbage', grams: 250 }, { food: 'carrots', grams: 100 }, { food: 'bell_pepper', grams: 150 }, { food: 'cilantro', grams: 15 }, { food: 'peanut_butter', grams: 40 }, { food: 'lime', grams: 45 }, { food: 'ginger', grams: 5 }, { food: 'garlic', grams: 3 }],
    equipment: ['airfryer'], alt: ['oven', 'sheetpan'], activeMin: 15, totalMin: 30, steps: 4, dopamine: d(3, 3, 2, 2),
    note: 'Vegan. Torn (not cut) tofu has more rough edges, so it gets crunchier.',
  },
  // Inspired by: Minimalist Baker's jerk tofu & roasted plantain bowls and Jamaican rice and peas.
  {
    id: 'jerk_tofu_plantain_bowls', name: 'Jerk-spiced tofu & plantain bowls with coconut rice and beans', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'tofu', grams: 396 }, { food: 'plantains', grams: 340 }, { food: 'coconut_aminos', grams: 30 }, { food: 'olive_oil', grams: 20 }, { food: 'garlic', grams: 6 }, { food: 'ginger', grams: 10 }, { food: 'white_rice', grams: 150 }, { food: 'coconut_milk', grams: 200 }, { food: 'kidney_beans', grams: 250 }, { food: 'mango', grams: 150 }, { food: 'cucumber', grams: 150 }, { food: 'lime', grams: 30 }, { food: 'cilantro', grams: 10 }],
    equipment: ['oven', 'sheetpan', 'stove', 'pot'], alt: ['airfryer', 'ricecooker'], activeMin: 25, totalMin: 45, steps: 5, dopamine: d(2, 3, 3, 3), batch: true,
    note: 'Vegan and gluten-free. Use ripe plantains (yellow with black spots) so they caramelise. Keep the mango salsa separate for leftovers.',
  },
  // Inspired by: the sofritas burrito bowl recipes Redditors share on r/EatCheapAndHealthy (a copycat of Chipotle's braised tofu).
  {
    id: 'sofritas_tofu_tacos', name: 'Sofritas-style smoky tofu tacos with lime slaw', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'tofu', grams: 396 }, { food: 'olive_oil', grams: 15 }, { food: 'onion', grams: 100 }, { food: 'garlic', grams: 6 }, { food: 'salsa', grams: 150 }, { food: 'cabbage', grams: 200 }, { food: 'lime', grams: 30 }, { food: 'cilantro', grams: 10 }, { food: 'corn_tortillas', grams: 300 }, { food: 'avocado', grams: 136 }],
    equipment: ['stove', 'skillet'], activeMin: 25, totalMin: 30, steps: 4, dopamine: d(2, 3, 2, 3), batch: true,
    note: 'Vegan and gluten-free. The sofritas keep 4 days; warm the tortillas fresh.',
  },
  // Inspired by: Japanese home-style curry (kare raisu); grated apple and slow-cooked onion stand in for the boxed roux.
  {
    id: 'japanese_tofu_curry', name: 'Japanese-style curry with golden tofu, potatoes & carrots', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'white_rice', grams: 200 }, { food: 'tofu', grams: 396 }, { food: 'olive_oil', grams: 20 }, { food: 'onion', grams: 250 }, { food: 'garlic', grams: 6 }, { food: 'ginger', grams: 10 }, { food: 'potato', grams: 350 }, { food: 'carrots', grams: 200 }, { food: 'apple', grams: 120 }, { food: 'soy_sauce', grams: 20 }, { food: 'veg_broth', grams: 500 }, { food: 'peas', grams: 100 }],
    equipment: ['stove', 'pot'], activeMin: 25, totalMin: 45, steps: 5, dopamine: d(1, 3, 2, 2), batch: true,
    note: 'Vegan. Mild and a little sweet, so it suits kids; add sriracha at the table for heat.',
  },
  // Inspired by: Greek village salad (horiatiki) and the lemon-and-oregano marinated tofu "feta" many vegan cooks use in it.
  {
    id: 'greek_tofu_feta_bowls', name: 'Greek salad couscous bowls with lemon-oregano tofu feta', slots: ['lunch', 'dinner'], servings: 4,
    items: [{ food: 'tofu', grams: 396 }, { food: 'lemon', grams: 45 }, { food: 'olive_oil', grams: 30 }, { food: 'nutritional_yeast', grams: 8 }, { food: 'couscous', grams: 150 }, { food: 'cucumber', grams: 250 }, { food: 'tomato', grams: 300 }, { food: 'onion', grams: 50 }, { food: 'olives', grams: 40 }, { food: 'chickpeas', grams: 250 }],
    equipment: ['microwave'], activeMin: 15, totalMin: 15, steps: 4, dopamine: d(2, 2, 3, 2), batch: true,
    note: 'Vegan. The tofu feta gets better after a night in the fridge. Add the tomatoes fresh if packing lunches.',
  },
  // Inspired by: Love and Lemons' vegetarian bibimbap; tempeh simmered first (a common tip to soften its bitter edge).
  {
    id: 'tempeh_bibimbap', name: 'Sticky tempeh bibimbap with kimchi & a fried egg', slots: ['dinner', 'lunch'], servings: 2,
    items: [{ food: 'white_rice', grams: 120 }, { food: 'tempeh', grams: 227 }, { food: 'soy_sauce', grams: 15 }, { food: 'honey', grams: 15 }, { food: 'garlic', grams: 6 }, { food: 'olive_oil', grams: 10 }, { food: 'spinach', grams: 140 }, { food: 'tahini', grams: 10 }, { food: 'carrots', grams: 120 }, { food: 'cucumber', grams: 150 }, { food: 'egg', grams: 100 }, { food: 'kimchi', grams: 100 }],
    equipment: ['stove', 'skillet', 'pot'], alt: ['stove', 'skillet', 'ricecooker'], activeMin: 25, totalMin: 35, steps: 5, dopamine: d(2, 3, 3, 3),
    note: 'Vegetarian (many kimchi brands contain fish sauce; check the label). Mix everything together in the bowl before eating.',
  },
  // Inspired by: smoky baked tempeh "bacon" recipes (Nora Cooks, Live Eat Learn) and the classic BLT, as a bowl.
  {
    id: 'tempeh_blt_bowls', name: 'Smoky tempeh BLT bowls with dill ranch', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'quinoa', grams: 80 }, { food: 'tempeh', grams: 227 }, { food: 'soy_sauce', grams: 15 }, { food: 'balsamic', grams: 10 }, { food: 'olive_oil', grams: 10 }, { food: 'soy_yogurt', grams: 120 }, { food: 'garlic', grams: 3 }, { food: 'lemon', grams: 15 }, { food: 'romaine', grams: 150 }, { food: 'tomato', grams: 200 }, { food: 'avocado', grams: 68 }],
    equipment: ['stove', 'skillet', 'pot'], alt: ['stove', 'skillet', 'ricecooker'], activeMin: 20, totalMin: 25, steps: 4, dopamine: d(3, 3, 2, 2),
    note: 'Vegan. Smoked paprika does the "bacon" work, so don\'t swap in plain paprika.',
  },

  // ── Stews, curries & soups ───────────────────────────────────
  // Inspired by: misir wot (Ethiopian red lentils) with an atakilt-style cabbage side; America's Test Kitchen's berbere-free spice blend idea.
  {
    id: 'misir_wot_lentils', name: 'Ethiopian-style red lentils with turmeric cabbage & potatoes', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'onion', grams: 300 }, { food: 'olive_oil', grams: 30 }, { food: 'garlic', grams: 12 }, { food: 'ginger', grams: 15 }, { food: 'lentils', grams: 300 }, { food: 'canned_tomatoes', grams: 411 }, { food: 'lemon', grams: 15 }, { food: 'potato', grams: 300 }, { food: 'carrots', grams: 200 }, { food: 'cabbage', grams: 400 }],
    equipment: ['stove', 'pot', 'skillet'], activeMin: 25, totalMin: 45, steps: 4, dopamine: d(0, 3, 3, 2), batch: true,
    note: 'Vegan and gluten-free. The spice mix stands in for berbere; add more chili if you like heat. Freezes well.',
  },
  // Inspired by: West African maafe-style peanut stews (Minimalist Baker's 1-pot chickpea peanut stew, many slow-cooker versions); red lentils thicken it and add protein.
  {
    id: 'slowcooker_peanut_stew', name: 'Slow-cooker peanut stew with chickpeas, sweet potato & kale', slots: ['dinner', 'lunch'], servings: 5,
    items: [{ food: 'onion', grams: 150 }, { food: 'sweet_potato', grams: 454 }, { food: 'garlic', grams: 12 }, { food: 'ginger', grams: 15 }, { food: 'lentils', grams: 150 }, { food: 'chickpeas', grams: 500 }, { food: 'canned_tomatoes', grams: 411 }, { food: 'veg_broth', grams: 500 }, { food: 'peanut_butter', grams: 96 }, { food: 'kale', grams: 150 }, { food: 'lime', grams: 30 }, { food: 'cilantro', grams: 10 }],
    equipment: ['slowcooker'], alt: ['stove', 'pot'], activeMin: 15, totalMin: 250, steps: 4, dopamine: d(0, 3, 3, 1), batch: true,
    note: 'Vegan and gluten-free. On the stove: simmer covered 35 minutes instead. Freezes well.',
  },
  // Inspired by: Roman pasta e ceci (Smitten Kitchen, America's Test Kitchen); mashing some chickpeas makes it creamy with no cream.
  {
    id: 'pasta_e_ceci', name: 'Pasta e ceci with kale & rosemary', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'olive_oil', grams: 25 }, { food: 'onion', grams: 150 }, { food: 'carrots', grams: 100 }, { food: 'celery', grams: 100 }, { food: 'garlic', grams: 12 }, { food: 'chickpeas', grams: 500 }, { food: 'canned_tomatoes', grams: 411 }, { food: 'pasta', grams: 200 }, { food: 'kale', grams: 150 }, { food: 'parmesan', grams: 40 }, { food: 'lemon', grams: 15 }],
    equipment: ['stove', 'pot'], activeMin: 20, totalMin: 35, steps: 4, dopamine: d(0, 3, 2, 1), batch: true,
    note: 'Vegetarian. It thickens in the fridge; loosen with a splash of water when reheating.',
  },
  // Inspired by: Louisiana Monday red beans and rice, made meat-free with smoked paprika for the smokiness.
  {
    id: 'red_beans_rice', name: 'Louisiana-style smoky red beans & rice', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'brown_rice', grams: 200 }, { food: 'olive_oil', grams: 20 }, { food: 'onion', grams: 150 }, { food: 'bell_pepper', grams: 150 }, { food: 'celery', grams: 150 }, { food: 'garlic', grams: 12 }, { food: 'kidney_beans', grams: 750 }, { food: 'cilantro', grams: 10 }],
    equipment: ['stove', 'pot'], alt: ['slowcooker', 'ricecooker'], activeMin: 15, totalMin: 45, steps: 4, dopamine: d(0, 3, 2, 1), batch: true,
    note: 'Vegan and gluten-free. Even better the next day. Slow cooker: everything but the rice on low 6 hours.',
  },
  // Inspired by: Indian anda (egg) curry, a cheap, everyday protein curry. Scoring the eggs lets the masala soak in.
  {
    id: 'egg_curry_peas', name: 'Masala egg curry with peas & spinach', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'white_rice', grams: 200 }, { food: 'egg', grams: 400 }, { food: 'olive_oil', grams: 20 }, { food: 'onion', grams: 250 }, { food: 'garlic', grams: 9 }, { food: 'ginger', grams: 15 }, { food: 'canned_tomatoes', grams: 411 }, { food: 'greek_yogurt', grams: 100 }, { food: 'peas', grams: 200 }, { food: 'spinach', grams: 100 }, { food: 'lemon', grams: 15 }, { food: 'cilantro', grams: 10 }],
    equipment: ['stove', 'pot', 'skillet'], activeMin: 25, totalMin: 35, steps: 4, dopamine: d(0, 3, 2, 2), batch: true,
    note: 'Vegetarian and gluten-free. Keeps 3 days; reheat until steaming (165°F).',
  },
  // Inspired by: Andalusian espinacas con garbanzos (America's Test Kitchen, Moro): fried bread and garlic mashed into the sauce.
  {
    id: 'espinacas_garbanzos', name: 'Spanish spinach & chickpeas with garlic-bread sauce', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'olive_oil', grams: 30 }, { food: 'bread', grams: 64 }, { food: 'garlic', grams: 12 }, { food: 'spinach', grams: 283 }, { food: 'chickpeas', grams: 500 }],
    equipment: ['stove', 'skillet'], activeMin: 15, totalMin: 15, steps: 3, dopamine: d(1, 3, 3, 2), batch: true,
    note: 'Vegan, 15 minutes, five ingredients. The fried-bread paste is what makes the sauce silky and garlicky.',
  },

  // ── Comfort food ─────────────────────────────────────────────
  // Inspired by: highly rated lentil shepherd's pies (Rainbow Plant Life, From My Bowl), with browned mushrooms for meaty depth.
  {
    id: 'lentil_shepherds_pie', name: 'Mushroom & lentil shepherd\'s pie', slots: ['dinner', 'lunch'], servings: 5,
    items: [{ food: 'potato', grams: 1000 }, { food: 'soy_milk', grams: 150 }, { food: 'nutritional_yeast', grams: 20 }, { food: 'olive_oil', grams: 35 }, { food: 'mushrooms', grams: 454 }, { food: 'onion', grams: 200 }, { food: 'carrots', grams: 200 }, { food: 'garlic', grams: 12 }, { food: 'lentils', grams: 250 }, { food: 'veg_broth', grams: 500 }, { food: 'coconut_aminos', grams: 20 }, { food: 'peas', grams: 200 }, { food: 'balsamic', grams: 15 }],
    equipment: ['stove', 'pot', 'skillet', 'oven'], activeMin: 35, totalMin: 70, steps: 4, dopamine: d(1, 3, 2, 2), batch: true,
    note: 'Vegan and gluten-free. Freezes well in portions; reheat until piping hot (165°F).',
  },
  // Inspired by: Love and Lemons' easy veggie-and-bean enchiladas; a quick homemade tomato-chili sauce instead of a can.
  {
    id: 'pinto_zucchini_enchiladas', name: 'Pinto bean & zucchini enchiladas with lime crema', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'canned_tomatoes', grams: 411 }, { food: 'garlic', grams: 9 }, { food: 'olive_oil', grams: 15 }, { food: 'onion', grams: 150 }, { food: 'zucchini', grams: 300 }, { food: 'corn', grams: 150 }, { food: 'pinto_beans', grams: 500 }, { food: 'corn_tortillas', grams: 300 }, { food: 'cheddar', grams: 100 }, { food: 'greek_yogurt', grams: 150 }, { food: 'lime', grams: 30 }, { food: 'cilantro', grams: 10 }],
    equipment: ['oven', 'stove', 'skillet'], activeMin: 30, totalMin: 50, steps: 4, dopamine: d(1, 3, 2, 3), batch: true,
    note: 'Vegetarian and gluten-free. Freeze the baked tray in portions; reheat to 165°F.',
  },
  // Inspired by: Love and Lemons' chickpea shawarma wraps and Ottolenghi-style garlicky yogurt; dill pickles stand in for pickled turnips.
  {
    id: 'chickpea_shawarma_wraps', name: 'Crispy chickpea shawarma wraps with garlic yogurt', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'chickpeas', grams: 500 }, { food: 'onion', grams: 100 }, { food: 'olive_oil', grams: 20 }, { food: 'cinnamon', grams: 1 }, { food: 'greek_yogurt', grams: 170 }, { food: 'garlic', grams: 6 }, { food: 'lemon', grams: 30 }, { food: 'tomato', grams: 150 }, { food: 'cucumber', grams: 150 }, { food: 'romaine', grams: 90 }, { food: 'pickles', grams: 40 }, { food: 'tortillas', grams: 135 }],
    equipment: ['oven', 'sheetpan'], alt: ['airfryer'], activeMin: 15, totalMin: 30, steps: 4, dopamine: d(3, 3, 2, 3),
    note: 'Vegetarian. Drying the chickpeas well before roasting is what makes them crisp.',
  },
  // Inspired by: bar-menu buffalo cauliflower bites, turned into a big salad with a Greek-yogurt ranch (the yogurt-for-mayo swap high-protein cooks love).
  {
    id: 'buffalo_cauli_chickpea_salad', name: 'Buffalo cauliflower & chickpea salad with yogurt ranch', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'cauliflower', grams: 340 }, { food: 'chickpeas', grams: 250 }, { food: 'olive_oil', grams: 15 }, { food: 'butter', grams: 10 }, { food: 'greek_yogurt', grams: 200 }, { food: 'garlic', grams: 3 }, { food: 'lemon', grams: 15 }, { food: 'romaine', grams: 200 }, { food: 'celery', grams: 100 }, { food: 'carrots', grams: 100 }],
    equipment: ['airfryer', 'microwave'], alt: ['oven', 'sheetpan', 'microwave'], activeMin: 15, totalMin: 25, steps: 4, dopamine: d(3, 3, 2, 3),
    note: 'Vegetarian and gluten-free. Frozen cauliflower works; give it room in the basket so it roasts instead of steams.',
  },
  // Inspired by: Kenji López-Alt's tip (via Serious Eats) to oven-dry the beans first so veggie burgers aren't mushy; Love and Lemons' black bean burger.
  {
    id: 'black_bean_quinoa_burgers', name: 'Smoky black bean & quinoa burgers', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'quinoa', grams: 80 }, { food: 'black_beans', grams: 500 }, { food: 'flaxseed', grams: 14 }, { food: 'olive_oil', grams: 15 }, { food: 'onion', grams: 100 }, { food: 'garlic', grams: 6 }, { food: 'oats', grams: 60 }, { food: 'hemp_seeds', grams: 30 }, { food: 'bread', grams: 256 }, { food: 'romaine', grams: 60 }, { food: 'tomato', grams: 150 }, { food: 'avocado', grams: 136 }, { food: 'pickles', grams: 40 }],
    equipment: ['oven', 'sheetpan', 'stove', 'pot'], alt: ['airfryer', 'stove', 'pot'], activeMin: 25, totalMin: 55, steps: 4, dopamine: d(2, 3, 2, 3), batch: true,
    note: 'Vegan. Freeze the cooked patties between parchment; reheat in the oven or air fryer.',
  },

  // ── Bowls, salads & quick ones ───────────────────────────────
  // Inspired by: Ottolenghi's roasted squash with tahini (Jerusalem) and his habit of finishing with pomegranate, herbs and seeds; warm-dressed lentils add the protein.
  {
    id: 'squash_lentil_tahini_salad', name: 'Roasted squash & lentil salad with tahini, pomegranate & pepitas', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'squash', grams: 567 }, { food: 'onion', grams: 150 }, { food: 'olive_oil', grams: 25 }, { food: 'lentils', grams: 180 }, { food: 'lemon', grams: 45 }, { food: 'pumpkin_seeds', grams: 25 }, { food: 'tahini', grams: 40 }, { food: 'garlic', grams: 3 }, { food: 'arugula', grams: 70 }, { food: 'pomegranate', grams: 80 }, { food: 'cilantro', grams: 10 }],
    equipment: ['oven', 'sheetpan', 'stove', 'pot'], activeMin: 20, totalMin: 40, steps: 4, dopamine: d(2, 3, 3, 2), batch: true,
    note: 'Vegan and gluten-free. Store the sauce, seeds and arugula separately and assemble each day.',
  },
  // Inspired by: Mexican esquites (charred street-corn salad) and make-ahead bean salads; edamame and hemp seeds lift the protein.
  {
    id: 'charred_corn_edamame_salad', name: 'Charred corn, edamame & black bean salad with chili-lime', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'corn', grams: 300 }, { food: 'olive_oil', grams: 10 }, { food: 'edamame', grams: 250 }, { food: 'black_beans', grams: 250 }, { food: 'tomato', grams: 150 }, { food: 'onion', grams: 50 }, { food: 'cilantro', grams: 15 }, { food: 'lime', grams: 45 }, { food: 'avocado', grams: 136 }, { food: 'hemp_seeds', grams: 20 }],
    equipment: ['stove', 'skillet', 'microwave'], activeMin: 12, totalMin: 12, steps: 3, dopamine: d(2, 3, 2, 2), batch: true,
    note: 'Vegan, gluten-free, 12 minutes. Keeps 3 days; add the avocado when you serve it.',
  },
  // Inspired by: the viral blended cottage-cheese pasta sauces (Feel Good Foodie, Skinnytaste, Live Eat Learn): Alfredo-creamy with far more protein.
  {
    id: 'cottage_alfredo_pasta', name: '15-minute cottage cheese Alfredo with peas & spinach', slots: ['dinner', 'lunch'], servings: 2,
    items: [{ food: 'pasta', grams: 180 }, { food: 'peas', grams: 150 }, { food: 'cottage_cheese', grams: 227 }, { food: 'parmesan', grams: 25 }, { food: 'garlic', grams: 6 }, { food: 'lemon', grams: 15 }, { food: 'olive_oil', grams: 10 }, { food: 'spinach', grams: 100 }],
    equipment: ['stove', 'pot', 'blender'], activeMin: 15, totalMin: 15, steps: 3, dopamine: d(0, 2, 2, 2),
    note: 'Vegetarian. Keep the heat low once the sauce goes in, or the cottage cheese turns grainy.',
  },
  // Inspired by: Chinese home-style tomato and egg stir-fry (fan qie chao dan), one of the most-loved weeknight dishes in China.
  {
    id: 'tomato_egg_stirfry', name: 'Chinese tomato & egg stir-fry over edamame rice', slots: ['dinner', 'lunch'], servings: 2,
    items: [{ food: 'white_rice', grams: 120 }, { food: 'edamame', grams: 150 }, { food: 'egg', grams: 300 }, { food: 'olive_oil', grams: 15 }, { food: 'garlic', grams: 6 }, { food: 'ginger', grams: 5 }, { food: 'tomato', grams: 400 }, { food: 'soy_sauce', grams: 10 }, { food: 'honey', grams: 8 }, { food: 'cilantro', grams: 5 }],
    equipment: ['stove', 'skillet', 'pot'], alt: ['stove', 'skillet', 'ricecooker'], activeMin: 15, totalMin: 25, steps: 4, dopamine: d(0, 3, 2, 2),
    note: 'Vegetarian. Use the ripest tomatoes you can find; they make the sauce.',
  },
]

export const METHODS_PLANTS: Record<string, string[]> = {
  crispy_tofu_peanut_slaw: [
    'Press the tofu between clean towels under something heavy for 10 minutes, then tear it into rough bite-size pieces. Toss with the olive oil, half the soy sauce and ½ tsp garlic powder.',
    'Air-fry at 400°F for 14–16 minutes, shaking twice, until deep golden and crisp at the edges. (Oven: 425°F on a lined sheet pan for about 25 minutes, flipping once.)',
    'Meanwhile, finely shred the cabbage, cut the carrots into thin sticks, slice the pepper and chop the cilantro. Whisk the peanut butter, lime juice, the rest of the soy sauce, grated ginger and garlic, 1 tsp sriracha and 2–3 tbsp warm water into a pourable dressing.',
    'Toss the vegetables with most of the dressing, pile the hot tofu on top, drizzle with the rest and scatter the cilantro. Eat while the tofu still crackles.',
  ],
  jerk_tofu_plantain_bowls: [
    'Heat the oven to 425°F. Press the tofu for 10 minutes and tear it into bite-size pieces. Peel the plantains and slice them on the diagonal about ½ inch thick.',
    'Whisk the coconut aminos, oil, grated garlic and ginger, 1½ tsp thyme, 1 tsp smoked paprika, ½ tsp five-spice (it stands in for allspice), ½ tsp onion powder and ½–1 tsp red pepper flakes. Toss the tofu and plantains in it and spread on a lined sheet pan with space between pieces. Roast 25–30 minutes, flipping halfway, until the tofu is dark at the edges and the plantains are caramelised.',
    'Meanwhile, rinse the rice and put it in a pot with the coconut milk, the drained kidney beans, ¾ cup water, ½ tsp thyme and ½ tsp salt. Bring to a boil, cover and cook on low 18 minutes, then rest 5 minutes off the heat (or use a rice cooker).',
    'Dice the mango and cucumber and toss with the lime juice, chopped cilantro and a pinch of salt.',
    'Fill bowls with the coconut rice and beans, then the tofu and plantains, and spoon the mango salsa over. Hot sauce at the table.',
  ],
  sofritas_tofu_tacos: [
    'Squeeze the tofu in a towel to get the water out. Heat the oil in a large skillet over medium-high and crumble the tofu in with your fingers. Cook, stirring only now and then, 8–10 minutes until browned and crisp in spots.',
    'Add the diced onion and minced garlic and cook 3 minutes. Stir in 2 tsp chili powder, 1 tsp smoked paprika, 1 tsp cumin and ½ tsp oregano for 30 seconds, then the salsa and a splash of water. Simmer 4–5 minutes until thick and clinging; add salt and hot sauce to taste.',
    'Thinly shred the cabbage and toss with half the lime juice, the chopped cilantro and a pinch of salt.',
    'Warm the tortillas in a dry skillet, about 30 seconds a side, until soft and spotty. Fill with the sofritas, slaw and sliced avocado, and squeeze the rest of the lime over.',
  ],
  japanese_tofu_curry: [
    'Start the rice: rinse it and simmer covered in 1½ cups water on low for 15 minutes, then rest 10 minutes (or use a rice cooker).',
    'Press the tofu, cut it into 1-inch cubes and brown in half the oil in a wide pot over medium-high, 6–8 minutes, until golden on a few sides. Lift it out.',
    'Add the rest of the oil and the thinly sliced onion and cook over medium, stirring often, 10 minutes until soft and caramel-brown at the edges. Stir in the grated garlic and ginger, 2 tbsp curry powder and 1 tsp garam masala for 1 minute.',
    'Add the potatoes and carrots in chunky pieces, the grated apple, soy sauce and broth. Cover and simmer 15–18 minutes until the potatoes are tender.',
    'Mash a few potato pieces against the pot to thicken the sauce into a glossy gravy. Stir in the peas, the tofu and 1 tsp vinegar and simmer 3 minutes. Serve over the rice.',
  ],
  greek_tofu_feta_bowls: [
    'Pat the tofu dry and crumble it into chunks. Toss with half the lemon juice, half the oil, the nutritional yeast, 1 tsp oregano, ½ tsp garlic powder, 1 tsp vinegar and ¾ tsp salt. Leave it to soak up the flavour while you do the rest.',
    'Put the couscous in a bowl with a pinch of salt and pour over 1¼ cups boiling water (heated in the microwave, 2–3 minutes). Cover for 5 minutes, then fluff with a fork.',
    'Chop the cucumber and tomatoes, slice the onion very thin, halve the olives and drain the chickpeas. Toss with the rest of the lemon and oil, ½ tsp oregano, salt and pepper.',
    'Spoon the couscous into bowls, pile on the salad and top with the tofu feta and its juices.',
  ],
  tempeh_bibimbap: [
    'Cook the rice (rice cooker, or simmer covered in 1 cup water for 15 minutes and rest 5). Cut the tempeh into thin strips and simmer them in a skillet with ½ cup water until it has evaporated, about 5 minutes; this softens the tempeh and tames its bitter edge.',
    'Whisk the soy sauce, honey, half the garlic, 1–2 tsp sriracha and 1 tsp vinegar. Add half the oil to the skillet and fry the tempeh over medium-high 3 minutes a side until browned, then pour in the sauce and toss for 1 minute until sticky. Set aside.',
    'In the same pan, wilt the spinach with the rest of the garlic and a pinch of salt, about 1 minute. Squeeze out the liquid and toss with the tahini. Cut the carrots and cucumber into thin sticks.',
    'Add the remaining oil and fry the eggs over medium, covering the pan for the last minute, until the whites and yolks are set, 3–4 minutes.',
    'Build bowls: rice, then separate piles of tempeh, spinach, carrot, cucumber and kimchi, with an egg on top. Add more sriracha and mix it all together.',
  ],
  tempeh_blt_bowls: [
    'Rinse the quinoa and simmer covered in 1 cup water for 15 minutes; rest 5 minutes and fluff.',
    'Slice the tempeh into thin strips. Whisk the soy sauce, balsamic, 1 tsp smoked paprika, ½ tsp garlic powder, plenty of pepper and 2 tbsp water. Fry the tempeh in the oil over medium 3 minutes a side until browned, then pour in the marinade and cook 1–2 minutes, flipping, until it is absorbed and the edges crisp.',
    'For the ranch, stir the soy yogurt with the grated garlic, lemon juice, 1 tsp dill, ½ tsp onion powder, salt and pepper.',
    'Chop the romaine, tomato and avocado. Build bowls with the quinoa, romaine, tomato, avocado and tempeh "bacon", and spoon the ranch over.',
  ],
  misir_wot_lentils: [
    'Finely chop the onion and cook it in a dry pot over medium, stirring, 8–10 minutes until soft and starting to brown. Add half the oil, the grated garlic and ginger, 2 tbsp paprika, 1 tsp chili powder, 1 tsp ground ginger, ½ tsp cumin and ¼ tsp garam masala; stir 1–2 minutes until dark red and fragrant.',
    'Add the rinsed lentils, the tomatoes and 4 cups water. Simmer, stirring now and then, 25 minutes until the lentils collapse into a thick stew. Season with salt and the lemon juice.',
    'Meanwhile, heat the rest of the oil in a skillet. Add the diced potatoes and sliced carrots with 1 tsp turmeric, ½ tsp cumin and salt; cover and cook over medium 10 minutes. Add the shredded cabbage and a splash of water, cover and cook 10–12 minutes more, stirring once, until everything is tender and the cabbage is sweet.',
    'Serve the lentils next to the cabbage and potatoes. Reheat leftovers to 165°F.',
  ],
  slowcooker_peanut_stew: [
    'Dice the onion, peel and cube the sweet potato (1-inch pieces), and grate the garlic and ginger. Rinse the lentils and drain the chickpeas.',
    'Put the onion, sweet potato, garlic, ginger, lentils, chickpeas, tomatoes and broth in the slow cooker with 1 tsp cumin, 1 tsp paprika, ½ tsp red pepper flakes, 1 tsp salt and 1 cup water. Cook on low 7–8 hours or high 4 hours until the sweet potato and lentils are very soft.',
    'Whisk the peanut butter with a ladle of the hot liquid until smooth and stir it back in, mashing a few sweet potato chunks to thicken. Stir in the chopped kale, cover and cook 10–15 minutes until wilted.',
    'Finish with the lime juice and salt to taste, and top with chopped cilantro. Reheat leftovers to 165°F.',
  ],
  pasta_e_ceci: [
    'Finely chop the onion, carrot and celery and mince the garlic. Cook the vegetables in the oil over medium 8 minutes until soft, then add the garlic, 1 tsp rosemary and a pinch of red pepper flakes for 1 minute.',
    'Add the drained chickpeas, tomatoes, 5 cups water and 1 tsp salt and simmer 10 minutes. Mash about a third of the chickpeas into the broth with a potato masher or the back of a spoon to make it creamy.',
    'Add the pasta (small shapes, or broken spaghetti) and cook, stirring often, 10–12 minutes until al dente, adding a splash of water if it gets too thick. Stir in the chopped kale for the last 3 minutes.',
    'Off the heat, stir in half the parmesan and the lemon juice. Serve topped with the rest of the parmesan and lots of pepper. Reheat leftovers to 165°F with a splash of water.',
  ],
  red_beans_rice: [
    'Start the brown rice (rice cooker, or simmer covered in 2 cups water for 40 minutes).',
    'Dice the onion, bell pepper and celery and cook them in the oil over medium 8–10 minutes until soft and browning. Add the minced garlic, 2 tsp smoked paprika, 1 tsp thyme, 1 tsp oregano, ½ tsp chili powder and 2 bay leaves; stir 1 minute.',
    'Add the drained kidney beans, 2 cups water and ½ tsp salt. Simmer uncovered 25–30 minutes, mashing about a third of the beans against the pot, until thick and creamy.',
    'Remove the bay leaves, season with hot sauce and 1 tsp vinegar, and serve over the rice with chopped cilantro. Reheat leftovers to 165°F.',
  ],
  egg_curry_peas: [
    'Start the rice. Lower the eggs into boiling water for 10 minutes, cool them in cold water, peel, and make 3–4 shallow cuts in each so the sauce can soak in.',
    'Cook the finely chopped onion in the oil over medium 10 minutes until golden. Add the grated garlic and ginger for 1 minute, then 2 tsp garam masala, 1 tsp cumin, 1 tsp turmeric and 1 tsp chili powder for 30 seconds. Add the tomatoes and simmer 8–10 minutes, mashing, until thick and the oil shows at the edges.',
    'Take the pan off the heat and stir in the yogurt a spoonful at a time so it doesn\'t split. Add the peas, spinach and ½ cup water and simmer gently 3 minutes, then add the eggs and spoon the sauce over them for 3 minutes until heated through.',
    'Finish with the lemon juice and chopped cilantro and serve over the rice.',
  ],
  espinacas_garbanzos: [
    'Heat half the oil in a large skillet over medium and fry the bread, torn into small pieces, with the sliced garlic for 3–4 minutes until golden and crisp (don\'t let the garlic burn). Tip into a bowl with 1 tsp smoked paprika, 1 tsp cumin, a pinch of red pepper flakes, 1 tbsp vinegar and 3 tbsp water, and mash with a fork into a thick paste.',
    'Add the rest of the oil to the pan and wilt the spinach by handfuls with a pinch of salt, 2–3 minutes.',
    'Stir in the drained chickpeas, the bread paste and ½ cup water and simmer 4–5 minutes, stirring, until the sauce is thick and clings to everything. Season with salt and another splash of vinegar.',
  ],
  lentil_shepherds_pie: [
    'Cut the potatoes into chunks and boil in salted water about 15 minutes until very tender. Drain and mash with the soy milk, nutritional yeast, a third of the oil, salt and pepper.',
    'Meanwhile, heat the oven to 400°F. In a large skillet over high heat, brown the chopped mushrooms in another third of the oil, leaving them alone for 3–4 minutes before stirring, until deep brown and dry, about 8 minutes. Add the diced onion and carrots, the minced garlic, 1 tsp thyme and ½ tsp rosemary and cook 5 minutes.',
    'Add the rinsed lentils, broth, 2 cups water and the coconut aminos. Cover and simmer 25 minutes until the lentils are tender and the filling is thick like gravy (add water if it dries out). Stir in the peas and balsamic and season.',
    'Spread the filling in a baking dish, top with the mash, rough it up with a fork and drizzle with the rest of the oil. Bake 20 minutes until bubbling and the peaks are golden (broil 2 minutes for extra crust).',
  ],
  pinto_zucchini_enchiladas: [
    'Heat the oven to 400°F. For the sauce, simmer the tomatoes with a third of the garlic, 1 tbsp chili powder, 1 tsp cumin, ½ tsp oregano, ½ tsp smoked paprika and a pinch of salt in a skillet for 6–8 minutes, mashing until fairly smooth. Pour into a bowl.',
    'In the same skillet, cook the diced onion and zucchini in the oil over medium-high 6 minutes until browned at the edges. Add the rest of the garlic, the corn and the drained pinto beans (mash about a third) and ½ tsp cumin, plus a few spoonfuls of the sauce, and cook 2 minutes.',
    'Warm the tortillas a few at a time in the dry skillet, about 20 seconds a side, so they bend without cracking. Spread a little sauce in a baking dish, fill each tortilla with the filling and a pinch of cheddar, roll and lay seam-down. Pour the rest of the sauce over and top with the remaining cheddar.',
    'Bake 20 minutes until bubbling and the cheese is spotted brown. Meanwhile stir the yogurt with the lime juice and a pinch of salt. Serve the enchiladas with the lime crema and chopped cilantro.',
  ],
  chickpea_shawarma_wraps: [
    'Heat the oven to 425°F (or the air fryer to 390°F). Drain the chickpeas and pat them very dry. Toss with the sliced onion, oil, cinnamon, 2 tsp cumin, 1 tsp paprika, ½ tsp turmeric, ½ tsp garlic powder, ¼ tsp ground ginger and ½ tsp salt. Roast on a sheet pan 20–25 minutes, shaking once, until the chickpeas are crisp and the onion is charred at the tips (air fryer: 12–15 minutes).',
    'Stir the yogurt with the grated garlic, half the lemon juice, a pinch of salt and a splash of water.',
    'Chop the tomato and cucumber and toss with the rest of the lemon juice and salt. Shred the romaine and slice the pickles.',
    'Warm the tortillas for a minute in the oven or air fryer, spread with garlic yogurt, pile on the chickpeas and onion, salad, romaine and pickles, and roll up tightly. Hot sauce if you like.',
  ],
  buffalo_cauli_chickpea_salad: [
    'Heat the air fryer to 400°F. Pat the chickpeas dry. Toss the cauliflower (frozen is fine) and chickpeas with the oil, ½ tsp garlic powder, ½ tsp smoked paprika and salt. Air-fry 18–20 minutes, shaking every 5 minutes, until the cauliflower is browned at the tips and the chickpeas are crisp. (Oven: 450°F on a sheet pan, about 25 minutes.)',
    'Melt the butter in the microwave (20 seconds) and whisk in 3 tbsp hot sauce. Toss the hot cauliflower and chickpeas in it.',
    'For the ranch, stir the yogurt with the grated garlic, lemon juice, 1 tsp dill, ½ tsp onion powder, salt, pepper and a splash of water.',
    'Chop the romaine and thinly slice the celery and carrots. Pile into bowls, add the buffalo cauliflower and chickpeas, and drizzle with the ranch.',
  ],
  black_bean_quinoa_burgers: [
    'Rinse the quinoa and simmer covered in ⅔ cup water 15 minutes; spread on a plate to cool. Meanwhile heat the oven to 350°F, spread the drained beans on a sheet pan and bake 12–15 minutes until the skins split and look dry (this stops the burgers going mushy). Stir the flaxseed with 3 tbsp water and let it thicken.',
    'In the empty quinoa pot, cook the finely diced onion and garlic in 1 tsp of the oil 5 minutes. In a bowl, mash the beans, leaving some chunky, and mix in the quinoa, onion, flax, oats, hemp seeds, 1 tsp smoked paprika, 1 tsp cumin, ½ tsp chili powder and ¾ tsp salt. Shape into 4 patties about ¾ inch thick.',
    'Turn the oven up to 400°F. Brush the patties with the rest of the oil and bake on the sheet pan 25 minutes, flipping halfway, until crusty and firm. (Air fryer: 375°F for 12–14 minutes, flipping once.)',
    'Toast the bread (toaster, or in the oven for the last 5 minutes). Mash the avocado with a pinch of salt and a dash of hot sauce and build the burgers with the romaine, sliced tomato and pickles.',
  ],
  squash_lentil_tahini_salad: [
    'Heat the oven to 450°F. Toss the squash and onion wedges with two-thirds of the oil, 1 tsp cumin, ½ tsp smoked paprika, a pinch of red pepper flakes and salt. Spread out on a sheet pan with space between pieces and roast 30–35 minutes, flipping once, until deeply browned at the edges. Scatter the pumpkin seeds on a corner of the pan for the last 4 minutes.',
    'Meanwhile, simmer the rinsed lentils in plenty of salted water 20–25 minutes until tender but holding their shape. Drain and toss while warm with half the lemon juice, the rest of the oil and salt (warm lentils soak up the dressing).',
    'Whisk the tahini with the grated garlic, the rest of the lemon juice, a pinch of salt and 3–4 tbsp cold water; it will seize, then turn smooth and pourable.',
    'Toss the lentils with the arugula and top with the squash and onion. Drizzle with the tahini sauce and scatter the pomegranate, toasted pumpkin seeds and cilantro.',
  ],
  charred_corn_edamame_salad: [
    'Heat a dry skillet over high. Add the frozen corn with half the oil, spread it out and leave it 3–4 minutes until charred in spots, then stir and char 2–3 minutes more. Off the heat, sprinkle with 1 tsp chili powder and a pinch of salt.',
    'Microwave the edamame with a splash of water, covered, for 3 minutes, then rinse under cold water. Drain and rinse the black beans.',
    'Toss the corn, edamame and beans with the diced tomato, finely diced onion, chopped cilantro, lime juice, the rest of the oil, ½ tsp cumin and salt. Top with diced avocado and the hemp seeds.',
  ],
  cottage_alfredo_pasta: [
    'Boil the pasta in well-salted water as the package says (about 10 minutes), adding the peas for the last 2 minutes. Scoop out 1 cup of the pasta water, then drain.',
    'While it cooks, blend the cottage cheese, parmesan, garlic, lemon juice, oil, lots of black pepper and ¼ cup of hot pasta water until silky.',
    'Put the pasta and peas back in the warm pot over low heat, add the spinach and the sauce and toss until the spinach wilts and the sauce is glossy, loosening with more pasta water. Don\'t let it boil. Finish with red pepper flakes and more pepper.',
  ],
  tomato_egg_stirfry: [
    'Cook the rice (rice cooker, or simmer covered in 1 cup water for 15 minutes and rest 5), stirring the frozen edamame in for the last 3 minutes of resting so it warms through.',
    'Beat the eggs with a pinch of salt. Heat two-thirds of the oil in a skillet over medium-high, pour in the eggs, let them set for 10 seconds, then push them into large soft curds until just set with no liquid egg left, about 1 minute. Slide onto a plate.',
    'Add the rest of the oil, then the grated garlic and ginger for 20 seconds, then the tomatoes in wedges. Cook 3–4 minutes until they slump and release their juice. Stir in the soy sauce, honey, 1 tsp vinegar and 2 tbsp water and simmer 1 minute until glossy.',
    'Fold the eggs back in for 30 seconds until coated and fully set. Top with chopped cilantro and serve over the edamame rice.',
  ],
}

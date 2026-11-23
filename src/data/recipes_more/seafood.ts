// Fish and seafood mains.
// Each recipe is original: inspired by well-loved dishes, written in this app's own words.
// Ingredient grams are for the whole recipe; one plan entry is one serving.
import type { Recipe } from '../../types'

const d = (crunch: number, flavor: number, novelty: number, fun: number) => ({ crunch, flavor, novelty, fun })

export const RECIPES_SEAFOOD: Recipe[] = [
  // Inspired by: a self-described salmon skeptic's ginger-soy salmon bites (AOL/Simply Recipes), MyFitnessPal threads on sweet glazes hiding "fishiness", and ATK's advice not to overcook salmon.
  {
    id: 'sticky_salmon_bites', name: 'Sticky soy-ginger salmon bites with crunchy cabbage-cucumber salad', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'salmon', grams: 454 }, { food: 'white_rice', grams: 180 }, { food: 'honey', grams: 20 }, { food: 'soy_sauce', grams: 20 }, { food: 'garlic', grams: 6 }, { food: 'ginger', grams: 10 }, { food: 'cabbage', grams: 300 }, { food: 'cucumber', grams: 300 }, { food: 'olive_oil', grams: 10 }],
    equipment: ['airfryer', 'ricecooker'], alt: ['stove', 'skillet', 'pot'], activeMin: 15, totalMin: 25, steps: 5, dopamine: d(2, 3, 2, 3),
    note: 'Small cubes mean more caramelised edges per bite: a good first salmon for people who think they hate it.',
  },
  // Inspired by: blackened salmon that "converted folks who don't like fish" (SIGforum thread) and the classic blackened-fish-plus-lime-slaw taco pairing, served as a low-carb plate.
  {
    id: 'blackened_salmon_slaw', name: 'Blackened salmon with cabbage-lime slaw & smashed avocado', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'salmon', grams: 454 }, { food: 'cabbage', grams: 300 }, { food: 'lime', grams: 30 }, { food: 'avocado', grams: 136 }, { food: 'cilantro', grams: 10 }, { food: 'olive_oil', grams: 15 }, { food: 'pumpkin_seeds', grams: 20 }],
    equipment: ['stove', 'skillet'], activeMin: 18, totalMin: 20, steps: 4, dopamine: d(3, 3, 2, 2),
    note: 'Keto, paleo, gluten- and dairy-free. Want tacos? Pile it into warm corn tortillas.',
  },
  // Inspired by: BBC Good Food's curried coconut cod and turmeric-ginger fish curry, made nightshade-free, with crispy plantain from Caribbean kitchens for crunch.
  {
    id: 'coconut_cod_curry_plantain', name: 'Turmeric-ginger coconut cod curry with crispy plantains (nightshade-free)', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'cod', grams: 454 }, { food: 'coconut_milk', grams: 400 }, { food: 'sweet_potato', grams: 454 }, { food: 'spinach', grams: 100 }, { food: 'onion', grams: 150 }, { food: 'garlic', grams: 10 }, { food: 'ginger', grams: 20 }, { food: 'lime', grams: 30 }, { food: 'cilantro', grams: 10 }, { food: 'coconut_oil', grams: 20 }, { food: 'coconut_aminos', grams: 15 }, { food: 'plantains', grams: 227 }],
    equipment: ['stove', 'pot'], activeMin: 25, totalMin: 40, steps: 6, dopamine: d(2, 3, 3, 2), batch: true,
    note: 'AIP-friendly: no chili, nightshades, seeds or black pepper. Keep the plantains separate if meal-prepping.',
  },
  // Inspired by: forum tips (Fitbit, MyFitnessPal, Mumsnet) that mild white fish in a bold, saucy bake is the easiest way in, and The Mediterranean Dish's much-reviewed baked fish with tomatoes and olives.
  {
    id: 'med_cod_chickpeas', name: 'Mediterranean baked cod with tomatoes, olives & lemony chickpeas', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'cod', grams: 454 }, { food: 'canned_tomatoes', grams: 411 }, { food: 'chickpeas', grams: 250 }, { food: 'olives', grams: 40 }, { food: 'spinach', grams: 100 }, { food: 'onion', grams: 100 }, { food: 'garlic', grams: 10 }, { food: 'olive_oil', grams: 25 }, { food: 'lemon', grams: 30 }],
    equipment: ['oven', 'sheetpan'], activeMin: 12, totalMin: 35, steps: 4, dopamine: d(1, 3, 2, 1), batch: true,
    note: 'Use a rimmed sheet pan or any baking dish. Gluten- and dairy-free.',
  },
  // Inspired by: Woks of Life and RecipeTin Eats' Cantonese steamed fish, where hot oil poured over raw ginger makes it sizzle; gentle steaming is the mildest way to cook fish.
  {
    id: 'steamed_ginger_cod', name: 'Steamed ginger cod with sizzling soy & broccoli', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'cod', grams: 454 }, { food: 'ginger', grams: 20 }, { food: 'garlic', grams: 6 }, { food: 'soy_sauce', grams: 20 }, { food: 'honey', grams: 5 }, { food: 'olive_oil', grams: 20 }, { food: 'cilantro', grams: 10 }, { food: 'broccoli', grams: 340 }, { food: 'white_rice', grams: 180 }],
    equipment: ['stove', 'skillet', 'pot'], alt: ['stove', 'skillet', 'ricecooker'], activeMin: 15, totalMin: 25, steps: 5, dopamine: d(0, 3, 3, 2),
  },
  // Inspired by: ATK's "How I learned to love tilapia" (dry it, salt it, sear it golden) and Great British Chefs' point that crunch takes the focus off fish texture.
  {
    id: 'parmesan_almond_tilapia', name: 'Crispy parmesan-almond tilapia with lemony roast broccoli', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'tilapia', grams: 454 }, { food: 'parmesan', grams: 40 }, { food: 'almond_flour', grams: 30 }, { food: 'broccoli', grams: 340 }, { food: 'olive_oil', grams: 20 }, { food: 'butter', grams: 15 }, { food: 'lemon', grams: 30 }, { food: 'garlic', grams: 6 }],
    equipment: ['oven', 'sheetpan'], alt: ['airfryer'], activeMin: 10, totalMin: 28, steps: 4, dopamine: d(3, 2, 1, 2),
    note: 'Keto and gluten-free: the parmesan-almond crust does the job of breadcrumbs.',
  },
  // Inspired by: Jamaican escovitch fish (Food Network, Saveur, Cooking With Ria): fried fish under hot vinegar-pickled peppers, onions and carrots, with coconut rice and beans.
  {
    id: 'escovitch_tilapia', name: 'Escovitch-style tilapia with pickled peppers & coconut rice and beans', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'tilapia', grams: 454 }, { food: 'bell_pepper', grams: 150 }, { food: 'onion', grams: 150 }, { food: 'carrots', grams: 100 }, { food: 'garlic', grams: 6 }, { food: 'olive_oil', grams: 20 }, { food: 'white_rice', grams: 180 }, { food: 'kidney_beans', grams: 250 }, { food: 'coconut_milk', grams: 400 }, { food: 'lime', grams: 15 }],
    equipment: ['stove', 'skillet', 'pot'], alt: ['stove', 'skillet', 'ricecooker'], activeMin: 20, totalMin: 35, steps: 4, dopamine: d(2, 3, 3, 2),
    note: 'The pickled vegetables keep a week in a jar; they are great on eggs and tacos too.',
  },
  // Inspired by: sheet-pan Cajun shrimp and potato recipes (La Crème de la Crumb, Hummusapien) and Serious Eats' tip to salt shrimp ahead so they stay juicy and snappy.
  {
    id: 'cajun_shrimp_sweet_potato', name: 'Cajun shrimp, sweet potato & pepper sheet pan', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'shrimp', grams: 454 }, { food: 'sweet_potato', grams: 454 }, { food: 'bell_pepper', grams: 300 }, { food: 'onion', grams: 150 }, { food: 'olive_oil', grams: 25 }, { food: 'lemon', grams: 30 }, { food: 'cilantro', grams: 10 }],
    equipment: ['oven', 'sheetpan'], activeMin: 15, totalMin: 40, steps: 5, dopamine: d(2, 3, 1, 2), batch: true,
    note: 'Paleo, gluten- and dairy-free. Use two pans if one is crowded so everything browns instead of steaming.',
  },
  // Inspired by: Greek shrimp saganaki and Budget Bytes-style 20-minute skillet shrimp, using fresh tomatoes that collapse into a quick sauce.
  {
    id: 'greek_shrimp_feta', name: 'Greek-style shrimp with blistered tomatoes, feta & couscous', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'shrimp', grams: 340 }, { food: 'tomato', grams: 454 }, { food: 'feta', grams: 40 }, { food: 'onion', grams: 100 }, { food: 'garlic', grams: 10 }, { food: 'olive_oil', grams: 20 }, { food: 'lemon', grams: 15 }, { food: 'couscous', grams: 150 }, { food: 'spinach', grams: 100 }],
    equipment: ['stove', 'skillet', 'pot'], activeMin: 18, totalMin: 20, steps: 5, dopamine: d(1, 3, 2, 2),
  },
  // Inspired by: classic New England corn chowder done the budget way: mashing some of the potato thickens it without flour, and smoked paprika stands in for bacon.
  {
    id: 'shrimp_corn_chowder', name: 'Smoky shrimp & sweet corn chowder', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'shrimp', grams: 454 }, { food: 'corn', grams: 454 }, { food: 'potato', grams: 450 }, { food: 'onion', grams: 150 }, { food: 'celery', grams: 100 }, { food: 'garlic', grams: 6 }, { food: 'veg_broth', grams: 700 }, { food: 'milk', grams: 480 }, { food: 'butter', grams: 15 }, { food: 'lemon', grams: 15 }],
    equipment: ['stove', 'pot'], activeMin: 20, totalMin: 35, steps: 5, dopamine: d(0, 2, 1, 2), batch: true,
    note: 'Gluten-free. Reheat gently to 165°F without boiling so the shrimp stay tender.',
  },
  // Inspired by: sardine spaghetti with crunchy pangrattato (Abel & Cole, Delicious, GoodTo) and ATK's tinned-fish pasta con le sarde: sweet-sour notes, sardines added off the heat.
  {
    id: 'sardine_crumb_pasta', name: 'Sardine pasta with lemon, chili & crunchy garlic crumbs', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'pasta', grams: 250 }, { food: 'sardines', grams: 212 }, { food: 'bread', grams: 50 }, { food: 'olive_oil', grams: 20 }, { food: 'garlic', grams: 12 }, { food: 'lemon', grams: 30 }, { food: 'onion', grams: 150 }, { food: 'kale', grams: 150 }, { food: 'dates', grams: 25 }],
    equipment: ['stove', 'pot', 'skillet'], activeMin: 20, totalMin: 25, steps: 5, dopamine: d(3, 3, 3, 2),
    note: 'The chopped date plays the role of the raisins in the Sicilian original: a little sweetness that tames the fishiness.',
  },
  // Inspired by: mackerel rillettes and pâtés (Great British Chefs, Le Parfait with cornichons, Sainsbury's yogurt version) remade with one big tin, and ATK's tip to cut oily fish with pickles.
  {
    id: 'mackerel_rillette_toast', name: 'Mackerel rillette toasts with quick-pickled cucumber', slots: ['lunch'], servings: 4,
    items: [{ food: 'canned_mackerel', grams: 425 }, { food: 'greek_yogurt', grams: 100 }, { food: 'butter', grams: 20 }, { food: 'lemon', grams: 20 }, { food: 'pickles', grams: 40 }, { food: 'cucumber', grams: 150 }, { food: 'bread', grams: 256 }, { food: 'arugula', grams: 40 }],
    equipment: ['toaster'], alt: ['airfryer'], activeMin: 10, totalMin: 10, steps: 3, dopamine: d(3, 3, 3, 2), batch: true,
    note: 'The spread keeps 3 days in the fridge; toast and top each portion to order.',
  },
  // Inspired by: the tuna melt, a "tried-and-true favorite" in canned-fish roundups, crossed with a crispy quesadilla; corn tortillas keep it gluten-free and lower in sodium.
  {
    id: 'tuna_melt_quesadillas', name: 'Crispy tuna melt quesadillas with pickles', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'tuna', grams: 284 }, { food: 'corn_tortillas', grams: 200 }, { food: 'cheddar', grams: 50 }, { food: 'greek_yogurt', grams: 60 }, { food: 'pickles', grams: 30 }, { food: 'celery', grams: 60 }, { food: 'spinach', grams: 40 }],
    equipment: ['stove', 'skillet'], alt: ['airfryer'], activeMin: 12, totalMin: 15, steps: 4, dopamine: d(3, 2, 2, 3),
  },
  // Inspired by: Budget Bytes' spicy tuna bowls and the many 10-minute canned-tuna "spicy tuna roll" bowls (A Couple Cooks, Christie at Home): all the flavour, no raw fish.
  {
    id: 'spicy_tuna_rice_bowl', name: 'Spicy tuna rice bowls with cucumber, carrot & avocado', slots: ['lunch', 'dinner'], servings: 2,
    items: [{ food: 'tuna', grams: 284 }, { food: 'white_rice', grams: 150 }, { food: 'cucumber', grams: 200 }, { food: 'carrots', grams: 100 }, { food: 'avocado', grams: 136 }, { food: 'greek_yogurt', grams: 60 }, { food: 'soy_sauce', grams: 10 }],
    equipment: ['ricecooker'], alt: ['stove', 'pot'], activeMin: 10, totalMin: 22, steps: 4, dopamine: d(2, 3, 2, 3),
    note: 'Everything is cooked: canned tuna gives the spicy-roll flavour without raw fish. Greek yogurt and sriracha stand in for spicy mayo.',
  },
  // Inspired by: salade niçoise, with canned salmon in place of tuna as canned-fish guides suggest (NDSU Extension, ECAH "swap the tuna" tips); warm potatoes soak up the dressing.
  {
    id: 'canned_salmon_nicoise', name: 'Canned salmon niçoise salad', slots: ['lunch', 'dinner'], servings: 4,
    items: [{ food: 'canned_salmon', grams: 418 }, { food: 'potato', grams: 450 }, { food: 'green_beans', grams: 340 }, { food: 'egg', grams: 200 }, { food: 'olives', grams: 40 }, { food: 'romaine', grams: 250 }, { food: 'tomato', grams: 200 }, { food: 'olive_oil', grams: 30 }, { food: 'lemon', grams: 30 }],
    equipment: ['stove', 'pot'], activeMin: 15, totalMin: 25, steps: 4, dopamine: d(1, 2, 1, 2), batch: true,
    note: 'Meal prep: keep the dressing, greens and cooked parts separate for up to 3 days. Gluten- and dairy-free.',
  },
  // Inspired by: Korean canned-mackerel kimchi stew (godeungeo kimchi-jjigae; Maangchi, Beyond Kimchee, 10000recipe): the sour kimchi tames the fishiness.
  {
    id: 'mackerel_kimchi_stew', name: 'Kimchi & mackerel stew with tofu', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'canned_mackerel', grams: 425 }, { food: 'kimchi', grams: 300 }, { food: 'tofu', grams: 396 }, { food: 'onion', grams: 150 }, { food: 'garlic', grams: 10 }, { food: 'zucchini', grams: 200 }, { food: 'honey', grams: 5 }, { food: 'white_rice', grams: 150 }],
    equipment: ['stove', 'pot'], activeMin: 15, totalMin: 35, steps: 5, dopamine: d(0, 3, 3, 1), batch: true,
    note: 'Tastes even better the next day. Dairy-free. Check the mackerel for large bones as you add it.',
  },
  // Inspired by: forum advice to start fish skeptics on mild trout or salmon with bright, sweet-sour toppings, and fruit-salsa fish from Caribbean and Mexican cooking; kept AIP-compliant.
  {
    id: 'trout_mango_salsa', name: 'Sheet-pan trout with crispy sweet potatoes & mango-lime salsa', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'trout', grams: 454 }, { food: 'sweet_potato', grams: 454 }, { food: 'mango', grams: 200 }, { food: 'lime', grams: 30 }, { food: 'cilantro', grams: 10 }, { food: 'onion', grams: 40 }, { food: 'olive_oil', grams: 20 }],
    equipment: ['oven', 'sheetpan'], activeMin: 12, totalMin: 35, steps: 4, dopamine: d(2, 2, 2, 2),
    note: 'AIP-friendly: no nightshades, seeds or black pepper. Paleo, gluten- and dairy-free.',
  },
]

export const METHODS_SEAFOOD: Record<string, string[]> = {
  sticky_salmon_bites: [
    'Cook the rice (rice cooker, or simmer covered with 1½ times its volume of water for 15 minutes, then rest 5).',
    'Finely shred the cabbage. Smash the cucumber with the flat of a knife and break it into chunks. Toss both with 2 tbsp rice vinegar, ¼ tsp salt and a pinch of red pepper flakes, and let it sit.',
    'Grate the garlic and ginger into the soy sauce and honey with 1 tbsp rice vinegar.',
    'Cut the salmon into 1-inch cubes, pat dry, and toss with the oil and a pinch of salt. Air-fry at 400°F for 6 minutes (or sear in a hot skillet 2 minutes per side) until browned at the edges.',
    'Toss the bites with half the sauce and cook 2 minutes more (air fryer, or the skillet over low heat) until sticky and glazed and the fish flakes easily (145°F). Toss with the rest of the sauce and serve over the rice with the crunchy salad.',
  ],
  blackened_salmon_slaw: [
    'Very thinly slice the cabbage and toss it with half the lime juice, the chopped cilantro and a pinch of salt; let it soften while you cook.',
    'Toast the pumpkin seeds in a dry heavy skillet over medium heat for 2–3 minutes until they start to pop; tip them out. Mix 2 tsp smoked paprika, 1 tsp each garlic powder, onion powder and oregano, ½ tsp thyme, ½ tsp chili powder, ½ tsp salt and some pepper. Pat the salmon dry, cut it into 3 pieces and coat the flesh side with the spice.',
    'Heat the oil in the skillet over medium-high until shimmering. Cook the salmon spice-side down for 3–4 minutes until dark and crusty (not burnt), flip, and cook 3–4 minutes more until it flakes easily and reaches 145°F.',
    'Mash the avocado with the rest of the lime juice and a pinch of salt. Serve the salmon over the slaw with the avocado and toasted pumpkin seeds.',
  ],
  coconut_cod_curry_plantain: [
    'Dice the onion, peel the sweet potato and cut it into 2 cm cubes, grate the garlic and ginger, cut the cod into large chunks, and slice the plantain into thin coins.',
    'Heat half the coconut oil in a pot over medium. Fry the plantain coins 2–3 minutes per side until golden and crisp at the edges, sprinkle with salt and set aside.',
    'Add the rest of the oil and the onion and cook 5 minutes until soft. Stir in the garlic, ginger, 1 tsp turmeric and ½ tsp ground ginger for 1 minute until fragrant.',
    'Add the sweet potato, coconut milk, coconut aminos, 1 cup water and a bay leaf. Cover and simmer 12–15 minutes until the sweet potato is just tender.',
    'Nestle in the cod, cover, and simmer gently 5–6 minutes until the fish flakes easily (145°F). Fold in the spinach until it wilts.',
    'Off the heat, stir in the lime juice and salt to taste. Top each bowl with chopped cilantro and the crispy plantains.',
  ],
  med_cod_chickpeas: [
    'Heat the oven to 425°F. Drain and rinse the chickpeas, thinly slice the onion and garlic, and roughly chop the olives.',
    'On a rimmed sheet pan or in a baking dish, toss the chickpeas, onion, garlic, canned tomatoes, olives and most of the oil with 1 tsp oregano, ½ tsp smoked paprika, a pinch of red pepper flakes, salt and pepper. Roast 15 minutes until bubbling.',
    'Stir in the spinach, then nestle the cod on top. Drizzle with the remaining oil and half the lemon juice and season. Bake 12–15 minutes until the cod flakes easily and reaches 145°F.',
    'Squeeze over the rest of the lemon and spoon the juicy chickpeas over the fish to serve.',
  ],
  steamed_ginger_cod: [
    'Cook the rice (simmer covered with 1½ times its volume of water for 15 minutes, then rest 5; or use a rice cooker).',
    'Cut the ginger into thin matchsticks, mince the garlic and chop the cilantro. Stir the soy sauce, honey and 2 tbsp water together.',
    'Put the cod in a skillet with half the ginger, arrange the broccoli around it and add ⅓ cup water. Cover and steam over medium for 6–8 minutes until the cod flakes easily (145°F) and the broccoli is tender-crisp.',
    'Lift the fish and broccoli onto plates, then pour out and wipe the skillet. Top the fish with the remaining ginger, the garlic and cilantro, and spoon over the soy mixture.',
    'Heat the oil in the skillet over high for about 1 minute until shimmering, then carefully pour it over the fish so the aromatics sizzle. Serve with the rice.',
  ],
  parmesan_almond_tilapia: [
    'Heat the oven to 425°F. Thaw the tilapia (overnight in the fridge, or sealed in a bag in cold water for 15 minutes) and pat it very dry. Toss the broccoli (straight from frozen) with half the oil, the sliced garlic and a pinch of salt, and roast on a sheet pan 10 minutes.',
    'Mix the grated parmesan and almond flour with 1 tsp garlic powder, 1 tsp smoked paprika and ½ tsp Italian seasoning. Melt the butter, stir in 1 tsp Dijon mustard, brush it over the fish and press the crumb onto the tops.',
    'Add the fish to the pan, drizzle with the remaining oil and roast 10–12 minutes until the crust is golden and the fish flakes easily (145°F). Air fryer: 400°F for 8–10 minutes.',
    'Squeeze the lemon juice over the fish and broccoli before serving.',
  ],
  escovitch_tilapia: [
    'Rinse the rice and put it in a pot with the drained kidney beans, coconut milk, ¼ cup water, ½ tsp thyme, ½ tsp garlic powder and ½ tsp salt. Bring to a boil, cover and simmer on low 18 minutes, then rest 5 (or use a rice cooker).',
    'Thinly slice the bell pepper and onion, cut the carrots into matchsticks and mince the garlic. Cook them in a third of the oil in a skillet over medium-high for 3 minutes until just softened, then add ½ cup vinegar, ¼ cup water, ½ tsp thyme, a pinch of red pepper flakes or a dash of hot sauce, and a pinch of salt. Simmer 2 minutes and tip into a bowl.',
    'Wipe out the skillet. Pat the tilapia dry and season with salt, pepper and ½ tsp garlic powder. Heat the remaining oil over medium-high and sear the fish 3 minutes per side until golden and it flakes easily (145°F).',
    'Pile the hot pickled vegetables and some of their vinegar over the fish, squeeze over the lime, and serve with the rice and beans.',
  ],
  cajun_shrimp_sweet_potato: [
    'Heat the oven to 425°F. Thaw the shrimp under cold running water, pat very dry and toss with ¼ tsp salt (a quick dry brine keeps them juicy). Cut the sweet potatoes into 2 cm cubes and the peppers and onion into chunks.',
    'Mix a Cajun-style spice: 2 tsp smoked paprika, 1 tsp each garlic powder, onion powder and oregano, ½ tsp thyme, ½ tsp chili powder, ½ tsp salt and pepper. Toss the sweet potatoes with two thirds of the oil and half the spice and roast 15 minutes.',
    'Add the peppers and onion, toss, and roast 8 minutes more until the sweet potatoes are browning at the edges.',
    'Toss the shrimp with the rest of the oil and spice, scatter them over the pan in one layer and roast 6–8 minutes until pink and opaque.',
    'Squeeze the lemon over everything, scatter with chopped cilantro and pass the hot sauce.',
  ],
  greek_shrimp_feta: [
    'Bring 1 cup water to a boil in a small pot, stir in the couscous and a pinch of salt, cover off the heat for 5 minutes, then fluff with a fork.',
    'Thaw the shrimp, pat dry and toss with ¼ tsp salt and ½ tsp oregano. Chop the onion, slice the garlic and cut the tomatoes into chunks.',
    'Heat the oil in a large skillet over medium-high. Cook the onion 3 minutes, add the garlic, ½ tsp red pepper flakes and 1 tsp oregano for 30 seconds, then add the tomatoes and cook 5–6 minutes until they blister and collapse into a chunky sauce.',
    'Stir in the spinach to wilt, nestle in the shrimp and crumble over the feta. Cover and cook 3–4 minutes until the shrimp are pink and opaque and the feta softens.',
    'Squeeze over the lemon and serve over the couscous.',
  ],
  shrimp_corn_chowder: [
    'Dice the onion, celery and potatoes (1 cm) and mince the garlic. Thaw the shrimp, pat dry and cut into bite-size pieces.',
    'Melt the butter in a pot over medium and cook the onion and celery 5 minutes until soft. Add the garlic, 1 tsp smoked paprika, ½ tsp thyme and a bay leaf for 1 minute.',
    'Add the potatoes and broth, cover and simmer 12 minutes until the potatoes are tender. Mash about a third of them against the side of the pot to thicken the soup.',
    'Add the corn and milk and bring back to a gentle simmer for 3 minutes (don’t boil hard or the milk can split).',
    'Stir in the shrimp and cook 2–3 minutes until pink and opaque. Off the heat, add the lemon juice, salt, pepper and hot sauce to taste.',
  ],
  sardine_crumb_pasta: [
    'Bring a large pot of salted water to a boil. Tear the bread into small crumbs, thinly slice the onion and garlic, strip and chop the kale, and finely chop the date.',
    'Toast the crumbs in a skillet over medium with a third of the oil, stirring, 4–5 minutes until golden and crunchy. Salt them and set aside.',
    'Cook the pasta according to the package. Meanwhile add the rest of the oil to the skillet and cook the onion 5 minutes until soft and sweet, then add the garlic, ½ tsp red pepper flakes and the date for 1 minute.',
    'Add the kale and a splash of pasta water and cook 3 minutes until wilted. Take the pan off the heat and break in the sardines: half mashed so they melt into the sauce, half in chunks.',
    'Drain the pasta, saving a cup of the water. Toss it with the sardine mixture, the lemon juice and enough pasta water to make it glossy. Top with the crunchy crumbs.',
  ],
  mackerel_rillette_toast: [
    'Thinly slice the cucumber and toss it with 2 tbsp vinegar and a pinch of salt; leave it to quick-pickle for 5 minutes.',
    'Drain the mackerel and mash it with the softened butter, Greek yogurt, lemon juice, finely chopped pickles, 1 tsp Dijon mustard, ½ tsp dried dill and plenty of pepper until spreadable but still a little chunky.',
    'Toast the bread, spread it thickly with the rillette, and top with the drained cucumber and the arugula.',
  ],
  tuna_melt_quesadillas: [
    'Drain the tuna and mix it with the Greek yogurt, finely chopped pickles and celery, 1 tsp Dijon mustard, a few dashes of hot sauce and pepper.',
    'Warm the tortillas in the microwave for 30 seconds so they don’t crack. Spread the tuna over half of them, add the spinach and grated cheddar, and top with the remaining tortillas.',
    'Cook in a skillet lightly coated with cooking spray over medium for 3–4 minutes per side, pressing with a spatula, until crisp and the cheese melts (air fryer: 390°F for 6–7 minutes, flipping once).',
    'Cut into wedges and serve with extra hot sauce.',
  ],
  spicy_tuna_rice_bowl: [
    'Cook the rice (rice cooker, or simmer covered with 1½ times its volume of water for 15 minutes, then rest 5). Season it with 1 tbsp rice vinegar and a pinch of salt.',
    'Meanwhile, mix the drained tuna with the Greek yogurt, 1–2 tbsp sriracha, half the soy sauce and 1 tsp rice vinegar.',
    'Slice the cucumber into thin coins, cut the carrots into matchsticks and slice the avocado.',
    'Build the bowls: rice, spicy tuna, cucumber, carrot and avocado. Drizzle with the remaining soy sauce and more sriracha to taste.',
  ],
  canned_salmon_nicoise: [
    'Cut the potatoes into 3 cm chunks and boil in salted water 5 minutes. Gently add the eggs and cook 9 minutes more until the whites are fully set and the yolks just firm, adding the green beans for the last 3 minutes. Drain and cool the eggs in cold water.',
    'Whisk the olive oil, lemon juice, 1 tbsp vinegar, 1 tsp Dijon mustard, ½ tsp oregano, salt and pepper. Toss the warm potatoes with a third of the dressing.',
    'Peel and halve the eggs, chop the romaine, cut the tomatoes into wedges, and drain the salmon and break it into big flakes (mash in the soft bones: that’s where the calcium is).',
    'Arrange the romaine, potatoes, green beans, tomatoes, olives, salmon and eggs on plates and drizzle with the rest of the dressing.',
  ],
  mackerel_kimchi_stew: [
    'Cook the rice (simmer covered with 1½ times its volume of water for 15 minutes, then rest 5). Slice the onion, mince the garlic, halve and slice the zucchini, cut the tofu into thick slabs, and chop the kimchi, keeping its juice.',
    'Coat a pot with cooking spray and cook the kimchi and onion over medium for 5 minutes until the kimchi smells toasty. Add the garlic, 1–2 tsp red pepper flakes and the honey.',
    'Add 3 cups water and the kimchi juice and simmer 10 minutes. Add the zucchini and tofu and simmer 5 minutes more.',
    'Drain the mackerel and add it in big chunks. Simmer gently 3 minutes just to heat through, stirring carefully so it stays chunky.',
    'Taste and add a splash of vinegar if your kimchi is mild. Serve bubbling hot with the rice. Reheat leftovers to 165°F.',
  ],
  trout_mango_salsa: [
    'Heat the oven to 425°F. Cut the sweet potatoes into 1 cm coins, toss with most of the oil, ½ tsp salt, ½ tsp garlic powder and ½ tsp thyme, and spread in one layer. Roast 15 minutes.',
    'Meanwhile thaw and dice the mango (1 minute in the microwave helps), finely chop the onion and cilantro, and mix with the lime juice and a pinch of salt.',
    'Flip the sweet potatoes and push them aside. Lay the trout skin-side down, brush with the remaining oil and season with salt and ½ tsp dried dill. Roast 8–10 minutes until the fish flakes easily and reaches 145°F and the potatoes are browned at the edges.',
    'Spoon the mango salsa over the trout and serve with the sweet potatoes.',
  ],
}

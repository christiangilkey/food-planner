// Snacks, plus mains and sides for keto, paleo and AIP.
// Each recipe is original: inspired by well-loved dishes, written in this app's own words.
// Ingredient grams are for the whole recipe; one plan entry is one serving.
import type { Recipe } from '../../types'

const d = (crunch: number, flavor: number, novelty: number, fun: number) => ({ crunch, flavor, novelty, fun })

export const RECIPES_SNACKS: Recipe[] = [
  // ── Snacks: savoury and crunchy ──────────────────────────
  // Inspired by: the whipped cottage cheese "everything bagel" dip trend (Love and Lemons, US Dairy, Life Currents), and
  // cottage cheese as a go-to snack on r/EatCheapAndHealthy. Great because it's a big, salty, scoopable bowl for ~200 kcal.
  {
    id: 'cottage_everything_dip', name: 'Everything-bagel cottage cheese dip with crunchy veg', slots: ['snack'], servings: 1,
    items: [{ food: 'cottage_cheese', grams: 150 }, { food: 'cucumber', grams: 75 }, { food: 'carrots', grams: 85 }, { food: 'sunflower_seeds', grams: 8 }],
    equipment: [], activeMin: 4, totalMin: 4, steps: 3, dopamine: d(3, 2, 2, 2),
    note: 'A blender makes it silky and whipped; a fork gives a chunkier dip that is just as good.',
  },
  // Inspired by: "spicy tuna crispy rice" (the Nobu-style appetiser, RecipeTin Eats) rebuilt on rice cakes, as in Wild
  // Planet's and Seattle YMCA's spicy tuna rice cakes. Great because it's sushi-bar flavour with real crunch and 20 g protein.
  {
    id: 'spicy_tuna_ricecakes', name: 'Spicy tuna crunch rice cakes', slots: ['snack'], servings: 2,
    items: [{ food: 'tuna', grams: 142 }, { food: 'greek_yogurt', grams: 40 }, { food: 'soy_sauce', grams: 5 }, { food: 'lime', grams: 10 }, { food: 'rice_cakes', grams: 36 }, { food: 'cucumber', grams: 80 }, { food: 'avocado', grams: 68 }],
    equipment: [], activeMin: 6, totalMin: 6, steps: 3, dopamine: d(3, 3, 2, 3),
    note: 'Makes 2 servings. Keep the second half of the tuna mix covered in the fridge up to 2 days and build it fresh.',
  },
  // Inspired by: restaurant-style spicy garlic edamame (Pinch of Yum, Skinnytaste, Feel Good Foodie), where the garlic
  // is warmed gently in oil off the heat. Great because the toasty garlic oil, lime and flaky salt make it addictive.
  {
    id: 'chili_lime_edamame', name: 'Garlicky chili-lime edamame', slots: ['snack'], servings: 2,
    items: [{ food: 'edamame', grams: 340 }, { food: 'garlic', grams: 6 }, { food: 'olive_oil', grams: 6 }, { food: 'lime', grams: 15 }],
    equipment: ['microwave'], alt: ['stove', 'pot'], activeMin: 4, totalMin: 7, steps: 3, dopamine: d(1, 3, 2, 3), batch: true,
  },
  // Inspired by: chana chaat, the Indian street snack (Veg Recipes of India, Milk Street's chickpea-cucumber chaat).
  // Great because it's sour, salty, spicy and fresh all at once, with crushed chips standing in for sev.
  {
    id: 'chana_chaat', name: 'Tangy chana chaat with lime & crunchy chips', slots: ['snack'], servings: 2,
    items: [{ food: 'chickpeas', grams: 250 }, { food: 'cucumber', grams: 150 }, { food: 'tomato', grams: 120 }, { food: 'onion', grams: 40 }, { food: 'lime', grams: 20 }, { food: 'cilantro', grams: 8 }, { food: 'tortilla_chips', grams: 15 }],
    equipment: [], activeMin: 8, totalMin: 8, steps: 3, dopamine: d(2, 3, 3, 2),
    note: 'The chickpea mix keeps 2 days in the fridge; crush the chips over just before eating.',
  },
  // Inspired by: Budget Bytes' Greek yogurt tzatziki served as a dip, and the "1/4 cup tzatziki with pita chips" snack
  // portion from Iowa State extension. Great because squeezing the cucumber keeps it thick, and warm crisps make it a treat.
  {
    id: 'tzatziki_tortilla_crisps', name: 'Garlicky tzatziki with cucumber & toasted tortilla crisps', slots: ['snack'], servings: 1,
    items: [{ food: 'greek_yogurt', grams: 140 }, { food: 'cucumber', grams: 100 }, { food: 'garlic', grams: 3 }, { food: 'lemon', grams: 10 }, { food: 'olive_oil', grams: 5 }, { food: 'tortillas', grams: 45 }],
    equipment: ['airfryer'], alt: ['stove', 'skillet'], activeMin: 6, totalMin: 9, steps: 4, dopamine: d(3, 2, 1, 2),
  },
  // Inspired by: Mexican mango with chili and lime (Plating Pixels' chili-lime mango yogurt bowls) and three-ingredient
  // mango-Tajín cottage cheese bowls. Great because the sweet-sour-spicy hit makes plain cottage cheese exciting.
  {
    id: 'mango_chili_cottage', name: 'Chili-lime mango cottage cheese cup', slots: ['snack'], servings: 1,
    items: [{ food: 'cottage_cheese', grams: 130 }, { food: 'mango', grams: 80 }, { food: 'lime', grams: 8 }, { food: 'sunflower_seeds', grams: 6 }],
    equipment: [], activeMin: 3, totalMin: 8, steps: 3, dopamine: d(1, 3, 3, 2),
  },
  // Inspired by: smashed cucumber salad (pai huang gua; America's Test Kitchen on why smashing works) and salted
  // cucumbers as a binge-able snack on r/EatCheapAndHealthy. Great because cracked surfaces soak up the sesame dressing.
  {
    id: 'smashed_cucumber_tahini', name: 'Smashed cucumbers with garlic, tahini & cashews', slots: ['snack'], servings: 1,
    items: [{ food: 'cucumber', grams: 300 }, { food: 'garlic', grams: 4 }, { food: 'soy_sauce', grams: 8 }, { food: 'tahini', grams: 10 }, { food: 'cashews', grams: 20 }],
    equipment: [], activeMin: 6, totalMin: 16, steps: 3, dopamine: d(3, 3, 3, 3),
  },

  // ── Snacks: sweet ────────────────────────────────────────
  // Inspired by: frozen Greek yogurt bark (Bigger Bolder Baking, The Roasted Root, Diabetes Food Hub), spread ¼ inch thin.
  // Great because it eats like a frozen dessert but each piece is mostly protein; the peanut butter swirl makes it rich.
  {
    id: 'yogurt_berry_bark', name: 'Frozen Greek yogurt berry bark', slots: ['snack'], servings: 4,
    items: [{ food: 'greek_yogurt', grams: 600 }, { food: 'strawberries', grams: 150 }, { food: 'honey', grams: 24 }, { food: 'peanut_butter', grams: 32 }, { food: 'dark_chocolate', grams: 30 }],
    equipment: ['sheetpan'], activeMin: 10, totalMin: 190, steps: 4, dopamine: d(2, 2, 3, 3), batch: true,
    note: 'Makes 8 pieces; a serving is 2. Keeps a month in a freezer bag.',
  },
  // Inspired by: chickpea cookie dough (Well Plated, The Real Food Dietitians, Chocolate Covered Katie's original).
  // Great because it really does taste like cookie dough, is safe to eat raw, and is vegan.
  {
    id: 'chickpea_cookie_dough', name: 'Chocolate-chip chickpea cookie dough', slots: ['snack'], servings: 4,
    items: [{ food: 'chickpeas', grams: 250 }, { food: 'peanut_butter', grams: 64 }, { food: 'dates', grams: 60 }, { food: 'dark_chocolate', grams: 30 }, { food: 'soy_milk', grams: 30 }],
    equipment: ['blender'], activeMin: 10, totalMin: 10, steps: 3, dopamine: d(1, 2, 3, 3), batch: true,
    note: 'Keeps 5 days in the fridge. Roll leftovers into balls for grab-and-go bites.',
  },
  // Inspired by: Minimalist Baker's banana "nice cream" guide (chocolate and peanut butter variations) and Chocolate Covered
  // Katie's chocolate peanut butter version. Great because it's soft serve in 5 minutes, dairy-free.
  {
    id: 'choc_pb_soft_serve', name: 'Chocolate peanut butter banana soft serve', slots: ['snack'], servings: 1,
    items: [{ food: 'banana', grams: 120 }, { food: 'peanut_butter', grams: 16 }, { food: 'soy_milk', grams: 50 }, { food: 'dark_chocolate', grams: 10 }, { food: 'hemp_seeds', grams: 10 }],
    equipment: ['blender'], activeMin: 5, totalMin: 5, steps: 3, dopamine: d(1, 2, 2, 3),
    note: 'Keep a bag of ripe banana coins in the freezer so this is always 5 minutes away.',
  },
  // Inspired by: the viral blended cottage cheese chocolate mousse (Choosing Chia, The Big Man's World).
  // Great because a full blend erases every curd, leaving a thick, dark mousse with 15 g protein.
  {
    id: 'cottage_choc_mousse', name: 'Whipped chocolate cottage cheese mousse', slots: ['snack'], servings: 2,
    items: [{ food: 'cottage_cheese', grams: 270 }, { food: 'dark_chocolate', grams: 30 }, { food: 'honey', grams: 12 }],
    equipment: ['microwave', 'blender'], activeMin: 6, totalMin: 36, steps: 3, dopamine: d(0, 3, 3, 2), batch: true,
  },
  // Inspired by: air-fryer apple chips (Williams Sonoma, Evolving Table, Simply Home Cooked) plus apples and Greek yogurt,
  // two go-to snacks on r/EatCheapAndHealthy. Great because thin slices crisp like chips and the dip makes it filling.
  {
    id: 'apple_chips_yogurt_dip', name: 'Air-fryer cinnamon apple chips with peanut butter yogurt dip', slots: ['snack'], servings: 1,
    items: [{ food: 'apple', grams: 180 }, { food: 'greek_yogurt', grams: 140 }, { food: 'honey', grams: 8 }, { food: 'peanut_butter', grams: 10 }, { food: 'cinnamon', grams: 1 }],
    equipment: ['airfryer'], activeMin: 6, totalMin: 22, steps: 3, dopamine: d(3, 2, 2, 3),
  },

  // ── Keto mains ───────────────────────────────────────────
  // Inspired by: crustless keto pizza bowls (One Dish Kitchen, Bites with Bri, All Day I Dream About Food's pizza casserole).
  // Great because the broiled, browned cheese and savoury toppings scratch the pizza itch at about 9 g net carbs.
  {
    id: 'crustless_pizza_bowls', name: 'Crustless supreme pizza bowls', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'ground_beef', grams: 454 }, { food: 'marinara', grams: 240 }, { food: 'mozzarella', grams: 170 }, { food: 'mushrooms', grams: 227 }, { food: 'bell_pepper', grams: 150 }, { food: 'onion', grams: 50 }, { food: 'olives', grams: 40 }, { food: 'garlic', grams: 6 }, { food: 'spinach', grams: 80 }],
    equipment: ['stove', 'skillet', 'oven'], activeMin: 20, totalMin: 25, steps: 4, dopamine: d(1, 3, 2, 3), batch: true,
    note: 'Keto: choose a marinara with no added sugar. Reheat portions to 165°F.',
  },
  // Inspired by: keto Philly cheesesteak skillets (Fed & Fit, Cafe Delites, All Day I Dream About Food) and the chicken
  // cheesesteak you can order in Philadelphia. Great because seared meat, sweet peppers and melted cheese need no bun.
  {
    id: 'chicken_cheesesteak_skillet', name: 'Chicken cheesesteak skillet (no bun)', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'chicken_thigh', grams: 454 }, { food: 'bell_pepper', grams: 300 }, { food: 'onion', grams: 100 }, { food: 'mushrooms', grams: 227 }, { food: 'mozzarella', grams: 113 }, { food: 'olive_oil', grams: 15 }, { food: 'garlic', grams: 6 }, { food: 'pickles', grams: 60 }],
    equipment: ['stove', 'skillet'], activeMin: 25, totalMin: 25, steps: 4, dopamine: d(1, 3, 2, 3), batch: true,
  },
  // Inspired by: low-carb chicken parm, where almond flour and Parmesan replace breadcrumbs (the same crust as nut-and-
  // Parmesan crusted fish). Great because the crust really crisps in a hot oven, and bubbling cheese feels like a night out.
  {
    id: 'almond_parm_chicken', name: 'Almond-Parmesan chicken parm with garlicky zucchini', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'chicken_breast', grams: 454 }, { food: 'almond_flour', grams: 40 }, { food: 'parmesan', grams: 30 }, { food: 'egg', grams: 50 }, { food: 'marinara', grams: 150 }, { food: 'mozzarella', grams: 60 }, { food: 'zucchini', grams: 454 }, { food: 'olive_oil', grams: 15 }, { food: 'garlic', grams: 6 }],
    equipment: ['oven', 'sheetpan', 'stove', 'skillet'], activeMin: 20, totalMin: 35, steps: 4, dopamine: d(2, 3, 1, 3), batch: true,
    note: 'Keto: about 9 g net carbs a serving.',
  },

  // ── AIP mains (also paleo) ───────────────────────────────
  // Inspired by: Eat Beautiful's AIP burgers-and-fries sheet-pan dinner, a reader favourite in Phoenix Helix's AIP
  // round-up, served lettuce-wrapped. Great because it's burger night with one pan and no bun.
  {
    id: 'sheetpan_burgers_fries', name: 'Sheet-pan burgers & sweet potato fries with avocado smash', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'ground_beef', grams: 454 }, { food: 'sweet_potato', grams: 454 }, { food: 'avocado', grams: 136 }, { food: 'lime', grams: 15 }, { food: 'onion', grams: 100 }, { food: 'romaine', grams: 150 }, { food: 'olive_oil', grams: 15 }, { food: 'garlic', grams: 6 }],
    equipment: ['oven', 'sheetpan'], activeMin: 15, totalMin: 35, steps: 4, dopamine: d(2, 3, 1, 3),
    note: 'AIP and paleo as written. Not on AIP? Add black pepper and smoked paprika to the patties.',
  },
  // Inspired by: AIP "nomato" sauce (Detoxinista, Nourish and Nestle, Cotter Crunch), where carrots, beets and pumpkin
  // mimic tomato sauce. Great because it gives AIP eaters back a proper bowl of bolognese.
  {
    id: 'turkey_nomato_zoodles', name: 'Turkey "nomato" bolognese with zucchini noodles', slots: ['dinner', 'lunch'], servings: 4,
    items: [{ food: 'ground_turkey', grams: 454 }, { food: 'onion', grams: 150 }, { food: 'garlic', grams: 10 }, { food: 'carrots', grams: 200 }, { food: 'beets', grams: 250 }, { food: 'pumpkin', grams: 425 }, { food: 'balsamic', grams: 15 }, { food: 'olive_oil', grams: 30 }, { food: 'zucchini', grams: 908 }],
    equipment: ['stove', 'pot', 'blender'], activeMin: 25, totalMin: 45, steps: 5, dopamine: d(1, 2, 3, 1), batch: true,
    note: 'No tomato, peppers or seed spices. The sauce freezes well; make the zucchini noodles fresh.',
  },
  // Inspired by: nightshade-free AIP tom kha gai (Eat Beautiful, Autoimmune Wellness, Unbound Wellness).
  // Great because ginger and a big squeeze of lime at the end make a creamy soup taste bright, no chili needed.
  {
    id: 'coconut_lime_chicken_soup', name: 'Coconut-lime chicken soup with mushrooms & sweet potato', slots: ['lunch', 'dinner'], servings: 3,
    items: [{ food: 'chicken_thigh', grams: 454 }, { food: 'coconut_milk', grams: 400 }, { food: 'mushrooms', grams: 227 }, { food: 'onion', grams: 100 }, { food: 'ginger', grams: 25 }, { food: 'garlic', grams: 10 }, { food: 'lime', grams: 45 }, { food: 'cilantro', grams: 15 }, { food: 'coconut_aminos', grams: 20 }, { food: 'sweet_potato', grams: 300 }, { food: 'spinach', grams: 100 }],
    equipment: ['stove', 'pot'], alt: ['slowcooker'], activeMin: 15, totalMin: 40, steps: 4, dopamine: d(0, 3, 2, 1), batch: true,
    note: 'Tom kha-style and AIP: no chili, pepper or fish sauce. Add the lime only at the end, off the heat.',
  },
  // Inspired by: AIP coconut-crusted chicken and fish recipes (Autoimmune Wellness, Unbound Wellness), where shredded
  // coconut replaces breadcrumbs and egg. Great because they come out crunchy and golden, with a sweet-tart mango dip.
  {
    id: 'coconut_chicken_tenders', name: 'Crispy coconut chicken tenders with mango-lime dip & slaw', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'chicken_breast', grams: 454 }, { food: 'coconut_flakes', grams: 45 }, { food: 'olive_oil', grams: 15 }, { food: 'mango', grams: 150 }, { food: 'lime', grams: 30 }, { food: 'honey', grams: 10 }, { food: 'cabbage', grams: 300 }, { food: 'carrots', grams: 100 }, { food: 'cilantro', grams: 10 }],
    equipment: ['airfryer'], alt: ['oven', 'sheetpan'], activeMin: 20, totalMin: 30, steps: 4, dopamine: d(3, 2, 2, 3),
    note: 'AIP and paleo: no eggs, flour or seed spices. Thaw the mango in the fridge ahead.',
  },
  // Inspired by: Cuban mojo shrimp and tostones (America's Test Kitchen's crispy-tender tostones, the Puerto Rican
  // salt-water dip). Great because the smashed plantains go frilly and crunchy, and the garlic-citrus mojo is bold.
  {
    id: 'citrus_shrimp_tostones', name: 'Garlic-citrus shrimp with crispy tostones & avocado', slots: ['dinner', 'lunch'], servings: 3,
    items: [{ food: 'shrimp', grams: 454 }, { food: 'plantains', grams: 454 }, { food: 'garlic', grams: 15 }, { food: 'orange', grams: 100 }, { food: 'lime', grams: 30 }, { food: 'cilantro', grams: 15 }, { food: 'olive_oil', grams: 30 }, { food: 'cabbage', grams: 250 }, { food: 'avocado', grams: 136 }],
    equipment: ['airfryer', 'stove', 'skillet'], alt: ['oven', 'sheetpan', 'stove', 'skillet'], activeMin: 25, totalMin: 35, steps: 5, dopamine: d(3, 3, 3, 3),
    note: 'Use green plantains: yellow ones turn soft and sweet instead of crisp.',
  },
]

export const METHODS_SNACKS: Record<string, string[]> = {
  // ── Snacks: savoury and crunchy ──
  cottage_everything_dip: [
    'Stir the cottage cheese with ½ tsp garlic powder, ½ tsp onion powder, a pinch of dried dill and ½ tsp cider vinegar. For a whipped dip, blend it for 30 seconds until smooth.',
    'Spoon into a bowl and top with the sunflower seeds, a pinch of flaky salt and plenty of black pepper: that is your "everything" crunch (use 1 tsp everything-bagel seasoning instead if you have it).',
    'Cut the cucumber into thick spears and scoop the dip with the cucumber and baby carrots.',
  ],
  spicy_tuna_ricecakes: [
    'Drain the tuna well and mash it with the Greek yogurt, soy sauce, half the lime juice and 1–2 tsp sriracha until creamy.',
    'Finely dice the cucumber and avocado and toss with the rest of the lime juice and a pinch of salt.',
    'Pile the spicy tuna onto the rice cakes (2 per serving), top with the cucumber-avocado and an extra zigzag of sriracha, and eat right away while the cakes are crisp.',
  ],
  chili_lime_edamame: [
    'Microwave the frozen edamame in a covered bowl with 2 tbsp water for 3–4 minutes, stirring once, until hot right through; drain well. (Or simmer 4 minutes in a pot of water and drain.)',
    'Microwave the olive oil and minced garlic in a small cup for 30–45 seconds, until it sizzles and smells toasty but before it browns (or warm them 1 minute in the empty pot over medium-low heat).',
    'Toss the edamame with the garlic oil, lime juice, 1 tsp sriracha, ½ tsp chili powder and a good pinch of flaky salt. Eat warm or cold.',
  ],
  chana_chaat: [
    'Drain and rinse the chickpeas. Finely dice the cucumber, tomato and onion, and chop the cilantro.',
    'Toss them all with the lime juice, 1 tsp garam masala, ½ tsp cumin, ¼ tsp chili powder and ½ tsp salt. Taste: it should be sharp, salty and a little hot, so add more lime or salt if needed.',
    'Spoon into two bowls and crush the tortilla chips over the top just before eating, for crunch.',
  ],
  tzatziki_tortilla_crisps: [
    'Grate half the cucumber, then squeeze it hard in your hands over the sink to remove the water. Cut the rest into spears.',
    'Stir the grated cucumber into the Greek yogurt with the grated garlic, lemon juice, 1 tsp dried dill and a pinch of salt, then drizzle the olive oil over the top.',
    'Cut the tortilla into 8 wedges and air-fry at 375°F for 4–5 minutes until golden and crisp (or toast it whole in a dry skillet over medium heat, 1–2 minutes a side, then cut).',
    'Dip the warm crisps and cucumber spears into the tzatziki.',
  ],
  mango_chili_cottage: [
    'Let the frozen mango thaw for 5–10 minutes (or microwave 30 seconds) and cut any big chunks smaller.',
    'Toss the mango with the lime juice, ¼ tsp chili powder and a pinch of salt, like a homemade Tajín.',
    'Spoon the mango over the cottage cheese and scatter the sunflower seeds on top.',
  ],
  smashed_cucumber_tahini: [
    'Lay the cucumber on a board and whack it along its length with the flat of a big knife or a rolling pin until it cracks open, then break it into bite-size chunks. Toss with a pinch of salt and leave 10 minutes; pour off the water.',
    'Whisk the grated garlic with the soy sauce, tahini, 2 tsp rice vinegar, ¼ tsp red pepper flakes and 1 tbsp water until creamy.',
    'Toss the cucumber in the dressing and top with the roughly chopped cashews.',
  ],

  // ── Snacks: sweet ──
  yogurt_berry_bark: [
    'Line a sheet pan (or a large plate that fits in your freezer) with parchment. Stir the Greek yogurt with the honey, 1 tsp vanilla and a pinch of salt.',
    'Spread the yogurt about ¼ inch thick. Stir the peanut butter until loose, drop small spoonfuls over the yogurt and drag a knife through to swirl.',
    'Slice the strawberries thinly and press them in, then chop the dark chocolate and scatter it over.',
    'Freeze until firm, at least 3 hours, then break into 8 pieces (2 per serving). Store in a freezer bag and let a piece sit 2–3 minutes before eating.',
  ],
  chickpea_cookie_dough: [
    'Drain and rinse the chickpeas, then rub them in a clean towel so loose skins come off (it makes the dough smoother). Pit the dates.',
    'Blend the chickpeas, dates, peanut butter, 1 tsp vanilla and a big pinch of salt until thick and smooth, adding the soy milk a spoonful at a time and scraping down often.',
    'Chop the dark chocolate and fold it in. Eat with a spoon, or roll into balls and chill.',
  ],
  choc_pb_soft_serve: [
    'Slice a ripe banana and freeze the coins flat for at least 2 hours (ahead of time).',
    'Finely chop the dark chocolate. Blend the frozen banana with the peanut butter, half the chocolate and the soy milk, stopping to scrape down, until it looks like soft serve, 1–2 minutes.',
    'Top with the rest of the chocolate and the hemp seeds and eat straight away.',
  ],
  cottage_choc_mousse: [
    'Break up the dark chocolate and microwave it in 20-second bursts, stirring between each, until smooth.',
    'Blend the cottage cheese with the melted chocolate, honey, ½ tsp vanilla and a pinch of salt for a full 1–2 minutes, scraping down, until completely smooth with no curds left.',
    'Spoon into two glasses and chill at least 30 minutes to set (it firms more overnight). Top with a few flakes of salt.',
  ],
  apple_chips_yogurt_dip: [
    'Heat the air fryer to 325°F. Core the apple and slice it as thin as you can (a mandoline helps), then dust both sides with the cinnamon.',
    'Air-fry in a single layer, in batches, for 12–16 minutes, flipping every 5 minutes, until the edges curl and the slices look dry. They crisp more as they cool on a rack.',
    'Stir the Greek yogurt with the peanut butter, honey and a pinch of salt, and dip the chips.',
  ],

  // ── Keto mains ──
  crustless_pizza_bowls: [
    'Heat the broiler. Slice the mushrooms, dice the bell pepper and onion, mince the garlic and slice the olives.',
    'Brown the ground beef in an oven-safe skillet over medium-high heat with 1 tsp Italian seasoning, 1 tsp smoked paprika, ½ tsp garlic powder, ¼ tsp red pepper flakes and salt, breaking it up, until no pink remains and it reaches 160°F. Spoon off most of the fat.',
    'Add the onion, pepper, mushrooms and garlic and cook 5–6 minutes until the mushrooms brown and their liquid cooks off. Stir in the marinara and spinach and simmer 2 minutes until the spinach wilts.',
    'Scatter the mozzarella and olives over the top and broil 2–3 minutes until the cheese bubbles and browns in spots. Finish with a pinch of oregano and more pepper flakes, then spoon into bowls.',
  ],
  chicken_cheesesteak_skillet: [
    'Slice the chicken thighs into thin strips (easier when half-frozen). Slice the bell peppers, onion and mushrooms, mince the garlic and chop the pickles.',
    'Heat half the oil in a large skillet over medium-high heat. Cook the onion, peppers and mushrooms with a pinch of salt for 7–8 minutes, until soft and browned at the edges, then tip onto a plate.',
    'Add the rest of the oil and the chicken in one layer with 1 tsp garlic powder, 1 tsp smoked paprika, ½ tsp onion powder, salt and pepper. Sear without stirring for 2 minutes, then stir-fry 3–4 minutes more until browned and the chicken reaches 165°F, adding the garlic for the last minute.',
    'Return the vegetables and stir, then lay the mozzarella over the top, cover, and take off the heat for 2 minutes to melt. Top with the pickles and a dash of hot sauce.',
  ],

  almond_parm_chicken: [
    'Heat the oven to 425°F and line a sheet pan. Slice the chicken breasts in half horizontally into thin cutlets. Beat the egg in a shallow bowl, and in another mix the almond flour and Parmesan with 1 tsp Italian seasoning, ½ tsp garlic powder and ½ tsp salt.',
    'Dip each cutlet in the egg, then press it into the crumb on both sides. Lay on the pan, mist with cooking spray and bake 15 minutes until golden underneath.',
    'Flip, spoon the marinara over each cutlet, top with the mozzarella and bake 6–8 minutes more, until the cheese bubbles and the chicken reaches 165°F.',
    'Meanwhile slice the zucchini into half-moons and cook in the olive oil in a skillet over medium-high heat for 5–6 minutes until browned at the edges, adding the minced garlic, a pinch of red pepper flakes and salt for the last minute.',
  ],

  // ── AIP mains ──
  sheetpan_burgers_fries: [
    'Heat the oven to 425°F. Cut the sweet potatoes into ½-inch fries, toss with the oil and ½ tsp salt, and spread in a single layer on one side of a large sheet pan. Roast 15 minutes.',
    'Meanwhile thinly slice half the onion, cover it with cider vinegar and a pinch of salt to quick-pickle. Grate the rest of the onion and the garlic into the beef with 1 tsp dried oregano, ½ tsp garlic powder and ¾ tsp salt, mix gently and shape 4 patties about ¾ inch thick with a dent in the middle.',
    'Flip the fries, add the patties to the pan and roast 12–15 minutes until the fries are browned and the burgers reach 160°F.',
    'Mash the avocado with the lime juice and a pinch of salt. Wrap each burger in romaine leaves with the avocado smash and drained pickled onion, with the fries on the side.',
  ],
  turkey_nomato_zoodles: [
    'Heat half the oil in a large pot over medium-high heat and brown the turkey with a pinch of salt, breaking it up, until no pink remains and it reaches 165°F, 6–8 minutes. Scoop it into a bowl.',
    'Lower the heat to medium. Add the rest of the oil, the chopped onion and garlic, the grated or thinly sliced carrots and ½ cup water. Cover and cook 10–12 minutes, stirring now and then, until the carrots are very soft.',
    'Tip into a blender with the beets, pumpkin, balsamic vinegar and ½–1 cup water and blend until smooth and sauce-like.',
    'Pour the sauce back into the pot with the turkey, 1 tsp dried oregano, ½ tsp dried thyme, 1 bay leaf and salt to taste. Simmer 10 minutes, stirring often, then remove the bay leaf (cooking it much longer dulls the red colour).',
    'Spiralize the zucchini or shave it into ribbons with a peeler, pile into bowls and ladle the hot sauce over; the heat softens the noodles in a minute while they stay springy.',
  ],
  coconut_lime_chicken_soup: [
    'Slice the onion and mushrooms, peel the sweet potato and cut it into ½-inch cubes, and thinly slice the ginger and garlic.',
    'Put the whole chicken thighs, onion, ginger and garlic in a pot with 4 cups water, 1 tsp salt and ½ tsp turmeric. Bring to a boil, then simmer gently 15 minutes until the chicken reaches 165°F. Lift out the chicken and shred it with two forks.',
    'Add the sweet potato and mushrooms to the broth and simmer 10 minutes, until the sweet potato is tender. Stir in the coconut milk and coconut aminos and heat through without boiling hard. (Slow cooker: everything but the spinach, lime and cilantro on low 6 hours.)',
    'Return the chicken and stir in the spinach until it wilts. Turn off the heat, add the lime juice, then taste: it should be tangy and salty, so add salt or lime as needed. Top with chopped cilantro.',
  ],
  coconut_chicken_tenders: [
    'Heat the air fryer to 400°F (or the oven to 425°F with a lined sheet pan). Cut the chicken breasts into finger-size strips and toss with the oil, a squeeze of the lime juice, ¾ tsp salt and ½ tsp garlic powder.',
    'Crush the coconut flakes smaller in your hands, then press each strip into them to coat all over.',
    'Air-fry in a single layer, in batches, for 9–11 minutes, flipping halfway, until golden and the chicken reaches 165°F (oven: 15–18 minutes). Watch the last few minutes, as coconut browns fast.',
    'Mash the thawed mango with half the remaining lime juice, the honey and a pinch of salt for the dip. Shred the cabbage, grate the carrots and toss with the rest of the lime juice, the chopped cilantro and a pinch of salt.',
  ],
  citrus_shrimp_tostones: [
    'Thaw the shrimp. For the mojo, grate the garlic into the orange and lime juice with 1 tsp dried oregano and ½ tsp salt.',
    'Peel the green plantains (cut off the ends, slit the skin lengthwise and pry it off) and cut into 1-inch chunks. Toss with a third of the oil and air-fry at 360°F for 8–10 minutes, until tender but still pale (oven: 400°F for 15 minutes).',
    'Smash each piece to about ¼ inch with the bottom of a glass, dip it quickly in a bowl of salted water, brush with another third of the oil and air-fry at 400°F for 8–10 minutes until golden and crisp (oven: 450°F for 15–20 minutes, flipping once). Salt right away.',
    'Meanwhile heat the remaining oil in a skillet over medium-high heat and cook the shrimp 2 minutes per side until pink and opaque. Pour in half the mojo and let it bubble for 30 seconds.',
    'Toss the shredded cabbage with the rest of the mojo. Serve the shrimp with the tostones, slaw, sliced avocado and chopped cilantro.',
  ],
}

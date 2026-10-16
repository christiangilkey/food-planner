import type { Aisle, Food, FoodGroup, Nutrients } from '../types'

// Values are per 100 g, approximated from USDA FoodData Central (SR Legacy / FNDDS).
// Prices are rough 2026 US-average shelf prices for the listed package; the app
// scales them by a regional multiplier and lets you override them per store.

type Row = [
  kcal: number, protein: number, carbs: number, fat: number, sugar: number, water: number,
  sodium: number, fiber: number, calcium: number, iron: number, magnesium: number,
  potassium: number, zinc: number, vitA: number, vitC: number, vitD: number, vitE: number,
  vitK: number, folate: number, b12: number, omega3: number,
]

function food(
  id: string,
  name: string,
  aisle: Aisle,
  packageGrams: number,
  packageLabel: string,
  packagePrice: number,
  shelfDays: number,
  r: Row,
): Food {
  const [kcal, protein, carbs, fat, sugar, water, sodium, fiber, calcium, iron, magnesium,
    potassium, zinc, vitA, vitC, vitD, vitE, vitK, folate, b12, omega3] = r
  const n: Nutrients = {
    kcal, protein, carbs, fat, sugar, water, sodium, fiber, calcium, iron, magnesium,
    potassium, zinc, vitA, vitC, vitD, vitE, vitK, folate, b12, omega3, choline: 0, b6: 0, selenium: 0, satFat: 0, addedSugar: 0,
  }
  // Brain nutrients, serving size and groups are filled in from DETAILS below.
  return { id, name, aisle, packageGrams, packageLabel, packagePrice, shelfDays, n, serving: 100, groups: [], plants: [] }
}

//                                                                       kcal  P     C     F     sug   H2O  Na    fib   Ca   Fe    Mg   K    Zn   A    C    D    E    K    fol  B12  ω3
export const FOODS: Food[] = [
  // Meat & Seafood
  food('chicken_breast', 'Chicken breast', 'Meat & Seafood', 454, '1 lb pack', 4.5, 4,    [120, 22.5, 0, 2.6, 0, 75, 45, 0, 5, 0.4, 28, 334, 0.7, 9, 0, 0.1, 0.2, 0, 4, 0.2, 0.03]),
  food('chicken_thigh', 'Chicken thighs (boneless)', 'Meat & Seafood', 454, '1 lb pack', 3.6, 4, [121, 19.7, 0, 4.1, 0, 76, 95, 0, 8, 0.8, 23, 270, 1.6, 18, 0, 0.1, 0.2, 2, 8, 0.5, 0.04]),
  food('rotisserie', 'Rotisserie chicken (meat)', 'Meat & Seafood', 700, '1 whole chicken', 6.5, 4, [190, 28.9, 0, 7.4, 0, 64, 300, 0, 15, 1.2, 25, 243, 2.0, 16, 0, 0.1, 0.3, 2, 6, 0.3, 0.1]),
  food('ground_beef', 'Ground beef 85%', 'Meat & Seafood', 454, '1 lb pack', 6.0, 3,    [215, 18.6, 0, 15, 0, 66, 66, 0, 18, 2.1, 18, 289, 4.5, 0, 0, 0.1, 0.4, 1.5, 7, 2.2, 0.05]),
  food('ground_turkey', 'Ground turkey 93%', 'Meat & Seafood', 454, '1 lb pack', 5.5, 3,  [150, 19.7, 0, 7.7, 0, 72, 70, 0, 20, 1.2, 22, 230, 2.4, 0, 0, 0.3, 0.2, 0, 7, 1.2, 0.05]),
  food('salmon', 'Salmon fillet', 'Meat & Seafood', 454, '1 lb', 10.0, 3,              [208, 20.4, 0, 13.4, 0, 65, 59, 0, 9, 0.3, 27, 363, 0.4, 58, 3.9, 11, 1.8, 0.5, 26, 3.2, 2.5]),
  food('shrimp', 'Shrimp (frozen, raw)', 'Frozen', 454, '1 lb bag', 8.0, 180,          [85, 20, 0, 0.5, 0, 80, 400, 0, 64, 0.2, 22, 113, 1.1, 0, 0, 0, 1.3, 0, 19, 1.1, 0.3]),
  food('tuna', 'Canned tuna (in water)', 'Canned & Dry', 142, '5 oz can', 1.4, 730,     [116, 25.5, 0, 0.8, 0, 74, 300, 0, 11, 1.5, 27, 237, 0.8, 6, 0, 1.7, 0.3, 0, 4, 2.5, 0.27]),
  food('sardines', 'Sardines (canned in oil)', 'Canned & Dry', 106, '3.75 oz can', 2.0, 730, [208, 24.6, 0, 11.5, 0, 60, 307, 0, 382, 2.9, 39, 397, 1.3, 32, 0, 4.8, 2.0, 2.6, 10, 8.9, 1.5]),
  food('deli_turkey', 'Deli turkey', 'Meat & Seafood', 227, '8 oz pack', 5.0, 7,       [104, 17, 3, 2, 2, 75, 1000, 0, 10, 0.6, 20, 300, 1.0, 0, 0, 0.1, 0.1, 0, 5, 0.4, 0.02]),
  food('jerky', 'Beef jerky', 'Snacks', 81, '2.85 oz bag', 6.0, 180,                   [410, 33, 11, 25.6, 9, 23, 1785, 1.8, 20, 5.4, 51, 597, 8.1, 0, 0, 0.1, 0.5, 2, 134, 1.0, 0.1]),

  // Dairy & Eggs
  food('egg', 'Eggs (large)', 'Dairy & Eggs', 600, '1 dozen', 3.5, 35,                 [143, 12.6, 0.7, 9.5, 0.4, 76, 142, 0, 56, 1.8, 12, 138, 1.3, 160, 0, 2.0, 1.1, 0.3, 47, 0.9, 0.1]),
  food('greek_yogurt', 'Greek yogurt (plain, nonfat)', 'Dairy & Eggs', 907, '32 oz tub', 5.5, 21, [59, 10.2, 3.6, 0.4, 3.2, 85, 36, 0, 110, 0.1, 11, 141, 0.5, 1, 0, 0, 0, 0, 7, 0.75, 0]),
  food('cottage_cheese', 'Cottage cheese 2%', 'Dairy & Eggs', 454, '16 oz tub', 3.5, 14, [81, 10.5, 4.8, 2.3, 4, 81, 308, 0, 111, 0.1, 9, 125, 0.5, 20, 0, 0, 0, 0, 13, 0.5, 0]),
  food('milk', 'Milk 2%', 'Dairy & Eggs', 1950, '1/2 gallon', 2.8, 10,                 [50, 3.3, 4.8, 2.0, 5.1, 89, 47, 0, 120, 0, 11, 140, 0.5, 55, 0, 1.2, 0, 0.2, 5, 0.5, 0.01]),
  food('cheddar', 'Cheddar cheese', 'Dairy & Eggs', 227, '8 oz block', 3.5, 30,        [403, 24.9, 1.3, 33, 0.5, 37, 621, 0, 721, 0.7, 28, 98, 3.1, 265, 0, 0.6, 0.3, 2.8, 18, 0.8, 0.4]),
  food('string_cheese', 'String cheese', 'Dairy & Eggs', 336, '12 sticks', 4.5, 30,    [254, 24.3, 2.8, 15.9, 1, 54, 619, 0, 782, 0.2, 23, 95, 2.8, 127, 0, 0.3, 0.4, 1.6, 9, 0.8, 0.2]),
  food('butter', 'Butter', 'Dairy & Eggs', 454, '1 lb', 5.0, 60,                       [717, 0.9, 0.1, 81, 0.1, 16, 576, 0, 24, 0, 2, 24, 0.1, 684, 0, 1.5, 2.3, 7, 3, 0.2, 0.3]),

  // Plant proteins, nuts, seeds
  food('tofu', 'Tofu (firm)', 'Produce', 396, '14 oz block', 2.5, 14,                  [144, 17.3, 2.8, 8.7, 0.6, 70, 14, 2.3, 683, 2.7, 58, 237, 1.6, 8, 0, 0, 0, 2.4, 29, 0, 0.6]),
  food('black_beans', 'Black beans (canned)', 'Canned & Dry', 250, '15 oz can (~9 oz drained)', 1.1, 730, [91, 6, 16.6, 0.3, 0.3, 75, 230, 6.9, 35, 1.9, 40, 230, 0.7, 0, 0, 0, 0.6, 3, 74, 0, 0.1]),
  food('chickpeas', 'Chickpeas (canned)', 'Canned & Dry', 250, '15 oz can (~9 oz drained)', 1.2, 730, [139, 7, 22.5, 2.6, 4, 66, 212, 7.6, 43, 1.3, 29, 172, 1.2, 1, 0.5, 0, 0.3, 4, 70, 0, 0.05]),
  food('lentils', 'Lentils (dry)', 'Canned & Dry', 454, '1 lb bag', 1.8, 365,          [352, 24.6, 63, 1.1, 2, 8, 6, 10.7, 35, 6.5, 47, 677, 3.3, 2, 4.5, 0, 0.5, 5, 479, 0, 0.1]),
  food('edamame', 'Edamame (frozen, shelled)', 'Frozen', 340, '12 oz bag', 2.5, 180,   [121, 11.9, 8.9, 5.2, 2.2, 73, 6, 5.2, 63, 2.3, 64, 436, 1.4, 15, 6.1, 0, 0.7, 27, 311, 0, 0.36]),
  food('peanut_butter', 'Peanut butter', 'Condiments & Oils', 454, '16 oz jar', 3.0, 180, [588, 25, 20, 50, 9, 1, 350, 6, 43, 1.9, 154, 649, 2.5, 0, 0, 0, 9.0, 0.3, 87, 0, 0.003]),
  food('almonds', 'Almonds', 'Snacks', 454, '16 oz bag', 7.0, 180,                     [579, 21, 21.6, 50, 4.4, 4, 1, 12.5, 269, 3.7, 270, 733, 3.1, 0, 0, 0, 25.6, 0, 44, 0, 0.003]),
  food('walnuts', 'Walnuts', 'Snacks', 227, '8 oz bag', 5.0, 180,                      [654, 15.2, 13.7, 65, 2.6, 4, 2, 6.7, 98, 2.9, 158, 441, 3.1, 1, 1.3, 0, 0.7, 2.7, 98, 0, 9.1]),
  food('pumpkin_seeds', 'Pumpkin seeds (pepitas)', 'Snacks', 227, '8 oz bag', 5.0, 180, [559, 30, 10.7, 49, 1.4, 5, 7, 6, 46, 8.8, 592, 809, 7.8, 1, 1.9, 0, 2.2, 7.3, 58, 0, 0.12]),
  food('chia', 'Chia seeds', 'Canned & Dry', 340, '12 oz bag', 6.0, 365,               [486, 16.5, 42, 30.7, 0, 6, 16, 34.4, 631, 7.7, 335, 407, 4.6, 0, 1.6, 0, 0.5, 0, 49, 0, 17.8]),
  food('protein_powder', 'Whey protein powder', 'Canned & Dry', 907, '2 lb tub', 30.0, 365, [400, 78, 8, 6, 4, 4, 200, 1, 500, 1.5, 100, 600, 2, 0, 0, 0, 0, 0, 0, 1, 0]),

  // Grains & starches
  food('oats', 'Rolled oats', 'Bakery & Grains', 1190, '42 oz canister', 5.0, 365,     [379, 13.2, 67.7, 6.5, 1, 9, 6, 10.1, 52, 4.3, 138, 362, 3.6, 0, 0, 0, 0.4, 2, 32, 0, 0.1]),
  food('white_rice', 'White rice (dry)', 'Bakery & Grains', 907, '2 lb bag', 2.5, 730,  [365, 7.1, 80, 0.7, 0.1, 12, 5, 1.3, 28, 4.3, 25, 115, 1.1, 0, 0, 0, 0.1, 0.1, 231, 0, 0.02]),
  food('brown_rice', 'Brown rice (dry)', 'Bakery & Grains', 907, '2 lb bag', 3.0, 365,  [367, 7.5, 76, 3.2, 0.7, 12, 7, 3.6, 23, 1.5, 143, 250, 2.0, 0, 0, 0, 0.6, 1.9, 20, 0, 0.04]),
  food('pasta', 'Pasta (dry)', 'Bakery & Grains', 454, '16 oz box', 1.6, 730,          [371, 13, 75, 1.5, 2.7, 10, 6, 3.2, 21, 3.3, 53, 223, 1.4, 0, 0, 0, 0.1, 0.1, 237, 0, 0.02]),
  food('bread', 'Whole wheat bread', 'Bakery & Grains', 680, '24 oz loaf', 3.5, 7,      [252, 12.4, 43, 3.5, 4.4, 38, 450, 6, 120, 2.5, 76, 250, 1.8, 0, 0, 0, 0.3, 7.8, 42, 0, 0.1]),
  food('tortillas', 'Flour tortillas', 'Bakery & Grains', 450, '10 count', 3.0, 21,     [304, 8, 50, 8, 2, 32, 650, 3.5, 130, 3.6, 22, 128, 0.6, 0, 0, 0, 0.1, 3, 120, 0, 0.1]),
  food('cereal', 'Whole-grain O\'s cereal (fortified)', 'Bakery & Grains', 510, '18 oz box', 4.5, 180, [376, 12, 74, 6.7, 4.4, 4, 500, 10, 330, 30, 100, 600, 10, 300, 15, 3.4, 0.5, 2, 600, 1.5, 0.05]),
  food('rice_cakes', 'Rice cakes', 'Snacks', 127, '14 cakes', 2.5, 180,                 [387, 8.2, 81.5, 2.8, 0.9, 6, 33, 4.2, 11, 1.5, 131, 290, 3.0, 0, 0, 0, 0.1, 0, 21, 0, 0.03]),
  food('potato', 'Potatoes (russet)', 'Produce', 2268, '5 lb bag', 4.0, 30,             [79, 2.1, 18, 0.1, 0.6, 79, 5, 1.3, 13, 0.9, 23, 417, 0.3, 0, 5.7, 0, 0, 1.9, 18, 0, 0.01]),
  food('sweet_potato', 'Sweet potatoes', 'Produce', 454, '1 lb (~2)', 1.3, 21,          [86, 1.6, 20, 0.1, 4.2, 77, 55, 3, 30, 0.6, 25, 337, 0.3, 709, 2.4, 0, 0.3, 1.8, 11, 0, 0]),
  food('popcorn', 'Popcorn kernels', 'Snacks', 850, '30 oz jar', 3.5, 365,             [387, 12.9, 77.8, 4.5, 0.9, 4, 8, 14.5, 7, 3.2, 144, 329, 3.1, 10, 0, 0, 0.5, 1.2, 31, 0, 0.02]),

  // Produce
  food('banana', 'Bananas', 'Produce', 454, '~4 bananas', 0.8, 6,                      [89, 1.1, 22.8, 0.3, 12.2, 75, 1, 2.6, 5, 0.3, 27, 358, 0.2, 3, 8.7, 0, 0.1, 0.5, 20, 0, 0.03]),
  food('apple', 'Apples', 'Produce', 1360, '3 lb bag', 5.0, 30,                        [52, 0.3, 13.8, 0.2, 10.4, 86, 1, 2.4, 6, 0.1, 5, 107, 0, 3, 4.6, 0, 0.2, 2.2, 3, 0, 0.01]),
  food('clementine', 'Clementines', 'Produce', 1100, '3 lb bag', 5.0, 14,              [47, 0.9, 12, 0.2, 9.2, 87, 1, 1.7, 30, 0.1, 10, 177, 0.1, 1, 48.8, 0, 0.2, 0, 24, 0, 0.01]),
  food('berries', 'Mixed berries (frozen)', 'Frozen', 454, '16 oz bag', 4.0, 180,      [50, 0.8, 12, 0.4, 7.5, 86, 1, 3.3, 17, 0.4, 13, 120, 0.2, 3, 25, 0, 0.8, 15, 20, 0, 0.08]),
  food('avocado', 'Avocados', 'Produce', 272, '2 avocados', 2.5, 5,                     [160, 2, 8.5, 14.7, 0.7, 73, 7, 6.7, 12, 0.6, 29, 485, 0.6, 7, 10, 0, 2.1, 21, 81, 0, 0.11]),
  food('spinach', 'Spinach (baby)', 'Produce', 283, '10 oz bag', 3.0, 6,                [23, 2.9, 3.6, 0.4, 0.4, 91, 79, 2.2, 99, 2.7, 79, 558, 0.5, 469, 28, 0, 2.0, 483, 194, 0, 0.14]),
  food('broccoli', 'Broccoli (frozen)', 'Frozen', 340, '12 oz bag', 2.0, 180,          [34, 2.8, 6.6, 0.4, 1.7, 89, 33, 2.6, 47, 0.7, 21, 316, 0.4, 31, 89, 0, 0.8, 102, 63, 0, 0.02]),
  food('stirfry_veg', 'Stir-fry vegetable mix (frozen)', 'Frozen', 454, '16 oz bag', 2.5, 180, [40, 2, 7, 0.2, 3, 89, 30, 2.5, 35, 0.6, 15, 200, 0.3, 150, 30, 0, 0.5, 40, 30, 0, 0.03]),
  food('bell_pepper', 'Bell peppers (red)', 'Produce', 300, '2 peppers', 2.5, 10,       [31, 1, 6, 0.3, 4.2, 92, 4, 2.1, 7, 0.4, 12, 211, 0.3, 157, 128, 0, 1.6, 4.9, 46, 0, 0.03]),
  food('carrots', 'Baby carrots', 'Produce', 454, '1 lb bag', 1.5, 21,                   [35, 0.6, 8.2, 0.1, 4.8, 90, 78, 2.9, 32, 0.9, 10, 237, 0.2, 690, 2.6, 0, 0.6, 9.4, 27, 0, 0]),
  food('onion', 'Yellow onions', 'Produce', 1360, '3 lb bag', 3.5, 30,                  [40, 1.1, 9.3, 0.1, 4.2, 89, 4, 1.7, 23, 0.2, 10, 146, 0.2, 0, 7.4, 0, 0, 0.4, 19, 0, 0]),
  food('cucumber', 'Cucumber', 'Produce', 300, '1 cucumber', 0.9, 7,                    [15, 0.7, 3.6, 0.1, 1.7, 95, 2, 0.5, 16, 0.3, 13, 147, 0.2, 5, 2.8, 0, 0, 16.4, 7, 0, 0]),
  food('canned_tomatoes', 'Diced tomatoes (canned)', 'Canned & Dry', 411, '14.5 oz can', 1.2, 730, [20, 0.8, 4, 0.1, 2.6, 93, 180, 1.0, 30, 1.3, 11, 190, 0.1, 20, 9, 0, 0.6, 2.6, 8, 0, 0]),

  // Snacks & condiments
  food('dark_chocolate', 'Dark chocolate (70–85%)', 'Snacks', 100, '3.5 oz bar', 3.5, 365, [598, 7.8, 45.9, 42.6, 24, 1, 20, 10.9, 73, 11.9, 228, 715, 3.3, 2, 0, 0, 0.6, 7.3, 0, 0.3, 0.03]),
  food('tortilla_chips', 'Tortilla chips', 'Snacks', 369, '13 oz bag', 4.0, 60,        [489, 7, 63, 23, 1, 2, 330, 5.3, 150, 1.5, 80, 196, 1.5, 0, 0, 0, 1.6, 9, 12, 0, 0.6]),
  food('hummus', 'Hummus', 'Dairy & Eggs', 283, '10 oz tub', 4.0, 10,                   [166, 7.9, 14.3, 9.6, 0.3, 65, 379, 6, 38, 2.4, 71, 228, 1.8, 1, 0, 0, 0.8, 3, 83, 0, 0.1]),
  food('salsa', 'Salsa', 'Condiments & Oils', 454, '16 oz jar', 3.0, 21,               [36, 1.5, 7, 0.2, 4, 89, 600, 1.9, 30, 0.4, 15, 275, 0.2, 22, 4, 0, 1.2, 5, 4, 0, 0]),
  food('pickles', 'Dill pickles', 'Condiments & Oils', 680, '24 oz jar', 3.0, 90,       [12, 0.5, 2.4, 0.2, 1.1, 94, 875, 1, 10, 0.3, 4, 117, 0.1, 9, 1, 0, 0.1, 48, 1, 0, 0]),
  food('kimchi', 'Kimchi', 'Condiments & Oils', 454, '16 oz jar', 6.0, 60,              [15, 1.1, 2.4, 0.5, 1.1, 92, 498, 1.6, 33, 2.5, 14, 151, 0.2, 5, 18, 0, 0.1, 43, 52, 0, 0.05]),
  food('olive_oil', 'Olive oil', 'Condiments & Oils', 458, '500 mL bottle', 8.0, 365,   [884, 0, 0, 100, 0, 0, 2, 0, 1, 0.6, 0, 1, 0, 0, 0, 0, 14.4, 60, 0, 0, 0.76]),
  food('soy_sauce', 'Soy sauce', 'Condiments & Oils', 296, '10 oz bottle', 2.5, 365,    [53, 8.1, 4.9, 0.6, 0.4, 71, 5493, 0.8, 33, 1.5, 43, 435, 0.4, 0, 0, 0, 0, 0, 14, 0, 0]),
  food('honey', 'Honey', 'Condiments & Oils', 340, '12 oz bottle', 5.0, 730,           [304, 0.3, 82, 0, 82, 17, 4, 0.2, 6, 0.4, 2, 52, 0.2, 0, 0.5, 0, 0, 0, 2, 0, 0]),

  // ── Added: more common ingredients ──
  food('pork_loin', 'Pork tenderloin', 'Meat & Seafood', 454, '1 lb', 4.5, 4, [120, 21, 0, 3.5, 0, 75, 52, 0, 5, 1, 27, 399, 1.9, 0, 0, 0.5, 0.2, 0, 0, 0.5, 0.02]),
  food('sirloin', 'Sirloin steak', 'Meat & Seafood', 454, '1 lb', 9, 4, [160, 20.8, 0, 8.4, 0, 70, 56, 0, 20, 1.6, 22, 340, 3.9, 0, 0, 0.1, 0.4, 1.4, 12, 1.4, 0.03]),
  food('cod', 'Cod fillets (frozen)', 'Frozen', 454, '1 lb bag', 8, 180, [82, 18, 0, 0.7, 0, 81, 54, 0, 16, 0.4, 32, 413, 0.5, 12, 1, 0.9, 0.6, 0.1, 7, 0.9, 0.2]),
  food('tilapia', 'Tilapia fillets (frozen)', 'Frozen', 907, '2 lb bag', 9, 180, [96, 20, 0, 1.7, 0, 78, 52, 0, 10, 0.6, 27, 302, 0.3, 0, 0, 3.1, 0.4, 1.4, 24, 1.6, 0.14]),
  food('canned_salmon', 'Canned salmon (pink)', 'Canned & Dry', 418, '14.75 oz can', 4.5, 730, [139, 23, 0, 5, 0, 70, 380, 0, 210, 0.8, 32, 280, 0.9, 25, 0, 11.6, 1.1, 0.3, 15, 4.4, 1.3]),
  food('feta', 'Feta cheese', 'Dairy & Eggs', 170, '6 oz', 4, 30, [264, 14.2, 4.1, 21.3, 4.1, 55, 1116, 0, 493, 0.7, 19, 62, 2.9, 125, 0, 0.4, 0.2, 1.8, 32, 1.7, 0.3]),
  food('parmesan', 'Parmesan cheese', 'Dairy & Eggs', 142, '5 oz', 4.5, 60, [392, 35.8, 3.2, 25.8, 0.8, 29, 1529, 0, 1184, 0.8, 44, 92, 2.8, 207, 0, 0.5, 0.2, 1.7, 7, 1.2, 0.5]),
  food('kefir', 'Kefir (plain, low-fat)', 'Dairy & Eggs', 946, '32 oz bottle', 4, 14, [41, 3.8, 4.5, 1, 4.6, 90, 40, 0, 130, 0.04, 12, 164, 0.5, 57, 0.2, 1.1, 0.02, 0.1, 0, 0.3, 0.01]),
  food('almond_milk', 'Almond milk (unsweetened, fortified)', 'Dairy & Eggs', 1890, '1/2 gallon', 3.5, 10, [15, 0.6, 0.3, 1.2, 0, 98, 72, 0.2, 184, 0.3, 6, 70, 0.1, 42, 0, 1, 6.3, 0, 0, 0, 0]),
  food('pinto_beans', 'Pinto beans (canned)', 'Canned & Dry', 250, '15 oz can (~9 oz drained)', 1.1, 730, [110, 6.5, 19.6, 0.9, 0.3, 72, 240, 5.5, 39, 1.4, 36, 270, 0.7, 0, 0.8, 0, 0.9, 3, 70, 0, 0.1]),
  food('kidney_beans', 'Kidney beans (canned)', 'Canned & Dry', 250, '15 oz can (~9 oz drained)', 1.1, 730, [110, 7.2, 20, 0.6, 0.3, 71, 200, 6.2, 35, 1.6, 35, 300, 0.7, 0, 1, 0, 0.03, 5, 60, 0, 0.1]),
  food('cashews', 'Cashews', 'Snacks', 227, '8 oz bag', 5, 180, [553, 18.2, 30.2, 43.9, 5.9, 5, 12, 3.3, 37, 6.7, 292, 660, 5.8, 0, 0.5, 0, 0.9, 34, 25, 0, 0.06]),
  food('sunflower_seeds', 'Sunflower seeds (unsalted)', 'Snacks', 227, '8 oz bag', 3, 180, [582, 19.3, 24, 49.8, 2.7, 1, 3, 9, 70, 3.8, 129, 850, 5.3, 0, 1.4, 0, 26, 2.7, 238, 0, 0.07]),
  food('flaxseed', 'Ground flaxseed', 'Canned & Dry', 454, '16 oz bag', 4, 120, [534, 18.3, 28.9, 42.2, 1.6, 7, 30, 27.3, 255, 5.7, 392, 813, 4.3, 0, 0.6, 0, 0.3, 4.3, 87, 0, 22.8]),
  food('quinoa', 'Quinoa (dry)', 'Bakery & Grains', 340, '12 oz bag', 4, 365, [368, 14.1, 64.2, 6.1, 0, 13, 5, 7, 47, 4.6, 197, 563, 3.1, 1, 0, 0, 2.4, 0, 184, 0, 0.26]),
  food('ww_pasta', 'Whole-wheat pasta (dry)', 'Bakery & Grains', 454, '16 oz box', 2, 730, [348, 14.6, 71.3, 1.4, 3.6, 10, 8, 8, 40, 3.6, 143, 215, 2.4, 0, 0, 0, 0.6, 0.8, 44, 0, 0.03]),
  food('corn_tortillas', 'Corn tortillas', 'Bakery & Grains', 750, '30 count', 3, 21, [218, 5.7, 44.6, 2.9, 0.9, 46, 45, 6.3, 81, 1.2, 72, 186, 1.3, 0, 0, 0, 0.3, 0.3, 5, 0, 0.06]),
  food('corn', 'Sweet corn (frozen)', 'Frozen', 454, '16 oz bag', 2, 180, [88, 3, 21, 0.8, 3.2, 74, 3, 2.1, 3, 0.5, 23, 213, 0.5, 9, 3.3, 0, 0.07, 0.3, 35, 0, 0.02]),
  food('peas', 'Green peas (frozen)', 'Frozen', 454, '16 oz bag', 2, 180, [77, 5.2, 13.6, 0.4, 4.7, 79, 108, 4.5, 24, 1.5, 22, 153, 0.7, 104, 18, 0, 0.2, 22.8, 59, 0, 0.03]),
  food('garlic', 'Garlic', 'Produce', 50, '1 head', 0.6, 30, [149, 6.4, 33, 0.5, 1, 59, 17, 2.1, 181, 1.7, 25, 401, 1.2, 0, 31, 0, 0.1, 1.7, 3, 0, 0.02]),
  food('lemon', 'Lemons (juice)', 'Produce', 135, '3 lemons', 2, 21, [22, 0.4, 6.9, 0.2, 2.5, 92, 1, 0.3, 6, 0.1, 6, 103, 0.05, 1, 38.7, 0, 0.2, 0, 20, 0, 0.01]),
  food('tomato', 'Tomatoes (fresh)', 'Produce', 454, '1 lb (~3)', 2, 7, [18, 0.9, 3.9, 0.2, 2.6, 95, 5, 1.2, 10, 0.3, 11, 237, 0.2, 42, 13.7, 0, 0.5, 7.9, 15, 0, 0]),
  food('romaine', 'Romaine lettuce', 'Produce', 500, '3 hearts', 3.5, 7, [17, 1.2, 3.3, 0.3, 1.2, 95, 8, 2.1, 33, 1, 14, 247, 0.2, 436, 4, 0, 0.1, 102.5, 136, 0, 0.11]),
  food('kale', 'Kale', 'Produce', 283, '10 oz bag', 3, 7, [35, 2.9, 4.4, 1.5, 1, 90, 53, 4.1, 254, 1.6, 33, 348, 0.4, 241, 93, 0, 0.7, 390, 62, 0, 0.18]),
  food('cabbage', 'Green cabbage', 'Produce', 900, '1 head', 2.5, 21, [25, 1.3, 5.8, 0.1, 3.2, 92, 18, 2.5, 40, 0.5, 12, 170, 0.2, 5, 36.6, 0, 0.15, 76, 43, 0, 0]),
  food('cauliflower', 'Cauliflower florets', 'Frozen', 340, '12 oz bag', 2.5, 180, [25, 1.9, 5, 0.3, 1.9, 92, 30, 2, 22, 0.4, 15, 299, 0.3, 0, 48, 0, 0.1, 15.5, 57, 0, 0.04]),
  food('green_beans', 'Green beans (frozen)', 'Frozen', 340, '12 oz bag', 2, 180, [31, 1.8, 7, 0.2, 3.3, 90, 6, 2.7, 37, 1, 25, 211, 0.2, 35, 12.2, 0, 0.4, 43, 33, 0, 0.04]),
  food('zucchini', 'Zucchini', 'Produce', 454, '2 zucchini', 2, 7, [17, 1.2, 3.1, 0.3, 2.5, 95, 8, 1, 16, 0.4, 18, 261, 0.3, 10, 17.9, 0, 0.1, 4.3, 24, 0, 0.1]),
  food('mushrooms', 'White mushrooms', 'Produce', 227, '8 oz pack', 2.5, 7, [22, 3.1, 3.3, 0.3, 2, 92, 5, 1, 3, 0.5, 9, 318, 0.5, 0, 2.1, 0.2, 0, 0, 17, 0.04, 0]),
  food('celery', 'Celery', 'Produce', 450, '1 bunch', 2, 14, [14, 0.7, 3, 0.2, 1.3, 95, 80, 1.6, 40, 0.2, 11, 260, 0.1, 22, 3.1, 0, 0.3, 29.3, 36, 0, 0]),
  food('mango', 'Mango chunks (frozen)', 'Frozen', 454, '16 oz bag', 3.5, 180, [60, 0.8, 15, 0.4, 13.7, 84, 1, 1.6, 11, 0.2, 10, 168, 0.1, 54, 36.4, 0, 0.9, 4.2, 43, 0, 0.05]),
  food('grapes', 'Grapes', 'Produce', 907, '2 lb bag', 5, 10, [69, 0.7, 18, 0.2, 15.5, 81, 2, 0.9, 10, 0.4, 7, 191, 0.1, 3, 3.2, 0, 0.2, 14.6, 2, 0, 0.01]),
  food('strawberries', 'Strawberries (fresh)', 'Produce', 454, '1 lb', 3.5, 5, [32, 0.7, 7.7, 0.3, 4.9, 91, 1, 2, 16, 0.4, 13, 153, 0.1, 1, 58.8, 0, 0.3, 2.2, 24, 0, 0.07]),
  food('marinara', 'Marinara sauce', 'Condiments & Oils', 680, '24 oz jar', 3, 14, [51, 1.4, 7.7, 1.5, 5.5, 87, 430, 1.9, 27, 0.8, 18, 314, 0.2, 25, 2, 0, 2, 9, 10, 0, 0.04]),
  food('broth', 'Chicken broth (low-sodium)', 'Canned & Dry', 946, '32 oz carton', 2.5, 7, [6, 0.6, 0.4, 0.2, 0.2, 98, 140, 0, 2, 0.1, 1, 30, 0, 0, 0, 0, 0, 0, 1, 0, 0]),
]

type Detail = [choline: number, b6: number, selenium: number, serving: number, groups: FoodGroup[], plants: string[]]

// Per 100 g: choline (mg), vitamin B6 (mg), selenium (µg), approximated from USDA data.
// serving = one standard serving in grams as bought (e.g. 45 g dry lentils ≈ ½ cup cooked).
// plants = plant species, for the weekly plant-diversity count.
export const DETAILS: Record<string, Detail> = {
  chicken_breast: [65, 0.6, 23, 113, ['poultry'], []],
  chicken_thigh: [60, 0.45, 22, 113, ['poultry'], []],
  rotisserie: [80, 0.5, 25, 85, ['poultry'], []],
  ground_beef: [60, 0.35, 16, 113, ['red_meat'], []],
  ground_turkey: [60, 0.6, 22, 113, ['poultry'], []],
  salmon: [80, 0.64, 24, 113, ['fatty_fish', 'seafood'], []],
  shrimp: [80, 0.15, 30, 113, ['seafood'], []],
  tuna: [29, 0.32, 80, 113, ['seafood', 'tuna'], []],
  sardines: [75, 0.17, 53, 85, ['fatty_fish', 'seafood'], []],
  deli_turkey: [40, 0.4, 20, 56, ['processed_meat'], []],
  jerky: [70, 0.18, 28, 28, ['processed_meat', 'red_meat'], []],
  egg: [294, 0.17, 31, 50, ['eggs'], []],
  greek_yogurt: [15, 0.06, 10, 170, ['dairy', 'fermented'], []],
  cottage_cheese: [18, 0.07, 10, 113, ['dairy'], []],
  milk: [17, 0.04, 2.5, 240, ['dairy'], []],
  cheddar: [16.5, 0.07, 28, 28, ['dairy', 'fermented'], []],
  string_cheese: [16, 0.06, 17, 28, ['dairy'], []],
  butter: [19, 0, 1, 14, [], []],
  tofu: [28, 0.1, 17, 85, ['legumes'], ['soy']],
  black_beans: [30, 0.05, 1.5, 90, ['legumes'], ['black bean']],
  chickpeas: [40, 0.13, 2.6, 90, ['legumes'], ['chickpea']],
  lentils: [96, 0.54, 8, 45, ['legumes'], ['lentil']],
  edamame: [56, 0.1, 0.8, 75, ['legumes'], ['soy']],
  peanut_butter: [63, 0.44, 4, 32, ['nuts_seeds'], ['peanut']],
  almonds: [52, 0.14, 4, 28, ['nuts_seeds'], ['almond']],
  walnuts: [39, 0.54, 5, 28, ['nuts_seeds'], ['walnut']],
  pumpkin_seeds: [63, 0.14, 9.4, 28, ['nuts_seeds'], ['pumpkin']],
  chia: [0, 0, 55, 15, ['nuts_seeds'], ['chia']],
  protein_powder: [0, 0, 0, 30, [], []],
  oats: [40, 0.12, 29, 40, ['whole_grain'], ['oat']],
  white_rice: [5.8, 0.16, 15, 45, ['refined_grain', 'rice'], ['rice']],
  brown_rice: [9, 0.5, 23, 45, ['whole_grain', 'rice'], ['rice']],
  pasta: [15, 0.14, 63, 56, ['refined_grain'], ['wheat']],
  bread: [27, 0.2, 25, 32, ['whole_grain'], ['wheat']],
  tortillas: [10, 0.05, 18, 45, ['refined_grain'], ['wheat']],
  cereal: [29, 1.9, 18, 39, ['whole_grain'], ['oat']],
  rice_cakes: [5, 0.15, 15, 18, ['whole_grain', 'rice'], ['rice']],
  potato: [12, 0.3, 0.4, 150, ['vegetables'], ['potato']],
  sweet_potato: [12, 0.2, 0.6, 130, ['red_orange_veg'], ['sweet potato']],
  popcorn: [0, 0.2, 8, 30, ['whole_grain'], ['corn']],
  banana: [9.8, 0.37, 1, 118, ['fruit'], ['banana']],
  apple: [3.4, 0.04, 0, 180, ['fruit'], ['apple']],
  clementine: [10, 0.08, 0.1, 150, ['fruit'], ['mandarin']],
  berries: [6, 0.05, 0.1, 75, ['fruit', 'berries'], ['strawberry', 'blueberry', 'raspberry']],
  avocado: [14, 0.26, 0.4, 50, ['fruit'], ['avocado']],
  spinach: [19, 0.2, 1, 30, ['leafy_greens'], ['spinach']],
  broccoli: [19, 0.17, 2.5, 90, ['cruciferous'], ['broccoli']],
  stirfry_veg: [15, 0.1, 0.8, 90, ['vegetables'], ['broccoli', 'carrot', 'snap pea', 'pepper']],
  bell_pepper: [5.6, 0.29, 0.1, 75, ['red_orange_veg'], ['pepper']],
  carrots: [8.8, 0.14, 0.1, 85, ['red_orange_veg'], ['carrot']],
  onion: [6, 0.12, 0.5, 50, ['vegetables'], ['onion']],
  cucumber: [6, 0.04, 0.3, 75, ['vegetables'], ['cucumber']],
  canned_tomatoes: [7, 0.1, 0.4, 120, ['red_orange_veg'], ['tomato']],
  dark_chocolate: [12, 0.04, 6.8, 20, [], ['cacao']],
  tortilla_chips: [10, 0.2, 6, 28, [], ['corn']],
  hummus: [30, 0.2, 2.4, 60, ['legumes'], ['chickpea', 'sesame']],
  salsa: [5, 0.15, 0.4, 60, [], ['tomato', 'onion', 'pepper']],
  pickles: [2, 0.01, 0, 35, ['vegetables'], ['cucumber']],
  kimchi: [10, 0.2, 0.5, 75, ['fermented', 'cruciferous'], ['napa cabbage', 'radish', 'pepper']],
  olive_oil: [0.3, 0, 0, 14, [], ['olive']],
  soy_sauce: [18, 0.2, 0.5, 15, [], []],
  honey: [2.2, 0.02, 0.8, 21, [], []],
  pork_loin: [65, 0.6, 30, 113, ['red_meat'], []],
  sirloin: [80, 0.6, 26, 113, ['red_meat'], []],
  cod: [65, 0.25, 33, 113, ['seafood'], []],
  tilapia: [42, 0.16, 42, 113, ['seafood'], []],
  canned_salmon: [88, 0.3, 37, 85, ['fatty_fish','seafood'], []],
  feta: [15, 0.4, 15, 28, ['dairy','fermented'], []],
  parmesan: [15, 0.09, 22.5, 10, ['dairy','fermented'], []],
  kefir: [15, 0.04, 2, 240, ['dairy','fermented'], []],
  almond_milk: [1, 0, 0.1, 240, [], ['almond']],
  pinto_beans: [33, 0.12, 5, 90, ['legumes'], ['pinto bean']],
  kidney_beans: [30, 0.1, 1, 90, ['legumes'], ['kidney bean']],
  cashews: [61, 0.42, 20, 28, ['nuts_seeds'], ['cashew']],
  sunflower_seeds: [55, 0.8, 79, 28, ['nuts_seeds'], ['sunflower']],
  flaxseed: [79, 0.47, 25, 10, ['nuts_seeds'], ['flax']],
  quinoa: [70, 0.49, 8.5, 45, ['whole_grain'], ['quinoa']],
  ww_pasta: [30, 0.2, 73, 56, ['whole_grain'], ['wheat']],
  corn_tortillas: [13, 0.22, 6, 50, ['whole_grain'], ['corn']],
  corn: [22, 0.1, 0.6, 85, ['vegetables'], ['corn']],
  peas: [27, 0.1, 1, 80, ['vegetables'], ['pea']],
  garlic: [23, 1.2, 14, 6, [], ['garlic']],
  lemon: [5, 0.05, 0.1, 15, [], ['lemon']],
  tomato: [6.7, 0.08, 0, 120, ['red_orange_veg'], ['tomato']],
  romaine: [10, 0.07, 0.4, 47, ['leafy_greens'], ['romaine']],
  kale: [0.4, 0.15, 0.9, 30, ['leafy_greens'], ['kale']],
  cabbage: [10.7, 0.12, 0.3, 90, ['cruciferous'], ['cabbage']],
  cauliflower: [45, 0.18, 0.6, 100, ['cruciferous'], ['cauliflower']],
  green_beans: [15, 0.14, 0.6, 100, ['vegetables'], ['green bean']],
  zucchini: [9.5, 0.16, 0.2, 120, ['vegetables'], ['zucchini']],
  mushrooms: [17, 0.1, 9.3, 70, ['vegetables'], ['mushroom']],
  celery: [6, 0.07, 0.4, 100, ['vegetables'], ['celery']],
  mango: [7.6, 0.12, 0.6, 140, ['fruit'], ['mango']],
  grapes: [5.6, 0.09, 0.1, 150, ['fruit'], ['grape']],
  strawberries: [5.7, 0.05, 0.4, 150, ['fruit','berries'], ['strawberry']],
  marinara: [9, 0.17, 0.4, 125, ['red_orange_veg'], ['tomato','onion','garlic']],
  broth: [1, 0, 0.5, 240, [], []],
}

// Per 100 g: saturated fat (g) and added sugars (g), approximated from USDA data and typical US labels.
export const FATS_SUGARS: Record<string, [satFat: number, addedSugar: number]> = {
  chicken_breast: [0.6, 0], chicken_thigh: [1.0, 0], rotisserie: [2.0, 0], ground_beef: [5.9, 0], ground_turkey: [2.2, 0],
  salmon: [3.1, 0], shrimp: [0.1, 0], tuna: [0.2, 0], sardines: [1.5, 0], deli_turkey: [0.6, 1], jerky: [10.9, 9],
  egg: [3.1, 0], greek_yogurt: [0.1, 0], cottage_cheese: [1.4, 0], milk: [1.3, 0], cheddar: [19, 0], string_cheese: [10, 0],
  butter: [51, 0], tofu: [1.3, 0], black_beans: [0.1, 0], chickpeas: [0.3, 0], lentils: [0.2, 0], edamame: [0.6, 0],
  peanut_butter: [10, 5], almonds: [3.8, 0], walnuts: [6.1, 0], pumpkin_seeds: [8.7, 0], chia: [3.3, 0], protein_powder: [3, 2],
  oats: [1.1, 0], white_rice: [0.2, 0], brown_rice: [0.6, 0], pasta: [0.3, 0], bread: [0.7, 3], tortillas: [3, 1],
  cereal: [1.2, 3.6], rice_cakes: [0.6, 0], potato: [0, 0], sweet_potato: [0, 0], popcorn: [0.6, 0], banana: [0.1, 0],
  apple: [0, 0], clementine: [0, 0], berries: [0, 0], avocado: [2.1, 0], spinach: [0.1, 0], broccoli: [0.1, 0],
  stirfry_veg: [0, 0], bell_pepper: [0, 0], carrots: [0, 0], onion: [0, 0], cucumber: [0, 0], canned_tomatoes: [0, 0],
  dark_chocolate: [24.5, 24], tortilla_chips: [3, 0], hummus: [1.4, 0], salsa: [0, 0], pickles: [0, 0], kimchi: [0.1, 0],
  olive_oil: [13.8, 0], soy_sauce: [0.1, 0], honey: [0, 82],
  pork_loin: [1.2, 0], sirloin: [3.3, 0], cod: [0.1, 0], tilapia: [0.6, 0], canned_salmon: [1.2, 0], feta: [15, 0], parmesan: [16.4, 0], kefir: [0.6, 0], almond_milk: [0.1, 0], pinto_beans: [0.2, 0], kidney_beans: [0.1, 0], cashews: [7.8, 0], sunflower_seeds: [5.2, 0], flaxseed: [3.7, 0], quinoa: [0.7, 0], ww_pasta: [0.3, 0], corn_tortillas: [0.4, 0], corn: [0.1, 0], peas: [0.1, 0], garlic: [0.1, 0], lemon: [0, 0], tomato: [0, 0], romaine: [0, 0], kale: [0.2, 0], cabbage: [0, 0], cauliflower: [0.1, 0], green_beans: [0, 0], zucchini: [0.1, 0], mushrooms: [0, 0], celery: [0, 0], mango: [0.1, 0], grapes: [0.1, 0], strawberries: [0, 0], marinara: [0.2, 2], broth: [0.1, 0],
}

for (const f of FOODS) {
  const fs = FATS_SUGARS[f.id]
  if (fs) Object.assign(f.n, { satFat: fs[0], addedSugar: fs[1] })
  const d = DETAILS[f.id]
  if (!d) continue
  const [choline, b6, selenium, serving, groups, plants] = d
  Object.assign(f.n, { choline, b6, selenium })
  Object.assign(f, { serving, groups, plants })
}

for (const id of ['popcorn', 'rice_cakes']) FOODS.find((f) => f.id === id)!.airy = true

export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map((f) => [f.id, f]))

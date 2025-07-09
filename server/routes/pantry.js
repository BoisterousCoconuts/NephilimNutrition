const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const calculateRecipeNutrition = require('../utils/calculateRecipeNutrition');
const { convertUnit, getStandardUnitForIngredient } = require('../utils/unitConversion');

// POST /api/pantry/check
// Given user's pantry contents, returns which recipes can be made, how many servings, and nutrition per serving
router.post('/check', async (req, res) => {
  const { userPublicId, pantry } = req.body;
  console.log("Received pantry check for user:", userPublicId);
  console.log("Pantry object:", JSON.stringify(pantry));

  if (!userPublicId || !pantry || typeof pantry !== 'object') {
    console.log("Missing or invalid fields.");
    return res.status(400).json({ message: "Missing or invalid fields." });
  }

  try {
    // Fetches user's recipes with all ingredient data populated
    const recipes = await Recipe.find({ userPublicId })
      .populate('ingredients.ingredientId')
      .lean();

    console.log(`Loaded ${recipes.length} recipes.`);

    const results = [];

    // Checks each recipe if every ingredient present and in sufficient quantity
    for (const rec of recipes) {
      console.log("\n--- Checking recipe:", rec.name, "---");
      let canMake = true;
      let maxServings = Infinity;

      for (const ing of rec.ingredients) {
        const ingData = ing.ingredientId;
        if (!ingData) {
          console.log("Ingredient not found for recipe:", rec.name, ing);
          canMake = false;
          break;
        }

        // Pantry uses ingredientId as key (string type)
        const pantryKey = ingData._id.toString();
        const pantryEntry = pantry[pantryKey];
        if (!pantryEntry) {
          console.log(`Ingredient '${ingData.name}' not found in pantry (expected key ${pantryKey})`);
          canMake = false;
          break;
        }

        // Converts both pantry and needed amount to a standard unit for comparison
        const stdUnit = getStandardUnitForIngredient(ingData);
        const pantryAmt = convertUnit(pantryEntry.amount, pantryEntry.unit, stdUnit);
        const neededAmt = convertUnit(ing.amount, ing.unit || ingData.servingUnit, stdUnit);

        console.log(`Ingredient: ${ingData.name}`);
        console.log(`  Pantry: ${pantryEntry.amount} ${pantryEntry.unit} → ${pantryAmt} ${stdUnit}`);
        console.log(`  Needed: ${ing.amount} ${ing.unit || ingData.servingUnit} → ${neededAmt} ${stdUnit}`);

        // If unit conversion failed, or not enough ingredient, fails early
        if (!pantryAmt || !neededAmt || isNaN(pantryAmt) || isNaN(neededAmt)) {
          console.log("Unit conversion failed. PantryAmt or NeededAmt is NaN/zero.");
          canMake = false;
          break;
        }

        // servings possible for this ingredient, rounded to nearest integer
        const servingsForThisIng = Math.floor(pantryAmt / neededAmt);
        console.log(`  Can make for this ingredient: ${servingsForThisIng} servings`);

        maxServings = Math.min(maxServings, servingsForThisIng);

        if (servingsForThisIng < 1) {
          canMake = false;
          break;
        }
      }

      if (canMake && maxServings >= 1) {
        console.log(`==> Can make recipe '${rec.name}' (${maxServings} servings max)`);
        const nutrition = calculateRecipeNutrition(rec);
        results.push({
          recipeName: rec.name,
          canMake: true,
          maxServings,
          nutrition: nutrition.perServing
        });
      } else {
        console.log(`==> Cannot make recipe '${rec.name}'`);
        results.push({
          recipeName: rec.name,
          canMake: false,
          maxServings: 0
        });
      }
    }

    console.log("Final pantry results:", JSON.stringify(results, null, 2));
    res.json({ results });

  } catch (err) {
    console.error("Error in pantry check:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
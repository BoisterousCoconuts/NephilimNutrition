// /utils/calculateRecipeNutrition.js
const { convertUnit, getStandardUnitForIngredient } = require('./unitConversion');

/**
 * Calculate nutrition for a recipe object with populated ingredients.
 * Returns: { perServing: {cal,protein,...}, total: {cal,protein,...} }
 */
function calculateRecipeNutrition(recipe) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 };
  if (!recipe.ingredients) return { total: totals, perServing: totals };

  for (const ing of recipe.ingredients) {
    // Accepts either .ingredient or .ingredientId
    const ingData = ing.ingredient || ing.ingredientId;
    if (!ingData) continue;

    const standardUnit = getStandardUnitForIngredient(ingData);
    const amtInStd = convertUnit(ing.amount, ing.unit || ingData.servingUnit, standardUnit);
    const servingAmtInStd = convertUnit(ingData.servingAmount || 1, ingData.servingUnit, standardUnit);
    const factor = servingAmtInStd > 0 ? amtInStd / servingAmtInStd : 0;

    totals.calories += (ingData.calories || 0) * factor;
    totals.protein  += (ingData.protein  || 0) * factor;
    totals.carbs    += (ingData.carbs    || 0) * factor;
    totals.fat      += (ingData.fat      || 0) * factor;
    totals.sugar    += (ingData.sugar    || 0) * factor;
  }
  
  const servings = recipe.servings || 1;
  const perServing = {};
  Object.keys(totals).forEach(k => perServing[k] = Math.round(totals[k] / servings));
  Object.keys(totals).forEach(k => totals[k] = Math.round(totals[k]));
  return { perServing, total: totals };
}

module.exports = calculateRecipeNutrition;
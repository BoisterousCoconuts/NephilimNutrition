const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const calculateRecipeNutrition = require('../utils/calculateRecipeNutrition');

// GET all recipes for a user
router.get('/', async (req, res) => {
  const userPublicId = req.query.userPublicId;
  if (!userPublicId) return res.status(400).json({ message: "Missing userPublicId" });
  try {
    const recipes = await Recipe.find({ userPublicId });
    res.json({ recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET a single recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET a single recipe with full ingredient population and nutrition
router.get('/:id/full', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    // Populates each ingredient with full Ingredient doc
    const populatedIngredients = await Promise.all(
      recipe.ingredients.map(async item => {
        const ingDoc = await Ingredient.findById(item.ingredientId);
        return {
          ingredient: ingDoc,
          amount: item.amount,
          unit: item.unit
        };
      })
    );

    // Attaches populated ingredients to recipe object
    const recipeObj = recipe.toObject();
    recipeObj.ingredients = populatedIngredients;

    // Calculate nutrition. returns { perServing, total }.  both rounded
    const nutrition = calculateRecipeNutrition(recipeObj);

    res.json({
      ...recipeObj,
      ingredients: populatedIngredients,
      nutrition
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create new recipe
router.post('/', async (req, res) => {
  const { userPublicId, name, servings, ingredients } = req.body;
  if (!userPublicId || !name || !servings || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ message: "Missing required field(s)" });
  }
  try {
    const doc = await Recipe.create({
      userPublicId,
      name,
      servings,
      ingredients // [{ ingredientId, amount, unit }]
    });
    res.json({ message: "Recipe saved!", doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update existing recipe by ID
router.put('/:id', async (req, res) => {
  const { name, servings, ingredients } = req.body;
  try {
    const updated = await Recipe.findByIdAndUpdate(
      req.params.id,
      { name, servings, ingredients },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Recipe not found" });
    res.json({ message: "Recipe updated", doc: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE recipe by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Recipe.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Recipe not found" });
    res.json({ message: "Recipe deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
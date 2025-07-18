//backend routes and logic for 

const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');

/**
 * GET /api/ingredients?userPublicId=xxx
 * Gets all ingredients for the user.
 */
router.get('/', async (req, res) => {
  const userPublicId = req.query.userPublicId;
  if (!userPublicId) return res.status(400).json({ message: "Missing userPublicId" });
  try {
    const ingredients = await Ingredient.find({ userPublicId });
    res.json({ ingredients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/ingredients/:id
 * Gets a single ingredient by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) return res.status(404).json({ message: "Ingredient not found" });
    res.json(ingredient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/ingredients
 * Creates a new ingredient.
 * Modified to accept zero values for an ingredient's nutrients
 */
router.post('/', async (req, res) => {
  const { userPublicId, name, calories, protein, fat, carbs, sugar, servingAmount, servingUnit } = req.body;
  if (!userPublicId || !name || 
    calories == null || calories < 0 || 
    protein == null || protein < 0 ||
    fat == null || fat < 0 ||
    carbs == null || carbs < 0 ||
    sugar == null || sugar < 0 ||
    servingAmount == null || servingAmount <= 0 ||
    !servingUnit
   ) {
    return res.status(400).json({ message: "Missing required field(s)" });
  }
  try {
    const doc = await Ingredient.create({
      userPublicId, name, calories, protein, fat, carbs, sugar, servingAmount, servingUnit
    });
    res.json({ message: "Ingredient saved!", doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/ingredients/:id
 * Updates an existing ingredient by ID.
 */
router.put('/:id', async (req, res) => {
  const { name, calories, protein, fat, carbs, sugar, servingAmount, servingUnit } = req.body;
  try {
    const updated = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { name, calories, protein, fat, carbs, sugar, servingAmount, servingUnit },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Ingredient updated", doc: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/ingredients/:id
 * Deletes an ingredient by ID.
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Ingredient.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Ingredient not found" });
    res.json({ message: "Ingredient deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
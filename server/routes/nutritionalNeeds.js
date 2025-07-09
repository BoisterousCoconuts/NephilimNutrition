// Handles get/set for user nutritional needs (manual entry or update)

const express = require('express');
const router = express.Router();
const NutritionalNeeds = require('../models/NutritionalNeeds');

/**
 * GET /api/nutritional-needs?userPublicId=xxx
 * Returns a user's current nutritional needs object, or 404 if not found.
 */
router.get('/', async (req, res) => {
  const userPublicId = req.query.userPublicId;
  if (!userPublicId) return res.status(400).json({ message: "Missing userPublicId" });
  try {
    const needs = await NutritionalNeeds.findOne({ userPublicId });
    if (!needs) return res.status(404).json({ message: "Not found" });
    res.json({ needs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/nutritional-needs
 * Create or update a user's nutritional needs (upsert).
 * Expects: userPublicId, calories, protein, fat, carbs, sugar in body
 */
router.post('/', async (req, res) => {
  const { userPublicId, calories, protein, fat, carbs, sugar } = req.body;
  if (
    !userPublicId ||
    calories == null || protein == null ||
    fat == null || carbs == null || sugar == null
  ) {
    return res.status(400).json({ message: "Missing required field(s)" });
  }
  try {
    // upsert true means "create if not exists, else update"
    const needs = await NutritionalNeeds.findOneAndUpdate(
      { userPublicId },
      { calories, protein, fat, carbs, sugar },
      { upsert: true, new: true }
    );
    res.json({ message: "Nutritional needs saved!", needs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
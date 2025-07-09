const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const NutritionalNeeds = require('../models/NutritionalNeeds');
const calculateRecipeNutrition = require('../utils/calculateRecipeNutrition');

// Creates multiple log entries in one request
router.post('/entries', async (req, res) => {
  const entries = req.body;
  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ message: "No entries provided." });
  }
  try {
    await Log.insertMany(entries);
    res.json({ message: "Entries saved." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// Fetches all logs
router.get('/all', async (req, res) => {
  const userPublicId = req.query.userPublicId;
  if (!userPublicId) {
    return res.status(400).json({ message: "Missing userPublicId." });
  }

  try {
    const logs = await Log.find({ userPublicId })
      .populate({
        path: 'recipeId',
        populate: {
          path: 'ingredients.ingredientId',
          model: 'Ingredient'
        }
      })
      .lean();
    res.json({ logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// Group logs by date, calculate daily and period summaries
router.get('/byDateGrouped', async (req, res) => {
  const userPublicId = req.query.userPublicId;
  if (!userPublicId) {
    return res.status(400).json({ message: "Missing userPublicId." });
  }

  //Date range logic ---
  const endDateStr = req.query.endDate;
  const startDateStr = req.query.startDate;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const defaultEnd = `${yyyy}-${mm}-${dd}`;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const yyyy2 = thirtyDaysAgo.getFullYear();
  const mm2 = String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0');
  const dd2 = String(thirtyDaysAgo.getDate(), '0');
  const defaultStart = `${yyyy2}-${mm2}-${dd2}`;
  const startDate = startDateStr || defaultStart;
  const endDate = endDateStr || defaultEnd;

  // Fetches user's nutritional needs, with defaults if not available
  let userNeeds = null;
  try {
    userNeeds = await NutritionalNeeds.findOne({ userPublicId }).lean();
  } catch (err) {
    userNeeds = null;
  }
  const goals = {
    calories: userNeeds?.calories ?? 2000,
    protein:  userNeeds?.protein  ?? 75,
    fat:      userNeeds?.fat      ?? 70,
    carbs:    userNeeds?.carbs    ?? 250,
    sugar:    userNeeds?.sugar    ?? 30
  };

  try {
    const logs = await Log.find({
      userPublicId,
      date: { $gte: startDate, $lte: endDate }
    })
      .populate({
        path: 'recipeId',
        populate: {
          path: 'ingredients.ingredientId',
          model: 'Ingredient'
        }
      })
      .lean();

    // Groups logs by date
    const grouped = {};

    for (const log of logs) {
      const date = log.date;
      if (!grouped[date]) {
        grouped[date] = { entries: [], totals: { calories:0, protein:0, carbs:0, fat:0, sugar:0 } };
      }

      const recipe = log.recipeId;
      const servingsLogged = log.servings;

      // Calculates per-serving nutrition for recipe
      const { perServing } = calculateRecipeNutrition(recipe);

      // Multiplies per-serving values by logged servings
      const logTotal = {};
      Object.keys(perServing).forEach(k => {
        logTotal[k] = perServing[k] * servingsLogged;
      });

      // Sum into the day totals
      Object.keys(grouped[date].totals).forEach(k => {
        grouped[date].totals[k] += logTotal[k];
      });

      grouped[date].entries.push({
        recipeName: recipe.name,
        servings: servingsLogged
      });
    }

    const dateKeys = Object.keys(grouped);
    const recordDays = dateKeys.length;

    // Per-nutrient summary
    const nutrientSummary = {};
    const deficiencies = [];

    for (const nutrient of ["calories","protein","fat","carbs","sugar"]) {
      nutrientSummary[nutrient] = { total:0, goalMetDays:0 };
    }

    // Computes daily goal success and aggregate
    for (const day of dateKeys) {
      const dayTotals = grouped[day].totals;
      Object.keys(dayTotals).forEach(nutrient => {
        nutrientSummary[nutrient].total += dayTotals[nutrient];
      });
      // Determine if goals were met (100+ for typical, under 100 for sugar)
      let dayMet = {};
      Object.keys(dayTotals).forEach(nutrient => {
        const percent = (dayTotals[nutrient]/goals[nutrient])*100;
        if (nutrient==="sugar") {
          dayMet[nutrient] = percent<=100;
        } else {
          dayMet[nutrient] = percent>=100;
        }
        if (dayMet[nutrient]) nutrientSummary[nutrient].goalMetDays++;
      });
    }

    // Computes averages, percents, and deficiencies
    const finalNutrients = {};
    Object.keys(nutrientSummary).forEach(nutrient => {
      const avg = recordDays ? nutrientSummary[nutrient].total / recordDays : 0;
      const percent = goals[nutrient] ? (avg/goals[nutrient])*100 : 0;
      finalNutrients[nutrient] = {
        average: Math.round(avg),
        percent: Math.round(percent),
        goalMetDays: nutrientSummary[nutrient].goalMetDays
      };
      const ratio = recordDays ? nutrientSummary[nutrient].goalMetDays/recordDays : 0;
      if (nutrient !== "calories" && ratio<0.8) deficiencies.push(nutrient);
    });

    // Prepare result array, sorted by date descending
    const result = Object.entries(grouped).map(([date,data])=>({
      date,
      totals: Object.fromEntries(
        Object.entries(data.totals).map(([k,v])=>[k, Math.round(v*100)/100])
      ),
      entries: data.entries
    })).sort((a,b)=>b.date.localeCompare(a.date));

    res.json({
      summary: {
        recordDays,
        nutrients: finalNutrients,
        deficiencies
      },
      logsByDate: result
    });

  } catch(err) {
    console.error(err);
    res.status(500).json({ message:"Server error." });
  }
});

module.exports = router;
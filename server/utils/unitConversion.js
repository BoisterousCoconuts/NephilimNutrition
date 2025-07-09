// Utility for handling unit conversions (mass/volume) for ingredients and recipes.

const MASS_UNITS = ["g", "kg", "mg", "oz", "lb"];
const VOLUME_UNITS = ["ml", "l", "tsp", "tbsp", "cup", "floz", "pint", "quart", "gallon"];

const MASS_CONVERSIONS = {
  g:    1,
  kg:   1000,
  mg:   0.001,
  oz:   28.3495,
  lb:   453.592,
};

const VOLUME_CONVERSIONS = {
  ml:   1,
  l:    1000,
  tsp:  4.92892,
  tbsp: 14.7868,
  cup:  236.588,
  floz: 29.5735,
  pint: 473.176,
  quart: 946.353,
  gallon: 3785.41,
};

/**
 * Checks if the unit is mass.
 */
function isMassUnit(unit) {
  unit = unit?.toLowerCase();
  return MASS_UNITS.includes(unit);
}

/**
 * Checks if the unit is volume.
 */
function isVolumeUnit(unit) {
  unit = unit?.toLowerCase();
  return VOLUME_UNITS.includes(unit);
}

/**
 * Converts an amount from one unit to another, automatically handling mass and volume.
 * Returns NaN if conversion not possible.
 */
function convertUnit(amount, fromUnit, toUnit) {
  if (!amount || isNaN(amount)) return NaN;
  if (!fromUnit || !toUnit) return NaN;

  fromUnit = fromUnit.toLowerCase();
  toUnit   = toUnit.toLowerCase();

  // Both are mass units
  if (isMassUnit(fromUnit) && isMassUnit(toUnit)) {
    return (amount * MASS_CONVERSIONS[fromUnit]) / MASS_CONVERSIONS[toUnit];
  }
  // Both are volume units
  if (isVolumeUnit(fromUnit) && isVolumeUnit(toUnit)) {
    return (amount * VOLUME_CONVERSIONS[fromUnit]) / VOLUME_CONVERSIONS[toUnit];
  }
  // Not convertible
  return NaN;
}

/**
 * Gets the standard unit to use for a given ingredient
 * (mass returns 'g', volume returns 'ml')
 */
function getStandardUnitForIngredient(ingredient) {
  if (isVolumeUnit(ingredient.servingUnit)) return "ml";
  return "g";
}

module.exports = {
  isMassUnit,
  isVolumeUnit,
  convertUnit,
  getStandardUnitForIngredient,
};
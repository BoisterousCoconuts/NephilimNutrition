const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema ({
  userPublicId: {
    type: String,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  ingredients: [{
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    unit: { 
      type: String,
      required: true
    }
  }],
  servings: {
    type: Number,
    required: true,
    min: 1
  }
});

module.exports = mongoose.model('Recipe', recipeSchema);
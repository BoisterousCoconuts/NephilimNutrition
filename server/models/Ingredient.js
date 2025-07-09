const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ingredientSchema = new Schema({
    userPublicId: {
        type: String,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    calories: {
        type: Number,
        required: true
    },
    protein: {
        type: Number,
        required: true
    },
    fat: {
        type: Number,
        required: true
    },
    carbs: {
        type: Number,
        required: true
    },
    sugar: {
        type: Number,
        required: true
    },
    servingAmount: {
        type: Number,  // e.g. 100, 1, 0.5
        required: true
    },
    servingUnit: {
        type: String,
        enum: ['g', 'oz', 'fl oz', 'cup', 'ml'],
        required: true
    }
});

module.exports = mongoose.model('Ingredient', ingredientSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nutritionalNeedsSchema = new Schema({
    //public facing ID, used to differentiate user
    userPublicId: {
        type: String,
        required: true,
        unique: true,
        ref: 'User'
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
    }
})

module.exports = mongoose.model('NutritionalNeeds', nutritionalNeedsSchema);

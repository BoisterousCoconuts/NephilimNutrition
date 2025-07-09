const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogSchema = new Schema({
  userPublicId: { type: String, required: true },
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
  servings: { type: Number, required: true }
});

module.exports = mongoose.model('LogEntry', LogSchema);
// ---------------------------
// ENVIRONMENT & DEPENDENCIES
// ---------------------------
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

// --------------
// MONGOOSE MODELS
// --------------
require('./models/User');

// ------------------
// ROUTE IMPORTS
// ------------------
const authRoutes        = require('./routes/auth');
const needsRoutes       = require('./routes/nutritionalNeeds');
const ingredientsRoutes = require('./routes/ingredients');
const recipesRoutes     = require('./routes/recipes');
const logsRoutes        = require('./routes/logs');
const pantryRoutes      = require('./routes/pantry');

// ------------------
// APP INIT & MIDDLEWARE
// ------------------
const app = express();

// Parse JSON bodies for API routes
app.use(express.json());

// ------------------
// API ROUTES
// ------------------
app.use('/api/nutritional-needs', needsRoutes);
app.use('/api/ingredients',      ingredientsRoutes);
app.use('/api/recipes',          recipesRoutes);
app.use('/api/logs',             logsRoutes);
app.use('/api/pantry',           pantryRoutes);
app.use('/api',                  authRoutes); // Auth/register/login

// ------------------
// STATIC FILES (Frontend)
// ------------------
app.use(express.static(path.join(__dirname, '../public')));

// ------------------
// MONGODB CONNECTION
// ------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB error:", err));

// ------------------
// SERVER STARTUP
// ------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
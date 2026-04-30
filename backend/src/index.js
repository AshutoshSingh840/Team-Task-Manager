require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors({
origin: process.env.CLIENT_URL || '*',
credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Global error handler
app.use((err, req, res, next) => {
console.error(err.stack);
res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

// Connect DB and then start server
mongoose.connect(process.env.DATABASE_URL)
.then(() => {
console.log("MongoDB connected");


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

})
.catch(err => {
console.error("MongoDB connection error:", err);
process.exit(1);
});

// backend/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Root health check
app.get('/', (req, res) => {
  res.send("✅ SkillForge Backend Running with Gemini + Supabase");
});

// Route imports
// const authRoutes = require('./routes/auth');
// const dashboardRoutes = require('./routes/dashboard');
const resumeRoutes = require('./routes/resume');
const resumeDbRoutes = require('./routes/resume-db');
const generateResumeRoute = require('./routes/generate-resume');

// Route Middleware
// app.use('/api/auth', authRoutes);
// app.use('/api/dashboard', dashboardRoutes);
app.use('/api/resume', resumeRoutes);         // public read/save etc.
app.use('/api/resumes', resumeDbRoutes);      // save/load by id
app.use('/api/generate-resume', generateResumeRoute);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

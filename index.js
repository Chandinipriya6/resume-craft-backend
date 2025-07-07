const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Debugging
console.log("🧪 SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("🧪 SUPABASE_ANON_KEY present:", !!process.env.SUPABASE_ANON_KEY);
console.log("🧪 GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);

// ✅ Health check
app.get('/', (req, res) => {
  res.send("✅ SkillForge Backend Running with Gemini + Supabase");
});

// ✅ Route Imports
const resumeRoutes = require('./routes/resume');
const resumeDbRoutes = require('./routes/resume-db'); // 🟢 now handles ALL resume-related routes
const generateResumeRoute = require('./routes/generate-resume');
const renderHtmlRoute = require('./routes/render-html');

// ✅ Route Middleware
app.use('/api/resume', resumeRoutes);
app.use('/api/resumes', resumeDbRoutes); // includes /user/:id, /save, /resume/:id, etc.
console.log("✅ Loaded resume-db routes under /api/resumes");

app.use('/api/generate-resume', generateResumeRoute);
app.use('/api/render-template', renderHtmlRoute);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

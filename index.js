const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://resume-craft-ochre.vercel.app",
    "https://resume-craft-8ujk7ww67-chandinipriya6s-projects.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ✅ Environment Debug
console.log("🧪 SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("🧪 SUPABASE_ANON_KEY present:", !!process.env.SUPABASE_ANON_KEY);
console.log("🧪 GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);

// ✅ Health Route
app.get('/', (req, res) => {
  res.send("✅ ResumeCraft Backend Running!");
});

// ✅ Import Routes
const resumeDbRoutes = require('./routes/resume-db');
const generateResumeRoute = require('./routes/generate-resume');  // You still need to add this file
const renderHtmlRoute = require('./routes/render-html');           // Optional: for template preview if needed

// ✅ Use Routes
app.use('/api/resumes', resumeDbRoutes);
app.use('/api/generate-resume', generateResumeRoute);
app.use('/api/render-template', renderHtmlRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

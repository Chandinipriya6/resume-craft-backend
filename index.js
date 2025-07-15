// index.js

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
app.options('*',(req,res)=>{
  res.sendStatus(200);
}); // 🔁 Preflight support
app.use(express.json());

// ✅ Debug
console.log("🧪 SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("🧪 GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);

// ✅ Health Check
app.get('/', (req, res) => {
  res.send("✅ ResumeCraft Backend Running!");
});

// ✅ Import Routes
const resumeDbRoutes = require('./routes/resume-db');
const generateResumeRoute = require('./routes/generate-resume');
const renderHtmlRoute = require('./routes/render-html');

// ✅ Use Routes (Only Once Each)
app.use('/api/resumes', resumeDbRoutes);
app.use('/api/generate-resume', generateResumeRoute); // will map to /api/generate-resume
app.use('/api/render-template', renderHtmlRoute);

// ✅ Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  //console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🚀 Server running on port ${PORT}`);
});

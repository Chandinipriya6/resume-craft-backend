// routes/resume-db.js
const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/resumes/save
router.post("/save", async (req, res) => {
  const {
    user_id,
    name,
    email,
    summary,
    education,
    experience,
    skills,
    custom_sections
  } = req.body;

  try {
    const { data, error } = await supabase
      .from("resumes")
      .insert([
        {
          user_id,
          name,
          email,
          summary,
          education,
          experience,
          skills,
          custom_sections
        }
      ])
      .select();

    if (error) throw error;

    res.status(200).json({
      success: true,
      resumeId: data[0].id,
    });
  } catch (err) {
    console.error("❌ Error saving resume:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/resumes/:id - fetch public resume
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, resume: data });
  } catch (err) {
    console.error("❌ Error fetching resume:", err.message);
    res.status(404).json({ success: false, error: "Resume not found" });
  }
});

module.exports = router;
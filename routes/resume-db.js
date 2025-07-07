const express = require("express");
const router = express.Router();
const { supabase } = require("../services/supabaseClient");

// ✅ Health check
router.get("/test", (req, res) => {
  res.send("✅ Resume DB route is working!");
});

// ✅ GET all resumes by user ID
router.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  console.log("✅ HIT /api/resumes/user/:id with ID:", id);

  try {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase error while fetching by user_id:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, resumes: data || [] });
  } catch (err) {
    console.error("❌ Server error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch user resumes." });
  }
});

// ✅ POST - Save a new resume
router.post("/save", async (req, res) => {
  const {
    user_id,
    name,
    email,
    summary,
    education,
    experience,
    skills,
    custom_sections,
    template
  } = req.body;

  // Check for required fields
  if (!user_id || !name || !email) {
    return res.status(400).json({ success: false, error: "Missing required fields: user_id, name, or email" });
  }

  try {
    const { data, error } = await supabase
      .from("resumes")
      .insert([{
        user_id,
        name,
        email,
        summary,
        education,
        experience,
        skills,
        custom_sections,
        template
      }])
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    console.log("✅ Resume saved with ID:", data.id);
    res.status(200).json({ success: true, resumeId: data.id });
  } catch (err) {
    console.error("❌ Error saving resume:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ GET a single resume by ID
router.get("/resume/:id", async (req, res) => {
  const { id } = req.params;
  console.log("🔍 Fetching single resume by ID:", id);

  try {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("❌ Supabase fetch error:", error);
      return res.status(404).json({ success: false, error: "Resume not found" });
    }

    res.status(200).json({ success: true, resume: data });
  } catch (err) {
    console.error("❌ Server error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

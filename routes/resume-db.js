// ✅ resume-db.js (Backend)
const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

// Inject Supabase client
router.use((req, res, next) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: req.headers.authorization || ""
        }
      }
    }
  );
  req.supabase = supabase;
  next();
});

// ✅ Test route
router.get("/test-delete", (req, res) => {
  res.send("✅ Delete route file is loaded");
});

// ✅ POST /delete - safer deletion with resume ID + user ID
// ✅ GET resumes for a specific user
router.get("/user/:id", async (req, res) => {
  const user_id = req.params.id;

  if (!user_id) {
    return res.status(400).json({ success: false, error: "Missing user ID" });
  }

  try {
    const { data, error } = await req.supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, resumes: data });
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

module.exports = router;

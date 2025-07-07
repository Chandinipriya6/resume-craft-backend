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
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  const user_id = req.headers["x-user-id"]; // Custom header

  if (!id || !user_id) {
    return res.status(400).json({ success: false, error: "Missing resume ID or user ID" });
  }

  try {
    const { data, error } = await req.supabase
      .from("resumes")
      .delete()
      .eq("id", id)
      .eq("user_id", user_id)
      .select();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: "Resume not found" });
    }

    res.json({ success: true, message: "Resume deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;

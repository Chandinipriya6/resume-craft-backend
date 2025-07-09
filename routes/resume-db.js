const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

router.get('/test', (req, res) => {
  res.json({ message: "Resume API working!" });
});

// Inject Supabase client into every request
router.use((req, res, next) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: req.headers['authorization'] || "" // Send Bearer token from frontend
        }
      }
    }
  );
  req.supabase = supabase;
  next();
});

// ✅ POST /api/resumes → Save resume with content + template
router.post("/", async (req, res) => {
  const { user_id, name, email, content, template_url } = req.body;

  if (!user_id || !name || !email || !content) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    const { data, error } = await req.supabase
      .from("resumes")
      .insert([{ user_id, name, email, content, template_url }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.status(201).json({ success: true, resume: data });
  } catch (err) {
    console.error("❌ Insert error:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ✅ POST /api/resumes/save → Save resume with detailed fields
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
    const { data, error } = await req.supabase
      .from("resumes")
      .insert([{
        user_id,
        name,
        email,
        summary,
        education,
        experience,
        skills,
        custom_sections
      }])
      .select();

    if (error) throw error;

    res.status(200).json({
      success: true,
      resumeId: data[0].id,
    });
  } catch (err) {
    console.error("❌ Error saving resume:", err.message);
    res.status(500).json({ success: false, error: "Failed to save resume" });
  }
});

// ✅ GET /api/resumes/user/:id → Get all resumes for a user
// ✅ GET all resumes for a user
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching resumes:', err.message);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// ✅ DELETE /api/resumes/delete/:id → Delete a resume by ID if owned by user
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  const user_id = req.headers["x-user-id"];

  console.log("🗑 DELETE request received for:");
  console.log("🔹 resume ID:", id);
  console.log("🔹 user ID from header:", user_id);

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
      console.error("❌ Supabase delete error:", error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data || data.length === 0) {
      console.warn("⚠ No data returned. Resume not found or not owned by user.");
      return res.status(404).json({ success: false, error: "Resume not found or unauthorized" });
    }

    console.log("✅ Resume deleted:", data);
    res.status(200).json({ success: true, message: "Resume deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

// Health Check
router.get('/test', (req, res) => {
  res.json({ message: "Resume API working!" });
});

// Inject Supabase client into each request
router.use((req, res, next) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: req.headers['authorization'] || ""
        }
      }
    }
  );
  req.supabase = supabase;
  next();
});

// POST /api/resumes → Save resume with HTML content and template
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

// POST /api/resumes/save → Save structured AI-generated resume
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
    template_url
  } = req.body;

  const resumePayload = {
    user_id,
    name,
    email,
    summary,
    education,
    experience,
    skills,
    custom_sections,
    template_url,
  };

  console.log("📥 Received resume data on backend:", JSON.stringify(resumePayload, null, 2));

  try {
    const { data, error } = await req.supabase
      .from("resumes")
      .insert([resumePayload])
      .select();

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.status(200).json({
      success: true,
      resumeId: data?.[0]?.id,
    });
  } catch (err) {
    console.error("❌ Unexpected error saving resume:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/resumes/user/:user_id → Fetch all resumes for a user
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;
  console.log("✅ Fetching resumes for user:", user_id);

  try {
    const { data, error } = await req.supabase
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

// GET /api/resumes/:id → Publicly fetch a resume by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await req.supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ Error fetching public resume:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/resumes/update/:id → Update resume if owned by user
router.post('/update/:id', async (req, res) => {
  const resumeId = req.params.id;

  const {
    name,
    email,
    summary,
    education,
    experience,
    skills,
    custom_sections,
    template_url
  } = req.body;

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  // Create Supabase Admin client to get user ID from token
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user_id = user.id;

  try {
    const { error } = await req.supabase
      .from('resumes')
      .update({
        name,
        email,
        summary,
        education,
        experience,
        skills,
        custom_sections,
        template_url
      })
      .eq('id', resumeId)
      .eq('user_id', user_id); // ✅ Only allow updating own resume

    if (error) throw error;

    return res.status(200).json({ message: "Resume updated successfully." });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/resumes/delete/:id → Delete a resume if owned by user
router.delete("/delete/:id", async (req, res) => {
  const resumeId = req.params.id;
  const userId = req.headers["x-user-id"];

  if (!resumeId || !userId) {
    return res.status(400).json({ success: false, error: "Missing resume ID or user ID" });
  }

  try {
    const { data, error } = await req.supabase
      .from("resumes")
      .delete()
      .eq("id", resumeId)
      .eq("user_id", userId)
      .select();

    if (error) {
      console.error("❌ Supabase delete error:", error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: "Resume not found or unauthorized" });
    }

    return res.status(200).json({ success: true, message: "Resume deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});


module.exports = router;

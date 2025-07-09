// routes/resume.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // to load env variables

const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// ✅ POST /api/resume → Save new resume
router.post('/', async (req, res) => {
  const { resume } = req.body;

  // ✅ Extract Bearer token from headers
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  // ✅ Create Supabase client using Service Role Key to access user info
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // ✅ Get authenticated user from token
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user_id = user.id;

  try {
    const { data, error } = await supabase
      .from('resumes')
      .insert([{
        user_id,
        name: resume.name,
        email: resume.email,
        summary: resume.summary,
        education: resume.education,
        experience: resume.experience,
        skills: resume.skills,
        custom_sections: resume.custom_sections,
        template: resume.template
      }])
      .select();

    if (error) throw error;

    return res.status(200).json({ id: data[0].id });
  } catch (err) {
    console.error("❌ Insert error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});


// ✅ GET /api/resume/:id → Publicly fetch a resume by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Resume not found' });

  return res.status(200).json(data);
});

// ✅ POST /api/resume/update/:id → Update existing resume
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
    template
  } = req.body;

  // 🔐 Get token from Authorization header
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

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
    const { error } = await supabase
      .from('resumes')
      .update({
        name,
        email,
        summary,
        education,
        experience,
        skills,
        custom_sections,
        template
      })
      .eq('id', resumeId)
      .eq('user_id', user_id); // 🔐 Must match to pass RLS

    if (error) throw error;

    return res.status(200).json({ message: "Resume updated successfully." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


module.exports = router;

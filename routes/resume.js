// routes/resume.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // to load env variables

const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// POST /api/resume → Save new resume
router.post('/', async (req, res) => {
  const { resume } = req.body;

  const { data, error } = await supabase
    .from('resumes')
    .insert([{ ...resume }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ id: data[0].id });
});

// GET /api/resume/:id → Publicly fetch resume
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

module.exports = router;

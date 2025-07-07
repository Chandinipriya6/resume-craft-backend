const express = require('express');
const router = express.Router();
const { supabase } = require('../services/supabaseClient'); // ✅ CORRECT


// GET /api/resumes/user/:id
router.get('/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: 'Failed to fetch user resumes.' });
  }
});

module.exports = router;

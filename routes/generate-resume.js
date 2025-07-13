// ✅ FINAL FIXED BACKEND ROUTES
// File: routes/generate-resume.js

const express = require('express');
const router = express.Router();
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_TEMPLATE_URL = process.env.SUPABASE_TEMPLATE_URL;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

router.post('/', async (req, res) => {
  const {
    name,
    email,
    skills,
    education,
    experience,
    customSections,
    template, // ✅ Must be just "template1.html"
    user_id
  } = req.body;

  const formatList = (arr, keys) =>
    Array.isArray(arr)
      ? arr.map(item => keys.map(k => item[k] ? `${k}: ${item[k]}` : '').join(', ')).join('\n')
      : '';

  const formattedSkills = Array.isArray(skills) ? skills.join(', ') : skills;
  const formattedEducation = formatList(education, ['degree', 'university', 'years']);
  const formattedExperience = formatList(experience, ['title', 'company', 'years', 'description']);
  const formattedCustomSections = Array.isArray(customSections)
    ? customSections.map(section => `Heading: ${section.heading}\nContent: ${section.content}`).join('\n\n')
    : '';

  const prompt = `
You are an AI resume builder. Generate a professional resume in JSON format with:
- name, email, summary
- education (array with degree, university, years)
- experience (array with title, company, years, description)
- skills (array)
- customSections (array of { heading, content })

User Input:
Name: ${name}
Email: ${email}
Education:\n${formattedEducation}
Experience:\n${formattedExperience}
Skills: ${formattedSkills}
Custom Sections:\n${formattedCustomSections}
  `;

  try {
    const geminiResponse = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY } }
    );

    const aiContent = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!aiContent) return res.status(200).json({ success: false, content: '⚠️ Empty AI response.' });

    let resumeJson;
    try {
      resumeJson = JSON.parse(aiContent.replace(/```json|```/g, '').trim());
    } catch (err) {
      return res.status(500).json({ success: false, content: '❌ Failed to parse AI resume JSON.' });
    }

    // ✅ Save to backend if user_id is present
    if (user_id) {
      try {
        await axios.post(`${BACKEND_URL}/api/resumes/save`, {
          user_id,
          name: resumeJson.name,
          email: resumeJson.email,
          summary: resumeJson.summary,
          education: resumeJson.education,
          experience: resumeJson.experience,
          skills: resumeJson.skills,
          custom_sections: resumeJson.customSections || [],
          template_url: template
        });
        console.log('✅ Resume saved');
      } catch (err) {
        console.warn('⚠️ Could not save resume:', err.message);
      }
    }

    let templateHtml = '';
    if (template) {
      const templateUrl = `${SUPABASE_TEMPLATE_URL}${template}`;
      try {
        const t = await axios.get(templateUrl);
        templateHtml = t.data;
      } catch (err) {
        console.warn('⚠️ Failed to fetch template:', err.message);
      }
    }

    const filledHtml = templateHtml
      .replace('{{name}}', resumeJson.name || '')
      .replace('{{email}}', resumeJson.email || '')
      .replace('{{skills}}', (resumeJson.skills || []).join(', '))
      .replace('{{education}}', (resumeJson.education || []).map(e => `${e.degree} at ${e.university} (${e.years})`).join('<br>'))
      .replace('{{experience}}', (resumeJson.experience || []).map(e => `${e.title} at ${e.company} (${e.years}): ${e.description}`).join('<br><br>'));

    res.status(200).json({
      success: true,
      content: aiContent,
      templateHtml: filledHtml
    });
  } catch (err) {
    console.error('❌ Gemini Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate resume' });
  }
});

module.exports = router;

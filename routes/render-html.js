const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.post('/', (req, res) => {
  const { template, data } = req.body;

  const filePath = path.join(__dirname, '..', '..', 'frontend', 'public', 'templates', template);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Template not found");
  }

  let html = fs.readFileSync(filePath, 'utf-8');

  html = html.replace(/{{name}}/g, data.name || '');
  html = html.replace(/{{email}}/g, data.email || '');
  html = html.replace(/{{skills}}/g, Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '');

  html = html.replace(/{{education}}/g,
    Array.isArray(data.education)
      ? data.education.map(e => `${e.degree} at ${e.university} (${e.years})`).join('<br/>')
      : data.education || ''
  );

  html = html.replace(/{{experience}}/g,
    Array.isArray(data.experience)
      ? data.experience.map(e => `${e.title} at ${e.company} (${e.years}) - ${e.description}`).join('<br/>')
      : data.experience || ''
  );

  res.send(html);
});

module.exports = router;

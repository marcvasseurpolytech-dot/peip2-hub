// api/progress.js — Vercel serverless proxy for GitHub repo progress.json
const REPO = 'marcvasseurpolytech-dot/peip2-hub';
const FILE = 'progress.json';
const TOKEN = process.env.GITHUB_TOKEN;
const BASE = 'https://api.github.com';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github+json'
  };

  if (req.method === 'GET') {
    const r = await fetch(`${BASE}/repos/${REPO}/contents/${FILE}`, { headers });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.message });
    const content = JSON.parse(Buffer.from(d.content, 'base64').toString('utf8'));
    return res.status(200).json({ data: content, sha: d.sha });
  }

  if (req.method === 'PUT') {
    const { data, sha } = req.body;
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const r = await fetch(`${BASE}/repos/${REPO}/contents/${FILE}`, {
      method: 'PUT', headers,
      body: JSON.stringify({ message: 'Update progress.json', content, sha })
    });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.message });
    return res.status(200).json({ ok: true, sha: d.content.sha });
  }

  res.status(405).json({ error: 'Method not allowed' });
};

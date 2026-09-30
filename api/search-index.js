const fs = require('fs');
const path = require('path');
const { parseSubstackPost, findItem } = require('./substack.js');
const { documentText } = require('./search-lib.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end('Method Not Allowed');
    return;
  }

  let catalog;
  try {
    catalog = await loadCatalog(req);
  } catch (err) {
    json(res, 502, { error: 'Could not load the testimonies catalog' });
    return;
  }

  const grouped = groupByOrigin(catalog);
  const feeds = {};
  const origins = Object.keys(grouped);
  for (let i = 0; i < origins.length; i++) {
    const origin = origins[i];
    try {
      const feed = await fetch(origin + '/feed', {
        headers: { 'User-Agent': 'hraacf-testimonies/1.0' }
      });
      if (feed.ok) {
        feeds[origin] = await feed.text();
      }
    } catch (err) {
      feeds[origin] = '';
    }
  }

  const items = catalog.map(function(entry) {
    const parsed = parseSubstackPost(entry.url);
    const xml = parsed ? feeds[parsed.origin] : '';
    const rss = parsed && xml ? findItem(xml, parsed.canonical) : null;
    return {
      url: entry.url,
      title: entry.title,
      author: entry.author,
      date: entry.date,
      subtitle: entry.subtitle || '',
      text: documentText(entry, rss && rss.html)
    };
  });

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  json(res, 200, { items: items });
};

async function loadCatalog(req) {
  try {
    const file = path.join(process.cwd(), 'js/testimonies.json');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    if (!host) {
      throw err;
    }
    const url = proto + '://' + host + '/js/testimonies.json';
    const res = await fetch(url);
    if (!res.ok) {
      throw err;
    }
    return res.json();
  }
}

function groupByOrigin(catalog) {
  const grouped = {};
  for (let i = 0; i < catalog.length; i++) {
    const parsed = parseSubstackPost(catalog[i].url);
    if (!parsed) {
      continue;
    }
    if (!grouped[parsed.origin]) {
      grouped[parsed.origin] = [];
    }
    grouped[parsed.origin].push(catalog[i]);
  }
  return grouped;
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

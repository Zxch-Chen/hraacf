module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end('Method Not Allowed');
    return;
  }

  const parsed = parseSubstackPost(req.query && req.query.url);
  if (!parsed) {
    json(res, 400, { error: 'Use a Substack post URL like https://name.substack.com/p/slug' });
    return;
  }

  let xml;
  try {
    const feed = await fetch(parsed.origin + '/feed', {
      headers: { 'User-Agent': 'hraacf-testimonies/1.0' }
    });
    if (!feed.ok) {
      json(res, 502, { error: 'Could not load that Substack feed' });
      return;
    }
    xml = await feed.text();
  } catch (err) {
    json(res, 502, { error: 'Could not load that Substack feed' });
    return;
  }

  const item = findItem(xml, parsed.canonical);
  if (!item) {
    json(res, 404, { error: 'That post was not in the public RSS feed' });
    return;
  }

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  json(res, 200, item);
};

function parseSubstackPost(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return null;
  }
  let url;
  try {
    url = new URL(urlString);
  } catch (err) {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (host !== 'substack.com' && !host.endsWith('.substack.com')) {
    return null;
  }
  const match = url.pathname.match(/^\/p\/([a-z0-9-]+)\/?$/i);
  if (!match) {
    return null;
  }
  return {
    origin: url.protocol + '//' + host,
    canonical: url.protocol + '//' + host + '/p/' + match[1]
  };
}

function findItem(xml, canonical) {
  const chunks = xml.split('<item>').slice(1);
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const link = textBetween(chunk, '<link>', '</link>');
    if (!link || link.split('?')[0].replace(/\/$/, '') !== canonical) {
      continue;
    }
    return {
      title: cdata(textBetween(chunk, '<title>', '</title>')),
      author: cdata(textBetween(chunk, '<dc:creator>', '</dc:creator>')),
      date: textBetween(chunk, '<pubDate>', '</pubDate>'),
      url: canonical,
      html: encodedHtml(chunk)
    };
  }
  return null;
}

function textBetween(haystack, start, end) {
  const from = haystack.indexOf(start);
  if (from === -1) {
    return '';
  }
  const begin = from + start.length;
  const to = haystack.indexOf(end, begin);
  if (to === -1) {
    return '';
  }
  return haystack.slice(begin, to).trim();
}

function cdata(value) {
  return value.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '');
}

function encodedHtml(chunk) {
  const start = chunk.indexOf('<content:encoded>');
  const end = chunk.indexOf('</content:encoded>');
  if (start === -1 || end === -1) {
    return '';
  }
  return cdata(chunk.slice(start + '<content:encoded>'.length, end).trim());
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

module.exports.parseSubstackPost = parseSubstackPost;
module.exports.findItem = findItem;

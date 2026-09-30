var MAX_CHARS = 2500;
var MIN_SCORE = 0.3;

function htmlToText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function documentText(meta, html) {
  var parts = [
    meta && meta.title,
    meta && meta.subtitle,
    meta && meta.blurb,
    htmlToText(html)
  ].filter(function(part) {
    return part && String(part).trim();
  });
  return parts.join('\n').slice(0, MAX_CHARS);
}

function cosine(a, b) {
  if (!a || !b || a.length !== b.length || a.length === 0) {
    return 0;
  }
  var dot = 0;
  var na = 0;
  var nb = 0;
  for (var i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) {
    return 0;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function rankByScore(rows, threshold) {
  var min = threshold == null ? MIN_SCORE : threshold;
  return rows
    .filter(function(row) {
      return row.score >= min;
    })
    .sort(function(a, b) {
      return b.score - a.score;
    });
}

module.exports = {
  MAX_CHARS: MAX_CHARS,
  MIN_SCORE: MIN_SCORE,
  htmlToText: htmlToText,
  documentText: documentText,
  cosine: cosine,
  rankByScore: rankByScore
};

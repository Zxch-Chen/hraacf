const assert = require('assert');
const {
  htmlToText,
  documentText,
  cosine,
  rankByScore,
  MIN_SCORE
} = require('./search-lib.js');

assert.strictEqual(
  htmlToText('<h4>Background</h4><p>Hello&nbsp;there.</p><script>no</script>'),
  'Background Hello there.'
);

assert.strictEqual(
  documentText(
    {
      title: 'The Idolatry of Faith',
      subtitle: 'Trusting in Jesus',
      blurb: 'Resting in Christ.'
    },
    '<p>A long body about salvation.</p>'
  ),
  'The Idolatry of Faith\nTrusting in Jesus\nResting in Christ.\nA long body about salvation.'
);

assert.ok(Math.abs(cosine([1, 0], [1, 0]) - 1) < 1e-9);
assert.ok(Math.abs(cosine([1, 0], [0, 1])) < 1e-9);
assert.strictEqual(cosine([1, 0], [1]), 0);

const ranked = rankByScore(
  [
    { url: 'low', score: 0.12 },
    { url: 'hit', score: 0.71 },
    { url: 'mid', score: 0.41 }
  ],
  MIN_SCORE
);
assert.deepStrictEqual(ranked.map((row) => row.url), ['hit', 'mid']);

assert.strictEqual(
  documentText({ title: 'T' }, '<p>' + 'x'.repeat(4000) + '</p>').length,
  2500
);

console.log('ok');

const assert = require('assert');
const { parseSubstackPost, findItem } = require('./substack.js');

assert.deepStrictEqual(
  parseSubstackPost('https://peterchon.substack.com/p/the-idolatry-of-faith'),
  {
    origin: 'https://peterchon.substack.com',
    canonical: 'https://peterchon.substack.com/p/the-idolatry-of-faith'
  }
);
assert.strictEqual(parseSubstackPost('https://example.com/p/post'), null);
assert.strictEqual(parseSubstackPost('https://peterchon.substack.com/about'), null);

const xml = [
  '<rss><channel>',
  '<item><title><![CDATA[Other]]></title><link>https://peterchon.substack.com/p/other</link>',
  '<content:encoded><![CDATA[<p>nope</p>]]></content:encoded></item>',
  '<item><title><![CDATA[The Idolatry of Faith]]></title>',
  '<link>https://peterchon.substack.com/p/the-idolatry-of-faith</link>',
  '<dc:creator><![CDATA[Peter Chon]]></dc:creator>',
  '<pubDate>Fri, 24 Apr 2026 22:23:52 GMT</pubDate>',
  '<content:encoded><![CDATA[<h4>Background</h4><p>Hello.</p>]]></content:encoded></item>',
  '</channel></rss>'
].join('');

const item = findItem(xml, 'https://peterchon.substack.com/p/the-idolatry-of-faith');
assert.strictEqual(item.title, 'The Idolatry of Faith');
assert.strictEqual(item.author, 'Peter Chon');
assert.ok(item.html.includes('<h4>Background</h4>'));
assert.ok(!item.html.includes('nope'));

console.log('ok');

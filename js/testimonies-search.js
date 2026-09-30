import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/+esm';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MIN_SCORE = 0.3;
const SEARCH_URL = '/api/search-index';

const input = document.getElementById('testimony-search');
const statusEl = document.getElementById('testimony-search-status');

if (!input || !statusEl) {
  // Page without the search field.
} else {
  let debounceTimer = 0;
  let requestSeq = 0;
  let extractorPromise = null;
  let corpusPromise = null;
  let docVectors = null;

  input.addEventListener('input', function() {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(function() {
      runSearch(input.value.trim());
    }, 350);
  });

  input.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      input.value = '';
      runSearch('');
    }
  });

  async function runSearch(query) {
    const seq = ++requestSeq;
    const api = await waitForCatalog();
    if (seq !== requestSeq) {
      return;
    }
    if (!query) {
      setStatus('');
      api.filterTo(null);
      return;
    }

    setStatus('Looking through the collection…');
    try {
      if (!extractorPromise) {
        setStatus('Preparing search…');
      }
      const ranked = await rank(query);
      if (seq !== requestSeq) {
        return;
      }
      if (!ranked.length) {
        api.filterTo([]);
        setStatus('Nothing here is close to that yet.');
        return;
      }
      api.filterTo(ranked.map(function(row) {
        return row.url;
      }));
      setStatus(ranked.length === 1 ? 'One piece sits near that.' : ranked.length + ' pieces sit near that.');
    } catch (err) {
      if (seq !== requestSeq) {
        return;
      }
      setStatus('Search could not run just now.');
    }
  }

  async function rank(query) {
    const corpus = await loadCorpus();
    const extractor = await loadExtractor();
    if (!docVectors) {
      docVectors = await embedTexts(extractor, corpus.map(function(item) {
        return item.text;
      }));
    }
    const queryVec = (await embedTexts(extractor, [query]))[0];
    const scored = corpus.map(function(item, index) {
      return {
        url: item.url,
        score: cosine(queryVec, docVectors[index])
      };
    });
    return scored
      .filter(function(row) {
        return row.score >= MIN_SCORE;
      })
      .sort(function(a, b) {
        return b.score - a.score;
      });
  }

  async function loadCorpus() {
    if (!corpusPromise) {
      corpusPromise = fetch(SEARCH_URL)
        .then(function(res) {
          if (!res.ok) {
            throw new Error('search-index');
          }
          return res.json();
        })
        .then(function(data) {
          if (data && data.items && data.items.length) {
            return data.items;
          }
          throw new Error('empty');
        })
        .catch(function() {
          return fallbackCorpus();
        });
    }
    return corpusPromise;
  }

  function fallbackCorpus() {
    return window.hraacfTestimonies.all().map(function(item) {
      return {
        url: item.url,
        text: [item.title, item.subtitle, item.blurb].filter(Boolean).join('\n')
      };
    });
  }

  function loadExtractor() {
    if (!extractorPromise) {
      extractorPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractorPromise;
  }

  async function embedTexts(extractor, texts) {
    const output = await extractor(texts, { pooling: 'mean', normalize: true });
    const dims = output.dims;
    if (dims.length === 1) {
      return [Array.from(output.data)];
    }
    const rows = dims[0];
    const cols = dims[1];
    const vectors = [];
    for (let i = 0; i < rows; i++) {
      vectors.push(Array.from(output.data.slice(i * cols, (i + 1) * cols)));
    }
    return vectors;
  }

  function cosine(a, b) {
    if (!a || !b || a.length !== b.length) {
      return 0;
    }
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    if (na === 0 || nb === 0) {
      return 0;
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function waitForCatalog() {
    return new Promise(function(resolve, reject) {
      let tries = 0;
      const tick = function() {
        if (window.hraacfTestimonies && window.hraacfTestimonies.ready()) {
          resolve(window.hraacfTestimonies);
          return;
        }
        tries += 1;
        if (tries > 50) {
          reject(new Error('catalog'));
          return;
        }
        window.setTimeout(tick, 100);
      };
      tick();
    });
  }
}

/* ============================================================
   English Masterbook by Gaida Gaa
   Lesson 01 · Present Simple — interactivity
   ============================================================ */

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const store = {
    get: (k, d) => {
      try {
        const v = localStorage.getItem(k);
        return v === null ? d : v;
      } catch {
        return d;
      }
    },
    set: (k, v) => {
      try {
        localStorage.setItem(k, v);
      } catch {}
    },
  };

  /* ---------- Vocabulary data ---------- */
  const VOCAB = [
    ['wake up', '/weɪk ʌp/', 'weik ap', 'bangun tidur'],
    ['get up', '/ɡet ʌp/', 'get ap', 'bangkit dari tempat tidur'],
    ["brush (one's) teeth", '/brʌʃ tiːθ/', 'brash tiith', 'sikat gigi'],
    ['take a shower', '/teɪk ə ˈʃaʊə/', 'teik e shaue', 'mandi'],
    ['get dressed', '/ɡet drest/', 'get drest', 'berpakaian'],
    ['have breakfast', '/hæv ˈbrekfəst/', 'hev brekfest', 'sarapan'],
    ['go to school/work', '/ɡəʊ tuː skuːl/wɜːk/', 'gou tu skul/wek', 'berangkat sekolah/kerja'],
    ['study', '/ˈstʌdi/', 'stadi', 'belajar'],
    ['do homework', '/duː ˈhəʊmwɜːk/', 'du houmwek', 'mengerjakan PR'],
    ['have lunch', '/hæv lʌntʃ/', 'hev lanch', 'makan siang'],
    ['finish work', '/ˈfɪnɪʃ wɜːk/', 'finish wek', 'selesai kerja'],
    ['come home', '/kʌm həʊm/', 'kam houm', 'pulang ke rumah'],
    ['cook dinner', '/kʊk ˈdɪnə/', 'kuk dine', 'memasak makan malam'],
    ['exercise', '/ˈeksəsaɪz/', 'eksesais', 'berolahraga'],
    ['clean the house', '/kliːn ðə haʊs/', 'klin de haus', 'membersihkan rumah'],
    ['watch TV', '/wɒtʃ ˌtiːˈviː/', 'woch ti-vi', 'menonton TV'],
    ['read a book', '/riːd ə bʊk/', 'rid e buk', 'membaca buku'],
    ['go to bed', '/ɡəʊ tuː bed/', 'gou tu bed', 'pergi tidur'],
    ['fall asleep', '/fɔːl əˈsliːp/', 'fol esliip', 'tertidur'],
    ['get ready', '/ɡet ˈredi/', 'get redi', 'bersiap-siap'],
  ];

  function buildVocab() {
    const grid = $('#vocabGrid');
    if (!grid) return;
    VOCAB.forEach(([word, ipa, read, mean]) => {
      const card = document.createElement('div');
      card.className = 'vocab-card';
      card.innerHTML = `
        <div class="vocab-head">
          <span class="vocab-word">${word}</span>
          <button class="say-btn" aria-label="Dengarkan pelafalan ${word}">🔊</button>
        </div>
        <span class="vocab-ipa">${ipa}</span>
        <span class="vocab-read">Cara baca: ${read}</span>
        <span class="vocab-mean">${mean}</span>`;
      // strip the "one's"/parenthetical for cleaner speech
      const spoken = word
        .replace(/\(.*?\)/g, '')
        .replace('/work', '')
        .replace('/', ' or ')
        .trim();
      card.querySelector('.say-btn').dataset.text = spoken;
      grid.appendChild(card);
    });
  }

  /* ---------- British pronunciation (Web Speech API) ---------- */
  let enGBVoice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = speechSynthesis.getVoices();
    enGBVoice =
      voices.find((v) => v.lang === 'en-GB' && /female|Kate|Serena|Stephanie|Hazel|Sonia/i.test(v.name)) ||
      voices.find((v) => v.lang === 'en-GB') ||
      voices.find((v) => /en-GB|British/i.test(v.name)) ||
      voices.find((v) => v.lang && v.lang.startsWith('en')) ||
      null;
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }

  function speak(text, btn) {
    if (!('speechSynthesis' in window)) {
      alert('Maaf, browser ini belum mendukung pelafalan suara.');
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    if (enGBVoice) u.voice = enGBVoice;
    u.rate = 0.92;
    u.pitch = 1;
    if (btn) {
      btn.classList.add('speaking');
      u.onend = u.onerror = () => btn.classList.remove('speaking');
    }
    speechSynthesis.speak(u);
  }

  // Delegate all speak buttons (examples + vocab)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.say-btn');
    if (!btn) return;
    let text = btn.dataset.text;
    if (!text) {
      const host = btn.closest('[data-say]');
      text = host ? host.getAttribute('data-say') : btn.previousSibling && btn.previousSibling.textContent;
    }
    if (text) speak(text.trim(), btn);
  });

  /* ---------- Theme toggle ---------- */
  const html = document.documentElement;
  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#121512' : '#14342b');
  }
  const savedTheme = store.get('em-theme', window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(savedTheme);
  $('#themeBtn').addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    store.set('em-theme', next);
  });

  /* ---------- Text size ---------- */
  let size = parseInt(store.get('em-size', '18'), 10);
  function applySize() {
    size = Math.min(22, Math.max(15, size));
    document.body.style.setProperty('--reader-size', size + 'px');
    store.set('em-size', String(size));
  }
  applySize();
  $('#textUp').addEventListener('click', () => {
    size += 1;
    applySize();
  });
  $('#textDown').addEventListener('click', () => {
    size -= 1;
    applySize();
  });

  /* ---------- Sidebar drawer (mobile) ---------- */
  const sidebar = $('#sidebar');
  const overlay = $('#overlay');
  const menuBtn = $('#menuBtn');
  function openMenu(open) {
    sidebar.classList.toggle('open', open);
    overlay.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', () => openMenu(!sidebar.classList.contains('open')));
  overlay.addEventListener('click', () => openMenu(false));

  /* ---------- TOC: smooth scroll + close drawer + scrollspy ---------- */
  const tocLinks = $$('.toc-link');
  tocLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) openMenu(false);
    });
  });

  const sections = $$('section[id]');
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- Reading progress ---------- */
  const progressBar = $('#progressBar');
  const lessonProgress = $('#lessonProgress');
  const lessonProgressLabel = $('#lessonProgressLabel');
  const toTop = $('#toTop');
  let maxRead = 0;
  function onScroll() {
    const scrollTop = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? Math.min(100, (scrollTop / docH) * 100) : 0;
    progressBar.style.width = pct + '%';
    maxRead = Math.max(maxRead, pct);
    lessonProgress.style.width = maxRead + '%';
    lessonProgressLabel.textContent = Math.round(maxRead) + '% selesai dibaca';
    toTop.hidden = scrollTop < 400;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Exercises: check answers ---------- */
  function normalize(s) {
    return (s || '').toLowerCase().replace(/’/g, "'").replace(/\s+/g, ' ').replace(/[.]+$/, '').trim();
  }
  const checkBtn = $('#checkBtn');
  const resetBtn = $('#resetBtn');
  const scoreEl = $('#score');
  const inputs = $$('.ex-input');

  checkBtn.addEventListener('click', () => {
    let correct = 0;
    inputs.forEach((inp) => {
      const accepted = (inp.dataset.answer || '').split('|').map(normalize);
      const val = normalize(inp.value);
      const ok = val !== '' && accepted.includes(val);
      inp.classList.toggle('correct', ok);
      inp.classList.toggle('incorrect', !ok && val !== '');
      if (ok) correct++;
    });
    scoreEl.hidden = false;
    scoreEl.textContent = `Skor: ${correct}/${inputs.length} benar`;
  });

  resetBtn.addEventListener('click', () => {
    inputs.forEach((inp) => {
      inp.value = '';
      inp.classList.remove('correct', 'incorrect');
    });
    scoreEl.hidden = true;
  });

  /* ---------- Answer key toggle ---------- */
  const answerToggle = $('#answerToggle');
  const answerBody = $('#answerBody');
  answerToggle.addEventListener('click', () => {
    const show = answerBody.hidden;
    answerBody.hidden = !show;
    answerToggle.setAttribute('aria-expanded', String(show));
    answerToggle.textContent = show ? 'Sembunyikan kunci jawaban' : 'Tampilkan kunci jawaban';
  });

  /* ---------- Autosave: homework + free exercise ---------- */
  function autosave(el, key) {
    if (!el) return;
    el.value = store.get(key, '');
    let t;
    el.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        store.set(key, el.value);
        const status = $('#hwStatus');
        if (status && key === 'em-homework') {
          status.textContent = 'Tersimpan ✓ ' + new Date().toLocaleTimeString('id-ID');
        }
      }, 400);
    });
  }
  autosave($('#homework'), 'em-homework');
  autosave($('.ex-free'), 'em-hard3');

  /* ---------- Opening / Intro (tampil setiap kali dibuka) ---------- */
  const opening = $('#opening');
  const startBtn = $('#startBtn');
  if (opening && startBtn) {
    document.body.classList.add('opening-active');
    startBtn.focus({ preventScroll: true });
    const closeOpening = () => {
      opening.classList.add('closing');
      document.body.classList.remove('opening-active');
      window.scrollTo({ top: 0 });
      setTimeout(() => {
        opening.hidden = true;
      }, 460);
    };
    startBtn.addEventListener('click', closeOpening);
  }

  /* ---------- Init ---------- */
  buildVocab();
  onScroll();
})();

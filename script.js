/* ============================================================
   English Masterbook by Gaida Tsabita Ahmad
   Shared interactivity (Beranda + semua lesson)
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

  /* ---------- In-app browser warning banner ---------- */
  function detectInAppBrowser() {
    const ua = navigator.userAgent || '';
    // Common in-app WebView signatures (Instagram, Facebook, WhatsApp, TikTok, Line).
    const knownInApp = /Instagram|FBAN|FBAV|FB_IAB|WhatsApp|Line\/|TikTok|MicroMessenger/i.test(ua);
    const noSpeech = !('speechSynthesis' in window);
    return { knownInApp, noSpeech, flagged: knownInApp || noSpeech };
  }

  function buildInAppBanner() {
    const status = detectInAppBrowser();
    if (!status.flagged) return;
    if (store.get('em-banner-dismissed', '') === '1') return;

    const header = $('.topbar');
    if (!header) return;

    const banner = document.createElement('div');
    banner.className = 'inapp-banner';
    banner.setAttribute('role', 'note');
    banner.innerHTML = `
      <span class="inapp-banner-icon" aria-hidden="true">🔊</span>
      <p class="inapp-banner-text">
        Fitur <strong>pelafalan suara</strong> tidak berjalan di browser aplikasi (mis. Instagram/WhatsApp).
        Ketuk titik tiga (⋮) di kanan atas, lalu pilih <strong>&ldquo;Buka di Chrome&rdquo;</strong> untuk pengalaman terbaik.
      </p>
      <button class="inapp-banner-close" aria-label="Tutup peringatan">✕</button>`;
    header.insertAdjacentElement('afterend', banner);

    const closeBtn = banner.querySelector('.inapp-banner-close');
    closeBtn.addEventListener('click', () => {
      banner.remove();
      store.set('em-banner-dismissed', '1');
    });
  }

  /* ---------- Vocabulary data (Lesson 01) ---------- */
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

  /* ---------- Theme toggle (all pages) ---------- */
  const html = document.documentElement;
  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#121512' : '#14342b');
  }
  const savedTheme = store.get('em-theme', window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(savedTheme);
  const themeBtn = $('#themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      store.set('em-theme', next);
    });
  }

  /* ---------- Text size (all pages) ---------- */
  let size = parseInt(store.get('em-size', '18'), 10);
  function applySize() {
    size = Math.min(22, Math.max(15, size));
    document.body.style.setProperty('--reader-size', size + 'px');
    store.set('em-size', String(size));
  }
  applySize();
  const textUp = $('#textUp');
  const textDown = $('#textDown');
  if (textUp)
    textUp.addEventListener('click', () => {
      size += 1;
      applySize();
    });
  if (textDown)
    textDown.addEventListener('click', () => {
      size -= 1;
      applySize();
    });

  /* ---------- Sidebar drawer (mobile) ---------- */
  const sidebar = $('#sidebar');
  const overlay = $('#overlay');
  const menuBtn = $('#menuBtn');
  function openMenu(open) {
    if (!sidebar || !overlay || !menuBtn) return;
    sidebar.classList.toggle('open', open);
    overlay.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  if (menuBtn) menuBtn.addEventListener('click', () => openMenu(!sidebar.classList.contains('open')));
  if (overlay) overlay.addEventListener('click', () => openMenu(false));

  /* ---------- TOC: close drawer + scrollspy ---------- */
  const tocLinks = $$('.toc-link');
  tocLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) openMenu(false);
    });
  });

  const sections = $$('section[id]');
  if (sections.length && tocLinks.length) {
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
  }

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
    if (progressBar) progressBar.style.width = pct + '%';
    maxRead = Math.max(maxRead, pct);
    if (lessonProgress) lessonProgress.style.width = maxRead + '%';
    if (lessonProgressLabel) lessonProgressLabel.textContent = Math.round(maxRead) + '% selesai dibaca';
    if (toTop) toTop.hidden = scrollTop < 400;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Exercises: check answers ---------- */
  function normalize(s) {
    return (s || '').toLowerCase().replace(/’/g, "'").replace(/\s+/g, ' ').replace(/[.]+$/, '').trim();
  }
  const checkBtn = $('#checkBtn');
  const resetBtn = $('#resetBtn');
  const scoreEl = $('#score');
  const inputs = $$('.ex-input');

  if (checkBtn) {
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
      if (scoreEl) {
        scoreEl.hidden = false;
        scoreEl.textContent = `Skor: ${correct}/${inputs.length} benar`;
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      inputs.forEach((inp) => {
        inp.value = '';
        inp.classList.remove('correct', 'incorrect');
      });
      if (scoreEl) scoreEl.hidden = true;
    });
  }

  /* ---------- Answer key toggle ---------- */
  const answerToggle = $('#answerToggle');
  const answerBody = $('#answerBody');
  if (answerToggle && answerBody) {
    answerToggle.addEventListener('click', () => {
      const show = answerBody.hidden;
      answerBody.hidden = !show;
      answerToggle.setAttribute('aria-expanded', String(show));
      answerToggle.textContent = show ? 'Sembunyikan kunci jawaban' : 'Tampilkan kunci jawaban';
    });
  }

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
        if (status && key.startsWith('em-homework')) {
          status.textContent = 'Tersimpan ✓ ' + new Date().toLocaleTimeString('id-ID');
        }
      }, 400);
    });
  }
  // Namespace autosave keys per-lesson so lessons don't overwrite each other.
  const lessonKey = document.body.getAttribute('data-lesson') || 'x';
  autosave($('#homework'), 'em-homework-' + lessonKey);
  autosave($('.ex-free'), 'em-hard3-' + lessonKey);

  /* ---------- Opening / Intro (per-lesson) ---------- */
  const opening = $('#opening');
  const startBtn = $('#startBtn');
  function openOpening() {
    if (!opening) return;
    opening.hidden = false;
    opening.classList.remove('closing');
    document.body.classList.add('opening-active');
    window.scrollTo({ top: 0 });
    if (startBtn) startBtn.focus({ preventScroll: true });
  }
  function closeOpening() {
    if (!opening) return;
    opening.classList.add('closing');
    document.body.classList.remove('opening-active');
    window.scrollTo({ top: 0 });
    setTimeout(() => {
      opening.hidden = true;
    }, 460);
  }
  if (opening && startBtn) {
    document.body.classList.add('opening-active');
    startBtn.focus({ preventScroll: true });
    startBtn.addEventListener('click', closeOpening);
  }
  // "Lihat pembuka lagi" buttons anywhere on the page
  $$('[data-reopen]').forEach((b) => b.addEventListener('click', openOpening));

  /* ---------- Lesson checklist (per-lesson persistence) ---------- */
  const checkboxes = $$('input[type="checkbox"][data-check]');
  checkboxes.forEach((box) => {
    const key = 'em-check-' + lessonKey + '-' + box.dataset.check;
    box.checked = store.get(key, '') === '1';
    box.addEventListener('change', () => {
      store.set(key, box.checked ? '1' : '0');
    });
  });

  /* ---------- Init ---------- */
  buildInAppBanner();
  buildVocab();
  onScroll();
})();

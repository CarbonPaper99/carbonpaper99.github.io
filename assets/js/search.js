(function () {
  var posts = window.__POSTS__ || [];
  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  var wrap = document.querySelector('.site-search');
  var clear = document.querySelector('.search-clear');
  if (!input || !results) return;

  function norm(s) { return String(s || '').toLowerCase(); }

  function syncState() {
    if (wrap) wrap.classList.toggle('has-text', input.value.length > 0);
  }

  var GOOGLE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c2.7 2.7 4 6 4 9s-1.3 6.3-4 9c-2.7-2.7-4-6-4-9s1.3-6.3 4-9z" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  var GPT_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2z" fill="currentColor"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" fill="currentColor"/></svg>';

  function actionHtml(q) {
    var g = 'https://www.google.com/search?q=' + encodeURIComponent(q);
    var gpt = 'https://chatgpt.com/';
    return '<a class="search-action" target="_blank" rel="noopener" href="' + g + '">' + GOOGLE_ICON + '<span>Google 溯流求索……</span></a>' +
      '<a class="search-action" target="_blank" rel="noopener" href="' + gpt + '">' + GPT_ICON + '<span>GPT 问问大海……</span></a>';
  }

  function render(list, q) {
    results.innerHTML = '';
    if (!list.length) {
      var empty = document.createElement('div');
      empty.className = 'search-empty';
      empty.textContent = '没有找到相关文章';
      results.appendChild(empty);
    } else {
      list.forEach(function (p) {
        var a = document.createElement('a');
        a.className = 'search-result';
        a.href = p.url;
        var title = document.createElement('span');
        title.className = 'sr-title';
        title.textContent = p.title;
        var meta = document.createElement('span');
        meta.className = 'sr-meta';
        meta.textContent = p.date;
        a.appendChild(title);
        a.appendChild(meta);
        results.appendChild(a);
      });
    }
    var actions = document.createElement('div');
    actions.className = 'search-actions';
    actions.innerHTML = actionHtml(q);
    results.appendChild(actions);
    results.hidden = false;
  }

  function run() {
    syncState();
    var q = norm(input.value.trim());
    if (!q) {
      results.hidden = true;
      results.innerHTML = '';
      return;
    }
    var terms = q.split(/\s+/);
    var matched = posts.filter(function (p) {
      var hay = norm([p.title, p.tags, p.excerpt, p.date].join(' '));
      return terms.every(function (t) { return hay.indexOf(t) !== -1; });
    }).slice(0, 20);
    render(matched, input.value.trim());
  }

  input.addEventListener('input', run);
  input.addEventListener('focus', run);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      input.value = '';
      syncState();
      results.hidden = true;
      results.innerHTML = '';
      input.blur();
    }
  });

  if (clear) {
    clear.addEventListener('click', function () {
      input.value = '';
      syncState();
      results.hidden = true;
      results.innerHTML = '';
      input.focus();
    });
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.site-search')) {
      results.hidden = true;
      results.innerHTML = '';
    }
  });
})();


/* Lightbox: click any .image-zoom to enlarge */
(function () {
  var lightbox, lbImg, lbClose, opener = null;

  function ensure() {
    if (lightbox) return;
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.hidden = true;
    lbImg = document.createElement('img');
    lbImg.className = 'lightbox-img';
    lbImg.alt = '';
    lbClose = document.createElement('button');
    lbClose.type = 'button';
    lbClose.className = 'lightbox-close';
    lbClose.setAttribute('aria-label', '关闭预览');
    lbClose.innerHTML = '&times;';
    lightbox.appendChild(lbClose);
    lightbox.appendChild(lbImg);
    document.body.appendChild(lightbox);
    lbClose.addEventListener('click', close);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  function open(src, alt, el) {
    ensure();
    opener = el || null;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function close() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    lbImg.src = '';
    document.body.style.overflow = '';
    if (opener && typeof opener.focus === 'function') opener.focus();
    opener = null;
  }

  document.addEventListener('click', function (e) {
    var zoom = e.target.closest ? e.target.closest('.image-zoom') : null;
    if (!zoom) return;
    e.preventDefault();
    var img = zoom.querySelector('img');
    open(zoom.getAttribute('data-src'), img ? img.alt : '', zoom);
  });

  document.addEventListener('keydown', function (e) {
    var target = e.target;
    if (!target || !target.classList || !target.classList.contains('image-zoom')) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      var img = target.querySelector('img');
      open(target.getAttribute('data-src'), img ? img.alt : '', target);
    }
  });
})();


/* Daily date + fortune draw (refresh at local midnight) */
(function () {
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function randomFortune() {
    return fortunes[Math.floor(Math.random() * fortunes.length)];
  }
  var fortunes = (window.__FORTUNES__ && window.__FORTUNES__.length) ? window.__FORTUNES__ : [
    { signNo: 1, level: '吉', poem: '云开雾散见青天，万里长风送锦帆。谋望皆随心所愿，贵人相助福连绵。', explanation: '运势平和，顺其自然即可。', suitable: ['安居乐业'], unsuitable: ['轻率冒进'] }
  ];
  var CHECK_ICON = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="8 12 11 15 16 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var USER_ICON = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + d.toUTCString() + '; path=/';
  }
  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function remember(choice) {
    setCookie('fortune_choice', JSON.stringify({ day: todayStr(), choice: choice }), 2);
  }

  function applyChoice(box, choice) {
    box.classList.remove('is-accepted', 'is-rejected');
    var icon = box.querySelector('.fortune-result-icon');
    var text = box.querySelector('.fortune-result-text');
    if (choice === 'accept') {
      box.classList.add('is-accepted');
      if (icon) icon.innerHTML = CHECK_ICON;
      if (text) text.textContent = '运承天命';
    } else {
      box.classList.add('is-rejected');
      if (icon) icon.innerHTML = USER_ICON;
      if (text) text.textContent = '运势由人';
    }
  }

  function bindActions(box) {
    if (box.__bound) return;
    box.__bound = true;
    var accept = box.querySelector('.fortune-accept');
    var reject = box.querySelector('.fortune-reject');
    if (accept) accept.addEventListener('click', function () { applyChoice(box, 'accept'); remember('accept'); });
    if (reject) reject.addEventListener('click', function () { applyChoice(box, 'reject'); remember('reject'); });
  }

  function levelClass(l) {
    if (l === '大吉') return 'daji';
    if (l === '上吉') return 'shangji';
    if (l === '中吉') return 'zhongji';
    if (l === '平签') return 'ping';
    if (l === '小凶') return 'xiaoxiong';
    if (l === '中凶') return 'zhongxiong';
    if (l === '大凶') return 'daxiong';
    if (l.indexOf('凶') > -1) return 'bad';
    if (l.indexOf('吉') > -1) return 'good';
    return 'neutral';
  }
  function chips(arr) { return (arr || []).map(function (x) { return '<span class="fortune-chip">' + x + '</span>'; }).join(''); }
  function fillFortune(box, f) {
    var g = box.querySelector('.fortune-grade');
    var no = box.querySelector('.fortune-no');
    var poem = box.querySelector('.fortune-poem');
    var exp = box.querySelector('.fortune-explanation');
    var suitable = box.querySelector('.fortune-suitable');
    var unsuitable = box.querySelector('.fortune-unsuitable');
    if (g) { g.textContent = f.level || ''; g.className = 'fortune-grade level-' + levelClass(f.level); }
    if (no) no.textContent = '第' + (f.signNo || 1) + '签';
    if (poem) poem.innerHTML = (function () { var lines = (f.poem || '').match(/[^，。！？]+[，。！？]?/g); if (!lines) lines = [f.poem || '']; return lines.map(function (ln) { return '<span class="fortune-poem-line">' + ln + '</span>'; }).join(''); })();
    if (exp) exp.textContent = f.explanation || '';
    if (suitable) suitable.innerHTML = chips(f.suitable);
    if (unsuitable) unsuitable.innerHTML = chips(f.unsuitable);
  }

  function render() {
    var now = new Date();
    var dateEl = document.querySelector('.today-line');
    if (dateEl) dateEl.textContent = '现在是' + now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日。';
    var box = document.querySelector('.fortune');
    if (!box) return;
    box.classList.remove('is-accepted', 'is-rejected');
    var resultText = box.querySelector('.fortune-result-text');
    if (resultText) resultText.textContent = '';
    bindActions(box);
    var n = box.querySelector('.fortune-num');
    if (n) n.textContent = (now.getMonth() + 1) + '月' + now.getDate() + '日';

    var drawBtn = box.querySelector('.fortune-draw');
    if (drawBtn && !box.__drawBound) {
      box.__drawBound = true;
      drawBtn.addEventListener('click', function () {
        fillFortune(box, randomFortune());
        box.classList.remove('is-idle');
        box.classList.add('is-drawn');
      });
    }
    var raw = getCookie('fortune_choice');
    if (!raw) return;
    try {
      var data = JSON.parse(raw);
      if (data && data.day === todayStr() && (data.choice === 'accept' || data.choice === 'reject')) {
        box.classList.remove('is-idle');
        applyChoice(box, data.choice);
      }
    } catch (e) {}
  }

  function schedule() {
    var now = new Date();
    var next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    var ms = next - now + 500;
    setTimeout(function () { render(); schedule(); }, ms);
  }

  if (!document.querySelector('.today-line') && !document.querySelector('.fortune')) return;
  render();
  schedule();
})();

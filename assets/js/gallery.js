(function () {
  var data = window.__GALLERY__ || [];
  if (!data.length) return;
  var mask = null;
  var current = -1;
  var lastOpener = null;
  var chips = Array.prototype.slice.call(document.querySelectorAll('.gl-chip'));
  var cardItems = Array.prototype.slice.call(document.querySelectorAll('.gl-item'));
  var grid = document.querySelector('.gl-grid');
  var filterTimer = null;
  var flat = [];
  data.forEach(function (it, gi) {
    (it.images || []).forEach(function (im, ii) {
      flat.push({ item: gi, img: ii, total: it.images.length, src: im.src });
    });
  });

  function showCards(cat) {
    cardItems.forEach(function (b) {
      var keep = !cat || (b.getAttribute('data-cat') || '') === cat;
      if (keep) b.removeAttribute('hidden');
      else b.setAttribute('hidden', '');
    });
  }
  function applyFilter(cat) {
    chips.forEach(function (c) {
      c.classList.toggle('is-active', (c.getAttribute('data-filter') || '') === cat);
    });
    if (!grid) { showCards(cat); return; }
    if (filterTimer) clearTimeout(filterTimer);
    grid.classList.add('is-fading');
    filterTimer = setTimeout(function () {
      showCards(cat);
      grid.classList.remove('is-fading');
      filterTimer = null;
    }, 180);
  }
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      if (c.classList.contains('is-active')) return;
      applyFilter(c.getAttribute('data-filter') || '');
    });
  });

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s == null ? '' : s);
    return d.innerHTML;
  }

  function build() {
    mask = document.createElement('div');
    mask.className = 'gl-mask';
    mask.setAttribute('role', 'dialog');
    mask.setAttribute('aria-modal', 'true');
    mask.setAttribute('aria-label', '影像详情');
    mask.innerHTML =
      '<button type="button" class="gl-close" aria-label="关闭"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
      '<div class="gl-panel">' +
        '<div class="gl-photo">' +
          '<button type="button" class="gl-nav gl-prev" aria-label="上一张"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="12 19 5 12 12 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '<button type="button" class="gl-nav gl-next" aria-label="下一张"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="12 5 19 12 12 19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '<img alt="">' +
        '</div>' +
        '<div class="gl-info">' +
          '<h2 class="gl-title"></h2>' +
          '<div class="gl-meta"><span class="gl-key">分类</span><span class="gl-category"></span></div>' +
          '<div class="gl-meta"><span class="gl-key">地点</span><span class="gl-location"></span></div>' +
          '<div class="gl-meta"><span class="gl-key">时间</span><span class="gl-date"></span></div>' +
          '<div class="gl-tags"></div>' +
          '<div class="gl-note"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(mask);
    mask.addEventListener('click', function (e) {
      if (e.target === mask || e.target.closest('.gl-close')) close();
    });
    var prevBtn = mask.querySelector('.gl-prev');
    var nextBtn = mask.querySelector('.gl-next');
    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); move(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); move(1); });
  }

  function move(delta) {
    if (current < 0 || !flat[current]) return;
    var slot = flat[current];
    for (var k = 0; k < flat.length; k++) {
      if (flat[k].item === slot.item && flat[k].img === slot.img + delta) {
        openAt(k);
        return;
      }
    }
  }

  function openAt(i) {
    var slot = flat[i];
    if (!slot) return;
    if (!mask) build();
    current = i;
    var it = data[slot.item];
    var img = mask.querySelector('.gl-photo img');
    img.src = slot.src;
    img.alt = it.title || '';
    var titleEl = mask.querySelector('.gl-title');
    titleEl.textContent = it.title || '';
    titleEl.hidden = !it.title;
    var catEl = mask.querySelector('.gl-category');
    catEl.textContent = it.category || '杂项';
    var locEl = mask.querySelector('.gl-location');
    locEl.textContent = it.location || '未记录';
    var dateEl = mask.querySelector('.gl-date');
    dateEl.textContent = it.date || '未记录';
    var tagsEl = mask.querySelector('.gl-tags');
    tagsEl.innerHTML = (it.tags || []).map(function (t) { return '<span class="gl-tag">' + esc(t) + '</span>'; }).join('');
    tagsEl.hidden = !(it.tags && it.tags.length);
    var noteEl = mask.querySelector('.gl-note');
    noteEl.innerHTML = it.note || '<p>暂无注释。</p>';
    var prevBtn = mask.querySelector('.gl-prev');
    var nextBtn = mask.querySelector('.gl-next');
    if (prevBtn) prevBtn.hidden = slot.img === 0 || slot.total < 2;
    if (nextBtn) nextBtn.hidden = slot.img >= slot.total - 1 || slot.total < 2;
    lastOpener = document.activeElement;
    mask.classList.remove('open');
    void mask.offsetWidth;
    mask.classList.add('open');
    document.body.style.overflow = 'hidden';
    var closeBtn = mask.querySelector('.gl-close');
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    if (!mask || !mask.classList.contains('open')) return;
    mask.classList.remove('open');
    document.body.style.overflow = '';
    if (lastOpener && typeof lastOpener.focus === 'function') lastOpener.focus();
    lastOpener = null;
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.gl-item');
    if (b) openAt(parseInt(b.getAttribute('data-card'), 10));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    if (mask && mask.classList.contains('open')) {
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
    }
  });
})();

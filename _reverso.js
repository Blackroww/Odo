/* ════════════════════════════════════════════════
   _reverso.js  — Módulo del reverso de la tarjeta
   Namespace: JN (Japanese Notes)

   Depende de _settings.js (cargado antes en el HTML).
   Módulos: utils · nav · tags · freq
   ════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  var JN = global.JN = global.JN || {};


  /* ════════════════════════════════
     MODULE: utils
     ════════════════════════════════ */
  JN.utils = {
    hexToRgb: function (hex) {
      hex = hex.replace('#', '');
      return (
        parseInt(hex.substring(0, 2), 16) + ',' +
        parseInt(hex.substring(2, 4), 16) + ',' +
        parseInt(hex.substring(4, 6), 16)
      );
    }
  };


  /* ════════════════════════════════
     MODULE: nav
     Navegación entre ejemplos.
     ════════════════════════════════ */
  JN.nav = (function () {
    var _s = { current: 0, items: [], total: 0 };
    var _d = { titulo: null, header: null, btnPrev: null, btnNext: null };

    function init() {
      _s.current = 0;
      _s.items   = Array.prototype.slice.call(document.querySelectorAll('.ejemplo-item'));
      _s.total   = _s.items.length;
      _d.titulo  = document.getElementById('ejemplo-title');
      _d.header  = document.querySelector('.ejemplo-header');
      _d.btnPrev = document.getElementById('btn-prev');
      _d.btnNext = document.getElementById('btn-next');

      var navEl = document.querySelector('.ejemplo-navigation');
      if (navEl) navEl.style.display = _s.total <= 1 ? 'none' : '';
    }

    function navigate(dir) {
      if (_s.total <= 1) return;
      _s.items[_s.current].style.display = 'none';
      _s.current = (_s.current + dir + _s.total) % _s.total;

      var item   = _s.items[_s.current];
      var border = item.getAttribute('data-border') || '#6B46C1';
      var text   = item.getAttribute('data-text')   || '#B794F6';
      var rgbB   = JN.utils.hexToRgb(border);
      var rgbT   = JN.utils.hexToRgb(text);

      item.style.display         = 'block';
      item.style.borderLeftColor = border;

      if (_d.titulo) {
        _d.titulo.textContent = 'Ejemplo ' + (_s.current + 1) + ':';
        _d.titulo.style.color = text;
      }
      if (_d.header) _d.header.style.borderLeftColor = border;

      [_d.btnPrev, _d.btnNext].forEach(function (btn) {
        if (!btn) return;
        btn.style.color       = text;
        btn.style.background  = 'rgba(' + rgbB + ',0.18)';
        btn.style.borderColor = 'rgba(' + rgbT + ',0.35)';
      });

      var divider = item.querySelector('.audio-divider');
      if (divider) {
        divider.style.background =
          'linear-gradient(to bottom,transparent,' + border + ',transparent)';
      }
    }

    return { init: init, navigate: navigate };
  })();


  /* ════════════════════════════════
     MODULE: tags
     ════════════════════════════════ */
  JN.tags = (function () {
    var BADGE = 'anki-tag-badge';
    var RE    = /^(N[1-6]|[0-3]E|Kakunin|Sin_Audio|bulk_translate|easter_egg)$/i;

    function init() {
      var tagsDiv   = document.getElementById('tags');
      var container = document.getElementById('tags-container');
      if (!tagsDiv || !container) return;

      var old = tagsDiv.querySelectorAll('.' + BADGE);
      old.forEach(function (el) { el.parentNode.removeChild(el); });

      var raw = tagsDiv.textContent || '';
      if (!raw.trim() || raw.indexOf('{{') !== -1) {
        container.style.display = 'none';
        return;
      }

      var seen = {}, good = [];
      raw.split(/[\s,;|\/\n\r]+/).forEach(function (t) {
        t = t.trim();
        if (t.indexOf('::') !== -1) t = t.split('::').pop().trim();
        t = t.replace(/^[^\w\-]+|[^\w\-]+$/g, '');
        var u = t.toUpperCase();
        if (u && !seen[u] && RE.test(t)) { seen[u] = true; good.push(u); }
      });

      if (good.length === 0) { container.style.display = 'none'; return; }

      tagsDiv.innerHTML = '';
      good.forEach(function (g) {
        var sp       = document.createElement('span');
        sp.className   = BADGE;
        sp.textContent = g;
        tagsDiv.appendChild(sp);
      });
      container.style.display = '';
    }

    return { init: init };
  })();


  /* ════════════════════════════════
     MODULE: freq
     Panel lateral de frecuencia.
     • Colapsado por defecto
     • Click en header lo despliega/colapsa
     • Estado persiste en localStorage durante la sesión
     ════════════════════════════════ */
  JN.freq = (function () {
    var FREQ_KEY = 'jn-freq-open';

    var SOURCE_COLORS = [
      { match: 'jpdb',  color: '#10B981' },
      { match: 'anime', color: '#818CF8' },
      { match: 'drama', color: '#818CF8' },
      { match: 'ln',    color: '#FBBF24' },
      { match: 'novel', color: '#FBBF24' },
      { match: 'vn',    color: '#FB7185' },
      { match: 'manga', color: '#34D399' }
    ];
    var COLOR_DEFAULT = '#9B72CF';

    function colorFor(source) {
      var key = source.toLowerCase();
      for (var i = 0; i < SOURCE_COLORS.length; i++) {
        if (key.indexOf(SOURCE_COLORS[i].match) !== -1) return SOURCE_COLORS[i].color;
      }
      return COLOR_DEFAULT;
    }

    function fmtNum(val) {
      return val.replace(/(\d+)/g, function (m) {
        var n = parseInt(m, 10);
        return isNaN(n) ? m : n.toLocaleString();
      });
    }

    function isOpen() {
      try { return localStorage.getItem(FREQ_KEY) === 'true'; }
      catch (e) { return false; }
    }

    function setOpen(val) {
      try { localStorage.setItem(FREQ_KEY, val ? 'true' : 'false'); }
      catch (e) {}
    }

    function applyState(open) {
      var content    = document.getElementById('freq-content');
      var header     = document.getElementById('freq-header');
      var panel      = document.getElementById('freq-panel');
      if (!content) return;
      content.classList.toggle('open', open);
      if (header)  header.classList.toggle('open', open);
      if (panel)   panel.classList.toggle('freq-panel--open', open);
    }

    function buildBadges(items) {
      var container = document.getElementById('freq-badges');
      if (!container) return;
      container.innerHTML = '';
      Array.prototype.forEach.call(items, function (li) {
        var text  = li.textContent.trim();
        var colon = text.indexOf(':');
        if (colon === -1) return;
        var source = text.slice(0, colon).trim();
        var value  = text.slice(colon + 1).trim();
        if (!source || !value) return;
        var color = colorFor(source);
        var badge = document.createElement('div');
        badge.className = 'freq-badge';
        badge.innerHTML =
          '<span class="freq-badge__label" style="background:' + color + '">' + source + '</span>' +
          '<span class="freq-badge__value">' + fmtNum(value) + '</span>';
        container.appendChild(badge);
      });
    }

    function init() {
      var rawEl  = document.getElementById('freq-raw');
      var panel  = document.getElementById('freq-panel');
      var header = document.getElementById('freq-header');
      if (!rawEl || !panel) return;

      if (rawEl.textContent.indexOf('{{') !== -1) {
        panel.style.display = 'none';
        return;
      }

      var items = rawEl.querySelectorAll('li');
      if (!items.length) {
        panel.style.display = 'none';
        return;
      }

      buildBadges(items);

      /* Aplicar estado guardado (default: cerrado) */
      applyState(isOpen());

      /* Click en header → toggle */
      if (header) {
        header.addEventListener('click', function (e) {
          e.stopPropagation();
          var next = !isOpen();
          setOpen(next);
          applyState(next);
        });
      }
    }

    return { init: init };
  })();


  /* ════════════════════════════════
     INIT
     ════════════════════════════════ */
  function initReverso() {
    JN.nav.init();
    JN.tags.init();
    JN.freq.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReverso);
  } else {
    initReverso();
  }

})(window);
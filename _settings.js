/* ════════════════════════════════════════════════
   _settings.js  — v5
   Namespace: JN (Japanese Notes)
   ════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  var JN = global.JN = global.JN || {};

  /* ── Inyectar Font Awesome si no está cargado ── */
  (function () {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      var link = document.createElement('link');
      link.rel  = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  })();

  var STORAGE_KEY = 'jn-settings-v3';

  var DEFAULTS = {
    palette:         'default',
    hoverAnimations: true,
    showTags:        true,
    showAudio:       true,
    showExtLinks:    true,
    showFreq:        true,
    typography:      'normal',
    customScale:     1.0,
    customColors:    {}
  };

  var THEME_CLASSES = [
    'theme-light',
    'theme-alto-contraste-claro',
    'theme-alto-contraste-oscuro',
    'theme-bearded-claro',
    'theme-bearded-oscuro',
    'theme-catppuccin',
    'theme-dracula',
    'theme-github-claro',
    'theme-github-oscuro',
    'theme-nord',
    'theme-solarized-claro',
    'theme-solarized-oscuro',
    'theme-tokyo-night'
  ];

  var VIS_CLASSES = {
    hoverAnimations: 'no-hover-anim',
    showAudio:       'hide-audio',
    showExtLinks:    'hide-ext-links',
    showFreq:        'hide-freq-panel',
    showTags:        'hide-tags'
  };

  var BG = {
    'default':               '#0f0f0f',
    'light':                 '#f0ebff',
    'alto-contraste-claro':  '#ffffff',
    'alto-contraste-oscuro': '#000000',
    'bearded-claro':         '#f5f4fa',
    'bearded-oscuro':        '#1b1b28',
    'catppuccin':            '#1e1e2e',
    'dracula':               '#282a36',
    'github-claro':          '#ffffff',
    'github-oscuro':         '#0d1117',
    'nord':                  '#2E3440',
    'solarized-claro':       '#fdf6e3',
    'solarized-oscuro':      '#002b36',
    'tokyo-night':           '#1A1B2E'
  };

  /*
   * Temas oscuros: "Oscuro" primero, resto alfabético.
   * Temas claros:  "Claro"  primero, resto alfabético.
   * Separador entre grupos.
   */
  var PALETTE_META = [
    { type: 'separator', label: 'Oscuros' },
    { key: 'default',               name: 'Oscuro',         bg: '#161616', dot: '#7C3AED' },
    { key: 'alto-contraste-oscuro', name: 'Alto Contraste', bg: '#000000', dot: '#ffffff' },
    { key: 'bearded-oscuro',        name: 'Bearded',        bg: '#1b1b28', dot: '#bf5af2' },
    { key: 'catppuccin',            name: 'Catppuccin',     bg: '#1e1e2e', dot: '#cba6f7' },
    { key: 'dracula',               name: 'Dracula',        bg: '#282a36', dot: '#bd93f9' },
    { key: 'github-oscuro',         name: 'GitHub',         bg: '#0d1117', dot: '#388bfd' },
    { key: 'nord',                  name: 'Nord',           bg: '#2E3440', dot: '#88C0D0' },
    { key: 'solarized-oscuro',      name: 'Solarized',      bg: '#002b36', dot: '#268bd2' },
    { key: 'tokyo-night',           name: 'Tokyo Night',    bg: '#1A1B2E', dot: '#7AA2F7' },
    { type: 'separator', label: 'Claros' },
    { key: 'light',                 name: 'Claro',          bg: '#e4d9ff', dot: '#6d28d9' },
    { key: 'alto-contraste-claro',  name: 'Alto Contraste', bg: '#f5f5f5', dot: '#000000' },
    { key: 'bearded-claro',         name: 'Bearded',        bg: '#f5f4fa', dot: '#7c3aed' },
    { key: 'github-claro',          name: 'GitHub',         bg: '#f6f8fa', dot: '#0969da' },
    { key: 'solarized-claro',       name: 'Solarized',      bg: '#fdf6e3', dot: '#268bd2' }
  ];

  var COLOR_VARS = [
    { key: '--bg',             label: 'Fondo principal'   },
    { key: '--card-bg',        label: 'Fondo tarjeta'     },
    { key: '--card-bg-raised', label: 'Fondo elevado'     },
    { key: '--border',         label: 'Borde'             },
    { key: '--purple-vivid',   label: 'Acento primario'   },
    { key: '--purple-mid',     label: 'Acento secundario' },
    { key: '--purple-soft',    label: 'Vocab / Kanji'     },
    { key: '--text-white',     label: 'Texto principal'   },
    { key: '--text-dim',       label: 'Texto secundario'  },
    { key: '--blue-lavender',  label: 'Lectura (kana)'    },
    { key: '--divider-color',  label: 'Separador'         }
  ];

  var TYPO = {
    small:  { label: 'Pequeño', scale: 0.85 },
    normal: { label: 'Normal',  scale: 1.0  },
    large:  { label: 'Grande',  scale: 1.2  },
    custom: { label: 'Custom',  scale: null }
  };
  var TYPO_ORDER = ['small','normal','large','custom'];

  var SECTIONS = ['tema','visibilidad','tipografia'];

  /* Ejemplo de formato JSON para exportar */
  var JSON_FORMAT_EXAMPLE = JSON.stringify({
    palette: 'default',
    customColors: {
      '--bg':           '#0f0f0f',
      '--card-bg':      '#161616',
      '--purple-vivid': '#7C3AED'
    }
  }, null, 2);


  /* ══════════════════════════════════════════════
     STORE
     ══════════════════════════════════════════════ */
  JN.settings = JN.settings || {};

  JN.settings.load = function () {
    try {
      var raw = localStorage.getItem(STORAGE_KEY)
             || localStorage.getItem('jn-settings-v2')
             || localStorage.getItem('jn-settings-v1');
      var data = raw
        ? Object.assign({}, DEFAULTS, JSON.parse(raw))
        : Object.assign({}, DEFAULTS);

      /* Migraciones */
      if (data.theme !== undefined) {
        data.palette = (data.theme === 'light') ? 'light' : 'default';
        delete data.theme;
      }
      if (data.palette === 'monokai') data.palette = 'default';
      if (!BG[data.palette])          data.palette = 'default';
      if (!TYPO[data.typography])     data.typography = 'normal';
      if (!data.customColors)         data.customColors = {};
      if (data.hoverAnimations === undefined) data.hoverAnimations = true;
      /* Limpiar campos obsoletos */
      delete data.animations;
      delete data.fontFamily;
      return data;
    } catch (e) { return Object.assign({}, DEFAULTS, { customColors: {} }); }
  };

  JN.settings.save = function (data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        palette: data.palette, hoverAnimations: data.hoverAnimations,
        showTags: data.showTags, showAudio: data.showAudio,
        showExtLinks: data.showExtLinks, showFreq: data.showFreq,
        typography: data.typography, customScale: data.customScale,
        customColors: data.customColors
      }));
    } catch (e) {}
  };

  JN.settings.reset = function () {
    try {
      ['jn-settings-v3','jn-settings-v2','jn-settings-v1'].forEach(function (k) {
        localStorage.removeItem(k);
      });
    } catch (e) {}
    var def = Object.assign({}, DEFAULTS, { customColors: {} });
    JN.settings.apply(def);
    JN.settings.menu.sync(def);
  };


  /* ══════════════════════════════════════════════
     APPLY
     ══════════════════════════════════════════════ */
  JN.settings.apply = function (cfg) {
    var root = document.documentElement;

    THEME_CLASSES.forEach(function (c) { document.body.classList.remove(c); });
    if (cfg.palette !== 'default') document.body.classList.add('theme-' + cfg.palette);

    Object.keys(VIS_CLASSES).forEach(function (key) {
      document.body.classList.toggle(VIS_CLASSES[key], !cfg[key]);
    });

    var scale = (cfg.typography === 'custom')
      ? (parseFloat(cfg.customScale) || 1.0)
      : TYPO[cfg.typography].scale;
    root.style.setProperty('--scale', scale);

    var cc = cfg.customColors || {};
    COLOR_VARS.forEach(function (v) {
      if (cc[v.key]) root.style.setProperty(v.key, cc[v.key]);
      else           root.style.removeProperty(v.key);
    });

    var bg = cc['--bg'] || BG[cfg.palette] || BG['default'];
    document.body.style.setProperty('background-color', bg, 'important');
    root.style.setProperty('background-color', bg, 'important');
  };


  /* ══════════════════════════════════════════════
     EXPORT / IMPORT
     ══════════════════════════════════════════════ */
  JN.settings.exportColors = function () {
    var cfg = JN.settings.load();
    var payload = { palette: cfg.palette, customColors: cfg.customColors || {} };
    var json    = JSON.stringify(payload, null, 2);

    /* Método 1: data: URI (funciona en Anki QtWebEngine) */
    try {
      var dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
      var a = document.createElement('a');
      a.setAttribute('href', dataUri);
      a.setAttribute('download', 'jn-theme.json');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    } catch (e) {}

    /* Fallback: copiar al portapapeles */
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(json).then(function () {
          JN.settings.menu._showExportFeedback('✓ JSON copiado al portapapeles');
        });
        return;
      }
    } catch (e2) {}

    /* Último recurso: mostrar en un alert */
    JN.settings.menu._showExportFeedback('Copia este JSON: ' + json.substring(0, 60) + '...');
  };

  JN.settings.importColors = function (file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var parsed = JSON.parse(e.target.result);
        var cfg = JN.settings.load();
        if (parsed.palette && BG[parsed.palette]) cfg.palette = parsed.palette;
        if (parsed.customColors && typeof parsed.customColors === 'object') {
          cfg.customColors = parsed.customColors;
        }
        JN.settings.save(cfg);
        JN.settings.apply(cfg);
        JN.settings.menu.sync(cfg);
        JN.settings.menu._showExportFeedback('✓ Tema importado');
      } catch (err) {
        JN.settings.menu._showExportFeedback('✗ Error al importar');
      }
    };
    reader.readAsText(file);
  };


  /* ══════════════════════════════════════════════
     MENU
     ══════════════════════════════════════════════ */
  JN.settings.menu = JN.settings.menu || {};
  JN.settings._activeSection = 'tema';

  JN.settings.menu.build = function () {
    if (document.getElementById('jn-settings-btn')) return;

    /* ── Botón ⚙ exterior (fixed, se oculta cuando panel abre) ── */
    var btn = document.createElement('button');
    btn.id    = 'jn-settings-btn';
    btn.className = 'settings-btn';
    btn.setAttribute('aria-label', 'Configuración');
    /* SVG inline de respaldo + icono FA (se muestra el que cargue primero) */
    btn.innerHTML =
      '<i class="fas fa-gear jn-fa-icon"></i>' +
      '<svg class="jn-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="3"/>' +
      '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' +
      '</svg>';

    /* ── Sidebar ── */
    var panel = document.createElement('div');
    panel.id        = 'jn-settings-panel';
    panel.className = 'settings-panel';
    panel.setAttribute('role', 'dialog');

    const cfg          = JN.settings.load();
    const initialLabel = (PALETTE_META.find(m => m.key === cfg.palette) || { name: 'Oscuro' }).name;

    const paletteItems = PALETTE_META.map(m => {
      if (m.type === 'separator') {
        return `<div class="sp-dropdown-separator">
          <i class="fas fa-${m.label === 'Oscuros' ? 'moon' : 'sun'}"></i> ${m.label}
        </div>`;
      }
      return `<button class="sp-dropdown-item" data-palette="${m.key}">
        <span class="sp-dropdown-dot" style="background:${m.bg};box-shadow:inset 0 0 0 2.5px ${m.dot}"></span>
        ${m.name}
      </button>`;
    }).join('');

    const colorRows = COLOR_VARS.map(v => `
      <div class="sp-color-row" data-var="${v.key}">
        <label class="sp-color-label">${v.label}</label>
        <div class="sp-color-right">
          <input type="color" class="sp-color-input" data-var="${v.key}" value="#000000">
          <input type="text"  class="sp-color-text"  data-var="${v.key}" placeholder="hex / var">
          <button class="sp-color-reset" data-var="${v.key}" title="Restablecer">
            <i class="fas fa-xmark"></i>
          </button>
        </div>
      </div>`).join('');

    const typoButtons = TYPO_ORDER.map(k =>
      `<button class="sp-typo-btn" data-typo="${k}">${TYPO[k].label}</button>`
    ).join('');

    /* Icono de respaldo para el botón interior */
    const gearInner =
      '<i class="fas fa-gear jn-fa-icon"></i>' +
      '<svg class="jn-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="3"/>' +
      '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' +
      '</svg>';

    panel.innerHTML = `
      <!-- NAV lateral -->
      <div class="sp-sidebar-nav">
        <div class="sp-sidebar-header">
          <button class="settings-btn settings-btn--inside" id="jn-settings-close-btn"
                  aria-label="Cerrar" title="Cerrar configuración">
            ${gearInner}
          </button>
          <button class="sp-close" id="jn-settings-close" aria-label="Cerrar">
            <i class="fas fa-xmark"></i>
          </button>
        </div>

        <nav class="sp-nav">
          <button class="sp-nav-btn" data-section="tema">
            <i class="fas fa-palette"></i> Tema
          </button>
          <button class="sp-nav-btn" data-section="visibilidad">
            <i class="fas fa-eye"></i> Visibilidad
          </button>
          <button class="sp-nav-btn" data-section="tipografia">
            <i class="fas fa-font"></i> Tipografía
          </button>
        </nav>

        <div class="sp-sidebar-footer">
          <button class="sp-reset" id="jn-settings-reset">
            <i class="fas fa-rotate-left"></i> Restablecer
          </button>
        </div>
      </div>

      <!-- CONTENIDO derecho -->
      <div class="sp-sidebar-content">

        <!-- ════ TEMA ════ -->
        <div class="sp-section" id="sp-section-tema">

          <div class="sp-section-label">Paleta de colores</div>
          <div class="sp-theme-row">
            <span class="sp-row-name">Tema</span>
            <div class="sp-dropdown" id="jn-dropdown">
              <button class="sp-dropdown-btn" id="jn-dropdown-btn" aria-haspopup="listbox">
                <span class="sp-dropdown-btn-label" id="jn-dropdown-label">${initialLabel}</span>
                <i class="fas fa-chevron-down sp-dropdown-chevron"></i>
              </button>
              <div class="sp-dropdown-list" role="listbox">${paletteItems}</div>
            </div>
          </div>

          <div class="sp-section-label sp-section-label--mt">Colores personalizados</div>
          <div class="sp-color-grid">${colorRows}</div>

          <!-- Export / Import -->
          <div class="sp-export-import">
            <button class="sp-export-btn" id="jn-export-btn">
              <i class="fas fa-file-export"></i> Exportar JSON
            </button>
            <label class="sp-import-label" for="jn-import-file">
              <i class="fas fa-file-import"></i> Importar JSON
            </label>
            <input type="file" id="jn-import-file" accept=".json" style="display:none">
          </div>
          <div class="sp-ei-feedback" id="jn-export-feedback"></div>

          <!-- Formato de referencia (colapsable) -->
          <div class="sp-format-toggle" id="jn-format-toggle">
            <button class="sp-format-btn" id="jn-format-btn">
              <i class="fas fa-code"></i> Ver formato JSON esperado
              <i class="fas fa-chevron-down sp-format-chevron" id="jn-format-chevron"></i>
            </button>
            <div class="sp-format-content" id="jn-format-content">
              <pre class="sp-format-pre">${JSON_FORMAT_EXAMPLE}</pre>
            </div>
          </div>

        </div>

        <!-- ════ VISIBILIDAD ════ (orden alfabético) -->
        <div class="sp-section" id="sp-section-visibilidad" style="display:none">
          <div class="sp-section-label">Elementos</div>

          <!-- Animaciones hover -->
          <label class="sp-row sp-row--toggle" for="jn-toggle-hover">
            <div class="sp-row-info">
              <span class="sp-row-name">Animaciones hover</span>
              <span class="sp-row-desc">Efectos de escala y sombra al pasar el cursor</span>
            </div>
            <div class="sp-toggle-wrap">
              <input type="checkbox" id="jn-toggle-hover" class="sp-toggle-input">
              <span class="sp-toggle-track"><span class="sp-toggle-thumb"></span></span>
            </div>
          </label>

          <!-- Botones de audio -->
          <label class="sp-row sp-row--toggle" for="jn-toggle-audio">
            <div class="sp-row-info">
              <span class="sp-row-name">Botones de audio</span>
              <span class="sp-row-desc">Botón de reproducción en vocab y ejemplos</span>
            </div>
            <div class="sp-toggle-wrap">
              <input type="checkbox" id="jn-toggle-audio" class="sp-toggle-input">
              <span class="sp-toggle-track"><span class="sp-toggle-thumb"></span></span>
            </div>
          </label>

          <!-- Links externos -->
          <label class="sp-row sp-row--toggle" for="jn-toggle-extlinks">
            <div class="sp-row-info">
              <span class="sp-row-name">Links externos</span>
              <span class="sp-row-desc">Badges de Jisho e Imágenes</span>
            </div>
            <div class="sp-toggle-wrap">
              <input type="checkbox" id="jn-toggle-extlinks" class="sp-toggle-input">
              <span class="sp-toggle-track"><span class="sp-toggle-thumb"></span></span>
            </div>
          </label>

          <!-- Panel de frecuencia -->
          <label class="sp-row sp-row--toggle" for="jn-toggle-freq">
            <div class="sp-row-info">
              <span class="sp-row-name">Panel de frecuencia</span>
              <span class="sp-row-desc">Panel lateral de frecuencias de palabra</span>
            </div>
            <div class="sp-toggle-wrap">
              <input type="checkbox" id="jn-toggle-freq" class="sp-toggle-input">
              <span class="sp-toggle-track"><span class="sp-toggle-thumb"></span></span>
            </div>
          </label>

          <!-- Tags -->
          <label class="sp-row sp-row--toggle" for="jn-toggle-tags">
            <div class="sp-row-info">
              <span class="sp-row-name">Tags</span>
              <span class="sp-row-desc">Badges de nivel al pie de la tarjeta</span>
            </div>
            <div class="sp-toggle-wrap">
              <input type="checkbox" id="jn-toggle-tags" class="sp-toggle-input">
              <span class="sp-toggle-track"><span class="sp-toggle-thumb"></span></span>
            </div>
          </label>

        </div>

        <!-- ════ TIPOGRAFÍA ════ -->
        <div class="sp-section" id="sp-section-tipografia" style="display:none">

          <div class="sp-section-label">Tamaño de interfaz</div>
          <div class="sp-typo-grid">${typoButtons}</div>

          <div class="sp-custom-scale" id="jn-custom-scale" style="display:none">
            <label class="sp-custom-label" for="jn-scale-range">Escala personalizada</label>
            <div class="sp-custom-row">
              <input type="range" id="jn-scale-range" class="sp-range"
                     min="0.7" max="1.6" step="0.05" value="1.0">
              <span class="sp-scale-val" id="jn-scale-val">1.0×</span>
            </div>
          </div>

          <div class="sp-section-label sp-section-label--mt">Vista previa</div>
          <div class="sp-typo-preview">
            <div class="sp-preview-kanji">漢字</div>
            <div class="sp-preview-meaning">Significado de ejemplo</div>
            <div class="sp-preview-reading">よみかた</div>
          </div>

        </div>

      </div><!-- /.sp-sidebar-content -->
    `;

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    /* ── IntersectionObserver: fade-in de filas de color al scrollear ── */
    try {
      var scrollRoot = panel.querySelector('.sp-sidebar-content');
      var rowObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('sp-color-row--visible');
            rowObserver.unobserve(entry.target);
          }
        });
      }, { root: scrollRoot, threshold: 0.15 });

      panel.querySelectorAll('.sp-color-row').forEach(function (row) {
        rowObserver.observe(row);
      });
    } catch (e) {}

    JN.settings.menu.showSection('tema');
  };


  /* ── Feedback export/import ── */
  JN.settings.menu._showExportFeedback = function (msg) {
    var el = document.getElementById('jn-export-feedback');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(function () { el.style.display = 'none'; el.textContent = ''; }, 3000);
  };


  JN.settings.menu.showSection = function (section) {
    JN.settings._activeSection = section;
    /* Cerrar dropdown de paleta al cambiar de sección */
    JN.settings.menu.closeDropdown();
    SECTIONS.forEach(function (s) {
      var el = document.getElementById('sp-section-' + s);
      if (!el) return;
      if (s === section) {
        el.style.display = '';
        /* Forzar reflow para que la animación arranque desde 0 */
        el.classList.remove('sp-section-enter');
        void el.offsetWidth;
        el.classList.add('sp-section-enter');
      } else {
        el.style.display = 'none';
        el.classList.remove('sp-section-enter');
      }
    });
    document.querySelectorAll('.sp-nav-btn').forEach(function (btn) {
      btn.classList.toggle('sp-nav-btn--active',
        btn.getAttribute('data-section') === section);
    });
  };


  JN.settings.menu.sync = function (cfg) {
    var label = document.getElementById('jn-dropdown-label');
    if (label) {
      var meta = PALETTE_META.find(m => m.key === cfg.palette && !m.type);
      label.textContent = meta ? meta.name : 'Oscuro';
    }
    document.querySelectorAll('.sp-dropdown-item').forEach(function (item) {
      item.classList.toggle('sp-dropdown-item--active',
        item.getAttribute('data-palette') === cfg.palette);
    });

    var cc = cfg.customColors || {};
    COLOR_VARS.forEach(function (v) {
      var ci = document.querySelector(`.sp-color-input[data-var="${v.key}"]`);
      var ti = document.querySelector(`.sp-color-text[data-var="${v.key}"]`);
      var val = cc[v.key] || '';
      if (ti) ti.value = val;
      if (ci && /^#[0-9a-fA-F]{6}$/.test(val)) ci.value = val;
    });

    var tmap = {
      'jn-toggle-hover':    cfg.hoverAnimations,
      'jn-toggle-audio':    cfg.showAudio,
      'jn-toggle-extlinks': cfg.showExtLinks,
      'jn-toggle-freq':     cfg.showFreq,
      'jn-toggle-tags':     cfg.showTags
    };
    Object.keys(tmap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.checked = tmap[id];
    });

    document.querySelectorAll('.sp-typo-btn').forEach(function (btn) {
      btn.classList.toggle('sp-typo-btn--active',
        btn.getAttribute('data-typo') === cfg.typography);
    });
    var cb = document.getElementById('jn-custom-scale');
    if (cb) cb.style.display = (cfg.typography === 'custom') ? '' : 'none';
    var ri = document.getElementById('jn-scale-range');
    var vi = document.getElementById('jn-scale-val');
    if (ri) ri.value = cfg.customScale || 1.0;
    if (vi) vi.textContent = parseFloat(cfg.customScale || 1.0).toFixed(2) + '×';

    JN.settings.menu._updateTypoPreview(cfg);
  };

  JN.settings.menu._updateTypoPreview = function (cfg) {
    var scale = (cfg.typography === 'custom')
      ? (parseFloat(cfg.customScale) || 1.0)
      : TYPO[cfg.typography].scale;
    var p = document.querySelector('.sp-typo-preview');
    if (p) p.style.setProperty('--preview-scale', scale);
  };


  JN.settings.menu.toggle = function () {
    var panel = document.getElementById('jn-settings-panel');
    var btn   = document.getElementById('jn-settings-btn');
    if (!panel) return;
    var isOpen = panel.classList.toggle('settings-panel--open');
    if (btn) {
      btn.style.opacity       = isOpen ? '0' : '';
      btn.style.pointerEvents = isOpen ? 'none' : '';
    }
    if (!isOpen) JN.settings.menu.closeDropdown();
  };

  JN.settings.menu.close = function () {
    var panel = document.getElementById('jn-settings-panel');
    var btn   = document.getElementById('jn-settings-btn');
    if (panel) panel.classList.remove('settings-panel--open');
    if (btn) { btn.style.opacity = ''; btn.style.pointerEvents = ''; }
    JN.settings.menu.closeDropdown();
  };

  JN.settings.menu.toggleDropdown = function () {
    var dd = document.getElementById('jn-dropdown');
    if (dd) dd.classList.toggle('sp-dropdown--open');
  };

  JN.settings.menu.closeDropdown = function () {
    var dd = document.getElementById('jn-dropdown');
    if (dd) dd.classList.remove('sp-dropdown--open');
  };

  JN.settings.menu.toggleFormat = function () {
    var content = document.getElementById('jn-format-content');
    var chevron = document.getElementById('jn-format-chevron');
    if (!content) return;
    var isOpen = content.classList.toggle('open');
    if (chevron) chevron.style.transform = isOpen ? 'rotate(180deg)' : '';
  };


  /* ══════════════════════════════════════════════
     BIND EVENTS
     ══════════════════════════════════════════════ */
  JN.settings.menu.bindEvents = function () {
    if (JN.settings._eventsBound) return;
    JN.settings._eventsBound = true;

    document.addEventListener('click', function (e) {
      var btn   = document.getElementById('jn-settings-btn');
      var panel = document.getElementById('jn-settings-panel');
      if (!btn || !panel) return;

      if (btn.contains(e.target))                                               { e.stopPropagation(); JN.settings.menu.toggle(); return; }

      var insideBtn = document.getElementById('jn-settings-close-btn');
      if (insideBtn && insideBtn.contains(e.target))                            { e.stopPropagation(); JN.settings.menu.close(); return; }

      var closeEl = document.getElementById('jn-settings-close');
      if (closeEl && closeEl.contains(e.target))                                { e.stopPropagation(); JN.settings.menu.close(); return; }

      var resetEl = document.getElementById('jn-settings-reset');
      if (resetEl && resetEl.contains(e.target))                                { e.stopPropagation(); JN.settings.reset(); return; }

      var expBtn = document.getElementById('jn-export-btn');
      if (expBtn && expBtn.contains(e.target))                                  { e.stopPropagation(); JN.settings.exportColors(); return; }

      var fmtBtn = document.getElementById('jn-format-btn');
      if (fmtBtn && fmtBtn.contains(e.target))                                  { e.stopPropagation(); JN.settings.menu.toggleFormat(); return; }

      /* Nav */
      var walk = e.target, navBtn = null;
      while (walk && walk !== panel) { if (walk.classList && walk.classList.contains('sp-nav-btn')) { navBtn = walk; break; } walk = walk.parentNode; }
      if (navBtn) { e.stopPropagation(); JN.settings.menu.showSection(navBtn.getAttribute('data-section')); return; }

      var ddBtn = document.getElementById('jn-dropdown-btn');
      if (ddBtn && ddBtn.contains(e.target)) { e.stopPropagation(); JN.settings.menu.toggleDropdown(); return; }

      walk = e.target; var paletteItem = null;
      while (walk && walk !== panel) { if (walk.classList && walk.classList.contains('sp-dropdown-item')) { paletteItem = walk; break; } walk = walk.parentNode; }
      if (paletteItem) {
        e.stopPropagation();
        var cfg = JN.settings.load(); cfg.palette = paletteItem.getAttribute('data-palette');
        JN.settings.save(cfg); JN.settings.apply(cfg); JN.settings.menu.sync(cfg);
        JN.settings.menu.closeDropdown(); return;
      }

      walk = e.target; var colorReset = null;
      while (walk && walk !== panel) { if (walk.classList && walk.classList.contains('sp-color-reset')) { colorReset = walk; break; } walk = walk.parentNode; }
      if (colorReset) {
        e.stopPropagation();
        var c2 = JN.settings.load(); delete c2.customColors[colorReset.getAttribute('data-var')];
        JN.settings.save(c2); JN.settings.apply(c2); JN.settings.menu.sync(c2); return;
      }

      walk = e.target; var typoBtn = null;
      while (walk && walk !== panel) { if (walk.classList && walk.classList.contains('sp-typo-btn')) { typoBtn = walk; break; } walk = walk.parentNode; }
      if (typoBtn) {
        e.stopPropagation();
        var c3 = JN.settings.load(); c3.typography = typoBtn.getAttribute('data-typo');
        JN.settings.save(c3); JN.settings.apply(c3); JN.settings.menu.sync(c3); return;
      }

      /* Toggles */
      var tmap2 = {
        'jn-toggle-hover':    function(v,c){ c.hoverAnimations = v; },
        'jn-toggle-audio':    function(v,c){ c.showAudio       = v; },
        'jn-toggle-extlinks': function(v,c){ c.showExtLinks    = v; },
        'jn-toggle-freq':     function(v,c){ c.showFreq        = v; },
        'jn-toggle-tags':     function(v,c){ c.showTags        = v; }
      };
      Object.keys(tmap2).forEach(function (id) {
        var el = document.getElementById(id);
        if (!el || !el.contains(e.target)) return;
        setTimeout(function () {
          var c5 = JN.settings.load(); tmap2[id](el.checked, c5);
          JN.settings.save(c5); JN.settings.apply(c5);
        }, 0);
      });

      /* Click fuera del panel (y fuera del botón) → cerrar panel */
      if (!panel.contains(e.target)) {
        JN.settings.menu.close();
        return;
      }

      /* Click dentro del panel pero fuera del dropdown → cerrar dropdown */
      var ddEl = document.getElementById('jn-dropdown');
      if (ddEl && !ddEl.contains(e.target)) {
        JN.settings.menu.closeDropdown();
      }
    });

    document.addEventListener('input', function (e) {
      var el = e.target;
      if (!el.classList) return;

      if (el.classList.contains('sp-color-input')) {
        var k = el.getAttribute('data-var'), c = JN.settings.load();
        c.customColors[k] = el.value;
        var ti = document.querySelector(`.sp-color-text[data-var="${k}"]`);
        if (ti) ti.value = el.value;
        JN.settings.save(c); JN.settings.apply(c); return;
      }
      if (el.classList.contains('sp-color-text')) {
        var k2 = el.getAttribute('data-var'), v2 = el.value.trim(), c2 = JN.settings.load();
        if (v2) {
          c2.customColors[k2] = v2;
          if (/^#[0-9a-fA-F]{6}$/.test(v2)) { var pi = document.querySelector(`.sp-color-input[data-var="${k2}"]`); if (pi) pi.value = v2; }
        } else { delete c2.customColors[k2]; }
        JN.settings.save(c2); JN.settings.apply(c2); return;
      }
      if (el.id === 'jn-scale-range') {
        var val = parseFloat(el.value), c3 = JN.settings.load();
        c3.customScale = val;
        var vi2 = document.getElementById('jn-scale-val');
        if (vi2) vi2.textContent = val.toFixed(2) + '×';
        JN.settings.save(c3); JN.settings.apply(c3); JN.settings.menu._updateTypoPreview(c3);
      }
    });

    document.addEventListener('change', function (e) {
      if (e.target.id === 'jn-import-file' && e.target.files[0]) {
        JN.settings.importColors(e.target.files[0]); e.target.value = '';
      }
    });
  };


  /* ══════════════════════════════════════════════
     INIT
     ══════════════════════════════════════════════ */
  (function () { JN.settings.apply(JN.settings.load()); })();

  JN.settings.init = function () {
    var cfg = JN.settings.load();
    JN.settings.menu.build();
    JN.settings.menu.sync(cfg);
    JN.settings.menu.bindEvents();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', JN.settings.init);
  } else {
    JN.settings.init();
  }

})(window);
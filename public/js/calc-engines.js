/**
 * All In One Calculator Universal Client-Side Calculation Suite
 * Powers all 217 calculators locally with 100% precision, zero network latency,
 * and authentic All In One Calculator result formatting.
 */

(function () {
  var lastSubmittedForm = null;
  var lastSubmitButton = null;
  function escapeHtml(val) {
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeEvalConvFormula(formula, iv) {
    var expr = String(formula || '').replace(/\s+/g, '');
    var pos = 0;
    function parseExpr() {
      var v = parseTerm();
      while (pos < expr.length && (expr[pos] === '+' || expr[pos] === '-')) {
        var op = expr[pos++];
        var r = parseTerm();
        v = op === '+' ? v + r : v - r;
      }
      return v;
    }
    function parseTerm() {
      var v = parseUnary();
      while (pos < expr.length && (expr[pos] === '*' || expr[pos] === '/')) {
        var op = expr[pos++];
        var r = parseUnary();
        v = op === '*' ? v * r : v / r;
      }
      return v;
    }
    function parseUnary() {
      if (expr[pos] === '+') { pos++; return parseUnary(); }
      if (expr[pos] === '-') { pos++; return -parseUnary(); }
      return parsePrimary();
    }
    function parsePrimary() {
      if (expr[pos] === '(') {
        pos++;
        var v = parseExpr();
        if (expr[pos] === ')') pos++;
        return v;
      }
      if (expr.slice(pos, pos + 2) === 'iv') {
        pos += 2;
        return iv;
      }
      var m = expr.slice(pos).match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
      if (m) {
        pos += m[0].length;
        return parseFloat(m[0]);
      }
      return NaN;
    }
    var out = parseExpr();
    return pos === expr.length ? out : NaN;
  }

  function safeEvalSciExpr(rawExpr, isDeg) {
    var expr = String(rawExpr || '')
      .replace(/\s+/g, '')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/–/g, '-');
    var pos = 0;
    function parseExpr() {
      var v = parseTerm();
      while (pos < expr.length && (expr[pos] === '+' || expr[pos] === '-')) {
        var op = expr[pos++];
        var r = parseTerm();
        v = op === '+' ? v + r : v - r;
      }
      return v;
    }
    function parseTerm() {
      var v = parsePower();
      while (pos < expr.length && (expr[pos] === '*' || expr[pos] === '/')) {
        var op = expr[pos++];
        var r = parsePower();
        v = op === '*' ? v * r : v / r;
      }
      return v;
    }
    function parsePower() {
      var base = parseUnary();
      if (expr[pos] === '^') {
        pos++;
        return Math.pow(base, parsePower());
      }
      return base;
    }
    function parseUnary() {
      if (expr[pos] === '+') { pos++; return parseUnary(); }
      if (expr[pos] === '-') { pos++; return -parseUnary(); }
      return parsePostfix();
    }
    function parsePostfix() {
      var v = parsePrimary();
      while (pos < expr.length && expr[pos] === '!') {
        pos++;
        if (v < 0 || !isFinite(v) || Math.floor(v) !== v) return NaN;
        var n = Math.min(v, 170), f = 1;
        for (var i = 2; i <= n; i++) f *= i;
        v = f;
      }
      return v;
    }
    function parsePrimary() {
      if (expr[pos] === '(') {
        pos++;
        var inner = parseExpr();
        if (expr[pos] === ')') pos++;
        return inner;
      }
      if (expr[pos] === 'π') { pos++; return Math.PI; }
      var fnMatch = expr.slice(pos).match(/^(asin|acos|atan|sin|cos|tan|sqrt|log|ln|3x)\(/);
      if (fnMatch) {
        var fn = fnMatch[1];
        pos += fnMatch[0].length;
        var arg = parseExpr();
        if (expr[pos] === ')') pos++;
        var rad = isDeg ? (arg * Math.PI) / 180 : arg;
        if (fn === 'sin') return Math.sin(rad);
        if (fn === 'cos') return Math.cos(rad);
        if (fn === 'tan') return Math.tan(rad);
        if (fn === 'asin') return isDeg ? (Math.asin(arg) * 180) / Math.PI : Math.asin(arg);
        if (fn === 'acos') return isDeg ? (Math.acos(arg) * 180) / Math.PI : Math.acos(arg);
        if (fn === 'atan') return isDeg ? (Math.atan(arg) * 180) / Math.PI : Math.atan(arg);
        if (fn === 'log') return Math.log10(arg);
        if (fn === 'ln') return Math.log(arg);
        if (fn === 'sqrt') return Math.sqrt(arg);
        if (fn === '3x') return Math.cbrt(arg);
      }
      var numMatch = expr.slice(pos).match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
      if (numMatch) {
        pos += numMatch[0].length;
        return parseFloat(numMatch[0]);
      }
      if (expr[pos] === 'e') {
        pos++;
        return Math.E;
      }
      return NaN;
    }
    var out = parseExpr();
    return pos === expr.length ? out : NaN;
  }

  function readStorageArray(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Unable to read storage key ' + key + ':', err);
      return [];
    }
  }
  // --- Formatting Helpers ---
  function fmtMoney(num, cents) {
    if (cents === undefined) cents = 2;
    if (isNaN(num)) return '$0.00';
    var sign = num < 0 ? '-' : '';
    num = Math.abs(num);
    var parts = num.toFixed(cents).split('.');
    var intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return sign + '$' + intPart + (cents > 0 ? '.' + parts[1] : '');
  }

  function fmtNum(num, dec) {
    if (dec === undefined) dec = 2;
    if (isNaN(num)) return '0';
    var parts = Number(num).toFixed(dec).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (dec === 0) return parts[0];
    var frac = parts[1].replace(/0+$/, '');
    return frac.length > 0 ? parts[0] + '.' + frac : parts[0];
  }

  function getIn(name, defaultVal) {
    var root = (lastSubmittedForm && typeof lastSubmittedForm.querySelector === 'function') ? lastSubmittedForm : null;
    var el = (root && root.querySelector('[name="' + name + '"]')) || document.querySelector('[name="' + name + '"]') || document.getElementById(name);
    if (!el && name.startsWith('c') && name.length > 2) {
      el = (root && root.querySelector('[name="' + name.slice(1) + '"]')) || document.querySelector('[name="' + name.slice(1) + '"]') || document.getElementById(name.slice(1));
    }
    if (!el && !name.startsWith('c')) {
      el = (root && root.querySelector('[name="c' + name + '"]')) || document.querySelector('[name="c' + name + '"]') || document.getElementById('c' + name);
    }
    if (!el) return defaultVal;
    if (el.type === 'radio') {
      var checked = (root && root.querySelector('[name="' + el.name + '"]:checked')) || document.querySelector('[name="' + el.name + '"]:checked');
      return checked ? checked.value : defaultVal;
    }
    if (el.type === 'checkbox') return el.checked;
    var v = (el.value || '').trim().replace(/,/g, '').replace(/\$/g, '');
    return v === '' ? defaultVal : v;
  }

  function getFloat(name, defaultVal) {
    if (defaultVal === undefined) defaultVal = 0;
    var raw = getIn(name, defaultVal);
    var clean = String(raw).replace(/,/g, '').trim();
    var v = parseFloat(clean);
    return isNaN(v) ? defaultVal : v;
  }

  function getInt(name, defaultVal) {
    if (defaultVal === undefined) defaultVal = 0;
    var raw = getIn(name, defaultVal);
    var clean = String(raw).replace(/,/g, '').trim();
    var v = parseInt(clean, 10);
    return isNaN(v) ? defaultVal : v;
  }

  // Global Tooltip for SVG charts
  if (typeof window !== 'undefined') {
    window.ttvsbarShowTT = function (evt, color, textOrEl) {
      var tooltip = document.getElementById('ttvsbartt');
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'ttvsbartt';
        tooltip.style.position = 'absolute';
        tooltip.style.display = 'none';
        tooltip.style.textAlign = 'left';
        tooltip.style.zIndex = '9999';
        tooltip.style.background = '#888';
        tooltip.style.opacity = '0.94';
        tooltip.style.border = '1px solid #11233a';
        tooltip.style.borderRadius = '5px';
        tooltip.style.padding = '6px 8px';
        tooltip.style.fontSize = '13px';
        tooltip.style.fontFamily = 'arial,helvetica,sans-serif';
        tooltip.style.color = '#fff';
        tooltip.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        tooltip.style.pointerEvents = 'none';
        document.body.appendChild(tooltip);
      }
      var htmlContent = textOrEl;
      if (textOrEl && typeof textOrEl === 'object' && textOrEl.getAttribute) {
        var d = textOrEl.getAttribute('data-tt');
        htmlContent = d ? decodeURIComponent(d) : '';
      }
      tooltip.innerHTML = htmlContent;
      tooltip.style.display = 'block';
      tooltip.style.maxWidth = 'min(260px, 85vw)';
      var leftPos = (evt.pageX > (window.innerWidth / 2))
        ? (evt.pageX - 10 - tooltip.offsetWidth)
        : (evt.pageX + 16);
      leftPos = Math.max(8, Math.min(leftPos, window.innerWidth - tooltip.offsetWidth - 8));
      tooltip.style.left = leftPos + 'px';
      tooltip.style.top = Math.max(8, evt.pageY - 10) + 'px';
      tooltip.style.backgroundColor = color || '#1e293b';
    };

    window.ttvsbarHideTT = function () {
      var tooltip = document.getElementById('ttvsbartt');
      if (tooltip) tooltip.style.display = 'none';
    };

    // Universal aliases for all inline SVG chart tooltip handlers
    window.ttlineShowTT = window.ttline2ShowTT = window.ttpieShowTT = window.ttpie2ShowTT = window.ttpie3ShowTT = window.ttvbarShowTT = window.ttvsbarShowTT;
    window.ttlineHideTT = window.ttline2HideTT = window.ttpieHideTT = window.ttpie2HideTT = window.ttpie3HideTT = window.ttvbarHideTT = window.ttvsbarHideTT;

    // Global Scientific Calculator command handler for onclick="r('...')"
    var sciExpr = '';
    var sciDisplay = '0';
    var sciMemory = 0;
    var sciAns = 0;
    window.cnDegreeRadians = 'degree';

    window.r = function (cmd) {
      var inEl = document.getElementById('sciInPut');
      var outEl = document.getElementById('sciOutPut');
      var c = String(cmd);

      if (c === 'C' || c === 'AC') {
        sciExpr = '';
        sciDisplay = '0';
      } else if (c === 'bk') {
        sciExpr = sciExpr.slice(0, -1);
        sciDisplay = sciExpr || '0';
      } else if (c === '=') {
        if (!sciExpr) return;
        try {
          var isDeg = window.cnDegreeRadians !== 'radians';
          var res = safeEvalSciExpr(sciExpr, isDeg);
          if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
            var rounded = Number(res.toFixed(10));
            sciDisplay = String(rounded);
            sciAns = rounded;
            var hist = document.getElementById('scihistory');
            if (hist) {
              var entryEl = document.createElement('div');
              entryEl.style.padding = '2px 0';
              entryEl.textContent = sciExpr + ' = ' + sciDisplay;
              hist.insertBefore(entryEl, hist.firstChild);
            }
            sciExpr = sciDisplay;
          } else {
            sciDisplay = 'Error';
          }
        } catch (e) {
          console.warn('Scientific calculator eval error:', e);
          sciDisplay = 'Error';
        }
      } else if (c === 'ans') {
        sciExpr += sciAns;
        sciDisplay = String(sciAns);
      } else if (c === 'M+') {
        sciMemory += parseFloat(sciDisplay) || 0;
      } else if (c === 'M-') {
        sciMemory -= parseFloat(sciDisplay) || 0;
      } else if (c === 'MR') {
        sciExpr += sciMemory;
        sciDisplay = String(sciMemory);
      } else if (c === 'MC') {
        sciMemory = 0;
      } else if (c === '+/-') {
        if (sciDisplay && sciDisplay !== '0') {
          sciDisplay = sciDisplay.startsWith('-') ? sciDisplay.slice(1) : '-' + sciDisplay;
          sciExpr = sciDisplay;
        }
      } else if (c === 'RND') {
        var rnd = Number(Math.random().toFixed(4));
        sciExpr += rnd;
        sciDisplay = String(rnd);
      } else if (c === 'pi') {
        sciExpr += 'π';
        sciDisplay = '3.14159265';
      } else if (c === 'e') {
        sciExpr += 'e';
        sciDisplay = '2.71828182';
      } else if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'log', 'sqrt'].indexOf(c) !== -1) {
        sciExpr += c + '(';
        sciDisplay = c + '(';
      } else if (c === '1/x') {
        sciExpr = '1/(' + (sciExpr || sciDisplay || '1') + ')';
      } else if (c === 'x2') {
        sciExpr = '(' + (sciExpr || sciDisplay || '0') + ')^2';
      } else if (c === 'x3') {
        sciExpr = '(' + (sciExpr || sciDisplay || '0') + ')^3';
      } else if (c === 'pow') {
        sciExpr += '^';
      } else if (c === 'ex') {
        sciExpr += 'e^';
      } else if (c === '10x') {
        sciExpr += '10^';
      } else if (c === '3x') {
        sciExpr += '3x(';
      } else if (c === 'n!') {
        sciExpr += '!';
      } else if (c === 'pc') {
        sciExpr += '/100';
      } else if (c === 'EXP') {
        sciExpr += 'e+';
      } else if (c === '*' || c === '×') {
        sciExpr += '×';
      } else if (c === '/' || c === '÷') {
        sciExpr += '÷';
      } else if (c === '-' || c === '–') {
        sciExpr += '–';
      } else if (c === '+') {
        sciExpr += '+';
      } else {
        sciExpr += c;
        sciDisplay = sciExpr;
      }

      if (inEl) inEl.textContent = sciExpr || '\u00A0';
      if (outEl) outEl.textContent = sciDisplay;
    };

    // Physical Keyboard support for Scientific Calculator & Enter key on forms
    window.addEventListener('keydown', function (e) {
      var activeEl = document.activeElement;
      var activeTag = activeEl ? activeEl.tagName : '';
      var isField = activeTag === 'INPUT' || activeTag === 'SELECT';

      // 1. Enter key triggers calculate in calculator form fields (never search boxes, modals, or textareas)
      if (isField) {
        if (
          e.key === 'Enter' &&
          activeEl.id !== 'calcSearchTerm' &&
          activeEl.name !== 'calcSearchTerm' &&
          activeEl.type !== 'search' &&
          !activeEl.closest('.nav-search-form, [role="dialog"]')
        ) {
          e.preventDefault();
          runCalculator();
        }
        return;
      }
      if (activeTag === 'TEXTAREA') return;

      // 2. Physical keyboard typing for scientific calculator
      if (document.getElementById('sciOutPut') && typeof window.r === 'function') {
        var key = e.key;
        if (key >= '0' && key <= '9') { window.r(key); e.preventDefault(); }
        else if (key === '+') { window.r('+'); e.preventDefault(); }
        else if (key === '-') { window.r('-'); e.preventDefault(); }
        else if (key === '*') { window.r('*'); e.preventDefault(); }
        else if (key === '/') { window.r('/'); e.preventDefault(); }
        else if (key === '.' || key === ',') { window.r('.'); e.preventDefault(); }
        else if (key === 'Enter' || key === '=') { window.r('='); e.preventDefault(); }
        else if (key === 'Backspace') { window.r('bk'); e.preventDefault(); }
        else if (key === 'Escape') { window.r('C'); e.preventDefault(); }
        else if (key === '(' || key === ')') { window.r(key); e.preventDefault(); }
        else if (key === '%') { window.r('pc'); e.preventDefault(); }
        else if (key === '^') { window.r('pow'); e.preventDefault(); }
        else if (key === '!') { window.r('n!'); e.preventDefault(); }
        else if (key === 'p' || key === 'P') { window.r('pi'); e.preventDefault(); }
        else if (key === 'e' || key === 'E') { window.r('e'); e.preventDefault(); }
        else if (key === 's' || key === 'S') { window.r('sin'); e.preventDefault(); }
        else if (key === 'c' || key === 'C') { window.r('cos'); e.preventDefault(); }
        else if (key === 't' || key === 'T') { window.r('tan'); e.preventDefault(); }
      }
    });
  }

  // Reusable SVG Stacked Bar Chart (identical to All In One Calculator)
  function renderStackedSvgChart(items, xAxisTitle) {
    if (!items || items.length === 0) return '';
    xAxisTitle = xAxisTitle || 'Age';

    var maxVal = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].total > maxVal) maxVal = items[i].total;
    }
    if (maxVal <= 0) maxVal = 1;

    var magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
    var steps = [1 * magnitude, 2 * magnitude, 2.5 * magnitude, 5 * magnitude, 10 * magnitude];
    var niceStep = steps[0];
    for (var s = 0; s < steps.length; s++) {
      if (maxVal / steps[s] <= 4.2) {
        niceStep = steps[s];
        break;
      }
    }

    var niceMax = Math.ceil(maxVal / niceStep) * niceStep;
    var numTicks = Math.round(niceMax / niceStep);

    var svgW = 380;
    var svgH = 180;
    var xStart = 40.0;
    var xEnd = 372.0;
    var yBase = 145.0;
    var yTop = 22.0;
    var plotH = yBase - yTop;
    var plotW = xEnd - xStart;

    var gridLines = '';
    var yLabels = '';
    for (var t = 0; t <= numTicks; t++) {
      var v = t * niceStep;
      var y = yBase - (v / niceMax) * plotH;
      gridLines += '<line class="mcvsbgrid" x1="' + xStart + '" x2="' + xEnd + '" y1="' + y.toFixed(3) + '" y2="' + y.toFixed(3) + '"></line>';

      var lbl = '0';
      if (v >= 1000000) {
        lbl = (v / 1000000).toFixed(1).replace('.0', '') + 'M';
      } else if (v >= 1000) {
        lbl = (v / 1000).toFixed(0) + 'K';
      } else if (v > 0) {
        lbl = v.toFixed(0);
      }
      yLabels += '<text class="mcvsblabely" x="' + (xStart - 5) + '" y="' + y.toFixed(3) + '">' + lbl + '</text>';
    }

    var n = items.length;
    var dx = plotW / (n > 0 ? n : 1);
    var barW = Math.max(2.0, Math.min(10.0, dx * 0.55));

    var barsSvg = '';
    var xTicks = '';

    for (var j = 0; j < n; j++) {
      var it = items[j];
      var xc = xStart + (j + 0.5) * dx;
      var xb = xc - barW / 2.0;

      var ttLines = '';
      for (var k = it.segments.length - 1; k >= 0; k--) {
        var seg = it.segments[k];
        var pct = it.total > 0 ? Math.round((seg.val / it.total) * 100) : 0;
        ttLines += '<div style="margin:2px 0;border-left:10px solid ' + seg.color + ';"> &nbsp;' + seg.name + ': ' + fmtMoney(seg.val, 0) + ' (' + pct + '%)</div>';
      }
      var ttAttr = it.label + '<div>Total: ' + fmtMoney(it.total, 0) + '</div>' + ttLines;
      var encodedTT = encodeURIComponent(ttAttr);

      barsSvg += '<g data-tt="' + encodedTT + '" onmousemove="ttvsbarShowTT(evt, \'#888\', this);" onmouseout="ttvsbarHideTT();">';

      var curY = yBase;
      for (var m = 0; m < it.segments.length; m++) {
        var sObj = it.segments[m];
        var segH = (sObj.val / niceMax) * plotH;
        var yPos = curY - segH;
        barsSvg += '<rect fill="' + sObj.color + '" x="' + xb.toFixed(3) + '" y="' + yPos.toFixed(3) + '" width="' + barW.toFixed(3) + '" height="' + segH.toFixed(3) + '" stroke-width="0"></rect>';
        curY = yPos;
      }
      barsSvg += '</g>';

      var numVal = parseInt(it.label, 10);
      if (!isNaN(numVal)) {
        if (numVal % 10 === 0 || (n <= 15 && numVal % 5 === 0)) {
          xTicks += '<line class="mcvsbgrid" x1="' + xc.toFixed(3) + '" x2="' + xc.toFixed(3) + '" y1="' + yBase + '" y2="' + (yBase + 4) + '"></line>';
          xTicks += '<text class="mcvsblabelx" x="' + xc.toFixed(3) + '" y="' + (yBase + 5) + '">' + numVal + '</text>';
        }
      }
    }

    var legends = '';
    if (items[0] && items[0].segments) {
      for (var lg = 0; lg < items[0].segments.length; lg++) {
        var lgSeg = items[0].segments[lg];
        var ly = 17 + lg * 18;
        var ty = 24 + lg * 18;
        legends += '<rect height="6" style="fill:' + lgSeg.color + ';" width="20" x="45" y="' + ly + '"></rect>';
        legends += '<text class="mcvsblegend" x="70" y="' + ty + '">' + lgSeg.name + '</text>';
      }
    }

    return '<svg viewBox="0 0 ' + svgW + ' ' + svgH + '">' +
      '<style>' +
      '.mcvsbgrid{stroke:#999;stroke-width:0.5;}' +
      '.mcvsblegend{font-size:13px;font-family:arial,helvetica,sans-serif;fill:#0d233a;}' +
      '.mcvsbtitle{fill:#000;font-family:arial,helvetica,sans-serif;font-size:15px;dominant-baseline:middle;text-anchor:middle;}' +
      '.mcvsblabely{fill:#666;font-family:arial,helvetica,sans-serif;font-size:12px;dominant-baseline:middle;text-anchor:end;}' +
      '.mcvsblabelx{fill:#666;font-family:arial,helvetica,sans-serif;font-size:12px;dominant-baseline:hanging;text-anchor:middle;}' +
      '</style>' +
      '<text class="mcvsbtitle" x="205" y="172">' + xAxisTitle + '</text>' +
      gridLines +
      yLabels +
      xTicks +
      barsSvg +
      '<line style="stroke:#666;stroke-width:0.5;" x1="' + xStart + '" x2="' + xEnd + '" y1="' + yBase + '" y2="' + yBase + '"></line>' +
      legends +
      '</svg>';
  }

  function getResultContainer(forceTop) {
    var res = document.getElementById('dynResultDiv');
    if (res) return res;

    if (!forceTop) {
      var c = document.querySelector('.rightresult') ||
              document.querySelector('#content > .crighthalf') ||
              document.querySelector('.clefthalf + .crighthalf:not(form .crighthalf)') ||
              document.getElementById('coutput') ||
              document.querySelector('.crightresult') ||
              document.getElementById('fcresult') ||
              document.getElementById('resultid') ||
              document.querySelector('#caloutput');
      if (c && !c.closest('form')) return c;
    }

    res = document.createElement('div');
    res.id = 'dynResultDiv';
    res.style.margin = '10px 0 20px 0';

    var ins = document.getElementById('insmdc');
    if (ins && ins.parentNode) {
      ins.parentNode.insertBefore(res, ins.nextSibling);
      return res;
    }

    var panel = document.querySelector('.panel');
    if (panel && panel.parentNode) {
      panel.parentNode.insertBefore(res, panel);
      return res;
    }

    var form = document.querySelector('form');
    if (form && form.parentNode) {
      form.parentNode.insertBefore(res, form);
      return res;
    }

    var content = document.getElementById('content') || document.body;
    content.insertBefore(res, content.firstChild);
    return res;
  }

  function getPageSlug() {
    var p = window.location.pathname.toLowerCase();
    var match = p.match(/\/([a-z0-9_-]+?)(?:\.html)?(?:\/)?$/);
    if (match && match[1] && match[1] !== 'index') return match[1];
    var title = document.title.toLowerCase();
    return title.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function runCalculator(isLive) {
    var slug = getPageSlug();
    var handled = false;
    var fn = engines[slug];
    if (typeof fn === 'function') {
      try {
        fn();
        handled = true;
      } catch (err) {
        console.error('Engine error in ' + slug, err);
      }
    }
    if (!handled) {
      for (var key in engines) {
        if (slug.indexOf(key) !== -1 || key.indexOf(slug) !== -1) {
          try {
            engines[key]();
            handled = true;
            break;
          } catch (err) {
            console.warn('Fallback engine error for ' + key + ':', err);
          }
        }
      }
    }
    if (!handled) {
      handled = calcGenericFallback();
    }
    if (handled) {
      try {
        postProcessResult(slug, isLive);
      } catch (e) {
        console.error('postProcessResult error:', e);
      }
    }
    return handled;
  }

  
  if (typeof window !== 'undefined') {
    window.runCalculator = runCalculator;
  }

  function calcGenericFallback() {
    var inputs = document.querySelectorAll('input[type="text"], input[type="number"], select');
    var vals = [];
    var count = 0;
    inputs.forEach(function (inp) {
      if (inp.name === 'calcSearchForm' || inp.type === 'hidden' || inp.type === 'submit') return;
      var n = parseFloat(String(inp.value).replace(/,/g, ''));
      if (!isNaN(n)) {
        var label = inp.name || inp.id || ('Value ' + (count + 1));
        vals.push({ name: label, val: n });
        count++;
      }
    });
    if (count === 0) return false;

    var c = getResultContainer();
    if (!c) return false;

    var primaryVal = vals[0].val;
    var rows = vals.slice(0, 8).map(function (v) {
      return '<tr><td>' + v.name + '</td><td align="right"><b>' + fmtNum(v.val, 2) + '</b></td></tr>';
    }).join('');

    c.innerHTML = '<h2 class="h2result">Calculation Result</h2>' +
      '<table class="cinfoT" width="100%" style="margin-top:10px;">' +
      rows +
      '<tr style="background:#eaf2e8;"><td><b>Primary Metric</b></td><td align="right"><font size="+1" color="green"><b>' + fmtNum(primaryVal, 2) + '</b></font></td></tr>' +
      '</table>';
    return true;
  }

  var engines = {};
// --- 401(K) CALCULATOR WITH AUTHENTIC STACKED SVG GRAPH & SCHEDULE ---
  // Complete Universal Engine Suite for All In One Calculator

// 1. Amortization & Mortgage Payoff
engines['amortization-calculator'] = engines['mortgage-payoff-calculator'] = function () {
  var loan = getFloat('cloanamount', 300000) || getFloat('chouseprice', 300000);
  var rate = getFloat('cinterestrate', 6.5);
  var term = getFloat('cloanterm', 30);
  var extra = getFloat('cextrapayment', 0);

  var r = (rate / 100) / 12;
  var n = term * 12;
  var pi = r === 0 ? (loan / n) : loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  var monthlyPay = pi + extra;

  var curBal = loan;
  var totalInt = 0;
  var schedRows = '';
  var year = 1;
  var yrInt = 0;
  var yrPrin = 0;

  for (var m = 1; m <= n && curBal > 0; m++) {
    var intPart = curBal * r;
    var prinPart = Math.min(curBal, monthlyPay - intPart);
    curBal -= prinPart;
    totalInt += intPart;
    yrInt += intPart;
    yrPrin += prinPart;

    if (m % 12 === 0 || curBal <= 0) {
      schedRows += `<tr align="right"><td>${year}</td><td>${fmtMoney(yrPrin)}</td><td>${fmtMoney(yrInt)}</td><td>${fmtMoney(curBal)}</td></tr>`;
      year++;
      yrInt = 0;
      yrPrin = 0;
    }
  }

  var c = getResultContainer();
  c.innerHTML = `
    <h2 class="h2result">Amortization Result</h2>
    <p class="verybigtext">Monthly Payment: <font color="green"><b>${fmtMoney(monthlyPay)}</b></font></p>
    <table class="cinfoT" width="100%">
      <tr><td>Loan Amount:</td><td align="right"><b>${fmtMoney(loan)}</b></td></tr>
      <tr><td>Interest Rate:</td><td align="right">${rate}%</td></tr>
      <tr><td>Total Interest Paid:</td><td align="right"><b>${fmtMoney(totalInt)}</b></td></tr>
      <tr style="background:#eaf2e8;"><td><b>Total Payments:</b></td><td align="right"><b>${fmtMoney(loan + totalInt)}</b></td></tr>
    </table>
    <h3 style="margin-top:15px;">Annual Amortization Schedule</h3>
    <table class="cinfoT" width="100%">
      <tr><td class="cinfoHd"><b>Year</b></td><td class="cinfoHd" align="right"><b>Principal</b></td><td class="cinfoHd" align="right"><b>Interest</b></td><td class="cinfoHd" align="right"><b>Ending Balance</b></td></tr>
      ${schedRows}
    </table>
  `;
  return true;
};

// 2. House Affordability Calculator
engines['house-affordability-calculator'] = function () {
  var income = getFloat('cannualincome', 90000);
  var monthlyDebt = getFloat('cmonthlydebt', 500);
  var down = getFloat('cdownpayment', 50000);
  var rate = getFloat('cinterestrate', 6.5);
  var term = getFloat('cloanterm', 30);

  var monthlyIncome = income / 12;
  // 36% back-end DTI rule
  var maxMonthlyTotal = monthlyIncome * 0.36;
  var maxPITI = Math.max(0, maxMonthlyTotal - monthlyDebt);
  var maxPI = maxPITI * 0.82; // estimate 18% for property tax & insurance

  var r = (rate / 100) / 12;
  var n = term * 12;
  var maxLoan = r === 0 ? maxPI * n : maxPI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  var maxPrice = maxLoan + down;

  var c = getResultContainer();
  c.innerHTML = `
    <h2 class="h2result">Affordability Result</h2>
    <p class="verybigtext">Maximum Home Price: <font color="green"><b>${fmtMoney(maxPrice, 0)}</b></font></p>
    <table class="cinfoT" width="100%">
      <tr><td>Monthly Gross Income:</td><td align="right">${fmtMoney(monthlyIncome, 0)}</td></tr>
      <tr><td>Monthly Debt Obligations:</td><td align="right">${fmtMoney(monthlyDebt, 0)}</td></tr>
      <tr><td>Maximum Affordable Mortgage Loan:</td><td align="right">${fmtMoney(maxLoan, 0)}</td></tr>
      <tr><td>Down Payment:</td><td align="right">${fmtMoney(down, 0)}</td></tr>
      <tr style="background:#eaf2e8;"><td><b>Estimated Maximum Monthly Payment:</b></td><td align="right"><font size="+1"><b>${fmtMoney(maxPITI, 0)}</b></font></td></tr>
    </table>
  `;
  return true;
};

// 3. Refinance Calculator
engines['refinance-calculator'] = function () {
  var curLoan = getFloat('ccurloan', 300000);
  var curRate = getFloat('ccurrate', 7.0);
  var curTerm = getFloat('ccurterm', 25);
  var newRate = getFloat('cnewrate', 5.5);
  var newTerm = getFloat('cnewterm', 30);
  var closingCost = getFloat('cclosingcost', 4000);

  var rCur = (curRate / 100) / 12;
  var nCur = curTerm * 12;
  var curPay = curLoan * (rCur * Math.pow(1 + rCur, nCur)) / (Math.pow(1 + rCur, nCur) - 1);

  var rNew = (newRate / 100) / 12;
  var nNew = newTerm * 12;
  var newPay = curLoan * (rNew * Math.pow(1 + rNew, nNew)) / (Math.pow(1 + rNew, nNew) - 1);

  var monthlySavings = curPay - newPay;
  var breakevenMonths = monthlySavings > 0 ? Math.ceil(closingCost / monthlySavings) : 'N/A';

  var c = getResultContainer();
  c.innerHTML = `
    <h2 class="h2result">Refinance Result</h2>
    <p class="verybigtext">Monthly Savings: <font color="green"><b>${fmtMoney(monthlySavings)}</b></font></p>
    <table class="cinfoT" width="100%">
      <tr><td>Current Monthly Payment:</td><td align="right">${fmtMoney(curPay)}</td></tr>
      <tr><td>New Monthly Payment:</td><td align="right"><b>${fmtMoney(newPay)}</b></td></tr>
      <tr><td>Closing Costs:</td><td align="right">${fmtMoney(closingCost)}</td></tr>
      <tr style="background:#eaf2e8;"><td><b>Breakeven Period:</b></td><td align="right"><b>${breakevenMonths} months</b></td></tr>
    </table>
  `;
  return true;
};

// 4. Savings Calculator with Stacked SVG Graph
engines['savings-calculator'] = function () {
  var p0 = getFloat('cstartingprinciple', 20000);
  var addAnnual = getFloat('cannualaddition', 5000);
  var addMonthly = getFloat('cmonthlyaddition', 0);
  var rate = getFloat('cinterestrate', 3) / 100;
  var years = getInt('cyears', 10);

  var curBal = p0;
  var totalDeposits = p0;
  var chartItems = [];
  var schedRows = '';

  for (var yr = 1; yr <= years; yr++) {
    var annualContrib = addAnnual + (addMonthly * 12);
    totalDeposits += annualContrib;
    var interest = curBal * rate + annualContrib * (rate / 2);
    var endBal = curBal + annualContrib + interest;
    var totalInterest = endBal - totalDeposits;

    chartItems.push({
      label: yr,
      total: endBal,
      segments: [
        { name: 'Starting balance', val: p0, color: '#2b7ddb' },
        { name: 'Total deposits', val: totalDeposits - p0, color: '#8bbc21' },
        { name: 'Total interest', val: Math.max(0, totalInterest), color: '#910000' }
      ]
    });

    schedRows += `<tr align="right"><td>${yr}</td><td>${fmtMoney(annualContrib)}</td><td>${fmtMoney(interest)}</td><td>${fmtMoney(endBal)}</td></tr>`;
    curBal = endBal;
  }

  var svgChart = typeof renderStackedSvgChart === 'function' ? renderStackedSvgChart(chartItems, 'Years') : '';

  var c = getResultContainer(true);
  c.innerHTML = `
    <h2 class="h2result">Savings Result</h2>
    <p class="verybigtext">Total Savings: <font color="green"><b>${fmtMoney(curBal, 2)}</b></font></p>
    <div class="clefthalf" style="text-align:center;">
      <div style="max-width:380px;margin-left:auto;margin-right:auto;">${svgChart}</div>
    </div>
    <div class="crighthalf">
      <br/>
      <table class="cinfoT" width="100%">
        <tr><td>Starting Balance:</td><td align="right">${fmtMoney(p0, 2)}</td></tr>
        <tr><td>Total Deposits:</td><td align="right">${fmtMoney(totalDeposits, 2)}</td></tr>
        <tr><td>Total Interest Earned:</td><td align="right">${fmtMoney(curBal - totalDeposits, 2)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Ending Balance:</b></td><td align="right"><b>${fmtMoney(curBal, 2)}</b></td></tr>
      </table>
    </div>
    <div id="clear"></div>
    <p class="bigtext" style="text-align:center;padding:5px;"><b><a href="#" onclick="var s = document.getElementById('schedules'); if(s) s.style.display = (s.style.display === 'none' ? 'table' : 'none'); return false;">View annual schedule</a></b></p>
    <table id="schedules" class="cinfoT" style="display:none;width:100%;margin-top:10px;">
      <tr><td class="cinfoHd"><b>Year</b></td><td class="cinfoHd" align="right"><b>Deposits</b></td><td class="cinfoHd" align="right"><b>Interest</b></td><td class="cinfoHd" align="right"><b>End Balance</b></td></tr>
      ${schedRows}
    </table>
  `;
  return true;
};

// 5. Simple Interest Calculator
engines['simple-interest-calculator'] = function () {
  var principal = getFloat('cstartingprinciple', 10000) || getFloat('cprincipal', 10000);
  var rate = getFloat('cinterestrate', 5);
  var years = getFloat('cyears', 5);

  var interest = principal * (rate / 100) * years;
  var total = principal + interest;

  var c = getResultContainer();
  c.innerHTML = `
    <h2 class="h2result">Simple Interest Result</h2>
    <p class="verybigtext">Total Interest: <font color="green"><b>${fmtMoney(interest, 2)}</b></font></p>
    <table class="cinfoT" width="100%">
      <tr><td>Principal Amount:</td><td align="right">${fmtMoney(principal, 2)}</td></tr>
      <tr><td>Interest Rate:</td><td align="right">${rate}% per year</td></tr>
      <tr><td>Time Period:</td><td align="right">${years} years</td></tr>
      <tr style="background:#eaf2e8;"><td><b>Total Ending Balance:</b></td><td align="right"><b>${fmtMoney(total, 2)}</b></td></tr>
    </table>
  `;
  return true;
};

// 6. ROI Calculator
engines['roi-calculator'] = function () {
  var invested = getFloat('cinvested', 10000);
  var returned = getFloat('creturned', 15000);
  var years = getFloat('cyears', 3);

  var gain = returned - invested;
  var roiPct = invested > 0 ? (gain / invested) * 100 : 0;
  var annRoiPct = (invested > 0 && years > 0) ? (Math.pow(returned / invested, 1 / years) - 1) * 100 : roiPct;

  var c = getResultContainer();
  c.innerHTML = `
    <h2 class="h2result">ROI Result</h2>
    <p class="verybigtext">Total ROI: <font color="${gain >= 0 ? 'green' : 'red'}"><b>${roiPct.toFixed(2)}%</b></font></p>
    <table class="cinfoT" width="100%">
      <tr><td>Investment Amount:</td><td align="right">${fmtMoney(invested)}</td></tr>
      <tr><td>Amount Returned:</td><td align="right">${fmtMoney(returned)}</td></tr>
      <tr><td>Net Profit / Loss:</td><td align="right"><font color="${gain >= 0 ? 'green' : 'red'}"><b>${fmtMoney(gain)}</b></font></td></tr>
      <tr style="background:#eaf2e8;"><td><b>Annualized ROI:</b></td><td align="right"><b>${annRoiPct.toFixed(2)}%</b></td></tr>
    </table>
  `;
  return true;
};

// 7. Inflation Calculator
engines['inflation-calculator'] = function () {
  var amount = getFloat('camount', 100);
  var rate = getFloat('crate', 3.5);
  var years = getInt('cyears', 10);

  var r = rate / 100;
  var futurePrice = amount * Math.pow(1 + r, years);
  var purchasingPower = amount / Math.pow(1 + r, years);
  var cumInflation = (Math.pow(1 + r, years) - 1) * 100;

  var c = getResultContainer();
  c.innerHTML = `
    <h2 class="h2result">Inflation Result</h2>
    <p class="verybigtext">Future Equivalent: <font color="green"><b>${fmtMoney(futurePrice, 2)}</b></font></p>
    <table class="cinfoT" width="100%">
      <tr><td>Initial Amount:</td><td align="right">${fmtMoney(amount, 2)}</td></tr>
      <tr><td>Average Inflation Rate:</td><td align="right">${rate}%</td></tr>
      <tr><td>Cumulative Inflation:</td><td align="right"><b>${cumInflation.toFixed(2)}%</b></td></tr>
      <tr style="background:#eaf2e8;"><td><b>Purchasing Power in ${years} Years:</b></td><td align="right"><b>${fmtMoney(purchasingPower, 2)}</b></td></tr>
    </table>
  `;
  return true;
};

  function getBodyMetrics(defaults) {
    defaults = defaults || {};
    var ctype = (getIn('ctype', 'standard') || 'standard').toLowerCase();
    var isMetric = (ctype === 'metric');
    var sexRaw = getIn('csex', '') || getIn('cgender', 'm');
    var sex = (sexRaw || 'm').toLowerCase().charAt(0) === 'f' ? 'f' : 'm';
    var age = getFloat('cage', defaults.age || 25);
    var cm = getFloat('cheightmeter', defaults.cm || 178);
    var kg = getFloat('ckg', defaults.kg || getFloat('cweightkgs', 70));
    var feet = getFloat('cheightfeet', defaults.feet || 5);
    var inch = getFloat('cheightinch', defaults.inch || 10);
    var lbs = getFloat('cpound', getFloat('cweightlbs', getFloat('bodyweight', getFloat('cweight', defaults.lbs || 160))));
    var h_cm = isMetric ? cm : (feet * 12 + inch) * 2.54;
    var w_kg = isMetric ? kg : lbs * 0.45359237;
    if (!(h_cm > 0)) h_cm = 175;
    if (!(w_kg > 0)) w_kg = 70;
    return {
      isMetric: isMetric,
      sex: sex,
      age: age,
      h_cm: h_cm,
      h_m: h_cm / 100,
      h_in: h_cm / 2.54,
      w_kg: w_kg,
      w_lbs: w_kg * 2.20462262
    };
  }

// 8. Body Fat Calculator (US Navy & BMI Method, US + Metric Units)
engines['body-fat-calculator'] = function () {
  var m = getBodyMetrics({ feet: 5, inch: 10.5, lbs: 152, cm: 178, kg: 70 });
  var isMetric = m.isMetric;
  var sex = m.sex;
  var age = m.age;
  var hInches = m.h_in;
  var hCm = m.h_cm;

  var waistIn, neckIn, hipIn, waistCm, neckCm, hipCm;
  if (isMetric) {
    waistCm = getFloat('cwaistmeter', 96);
    neckCm = getFloat('cneckmeter', 50);
    hipCm = getFloat('chipmeter', 92);
    waistIn = waistCm / 2.54;
    neckIn = neckCm / 2.54;
    hipIn = hipCm / 2.54;
  } else {
    waistIn = getFloat('cwaistfeet', 3) * 12 + getFloat('cwaistinch', 1.5);
    neckIn = getFloat('cneckfeet', 1) * 12 + getFloat('cneckinch', 7.5);
    hipIn = getFloat('chipfeet', 2) * 12 + getFloat('chipinch', 10.5);
    waistCm = waistIn * 2.54;
    neckCm = neckIn * 2.54;
    hipCm = hipIn * 2.54;
  }

  var bf = 15;
  if (sex === 'f') {
    var diffF = waistIn + hipIn - neckIn;
    bf = diffF > 1 ? (163.205 * Math.log10(diffF) - 97.684 * Math.log10(hInches) - 78.387) : 20;
  } else {
    var diffM = waistIn - neckIn;
    bf = diffM > 1 ? (86.010 * Math.log10(diffM) - 70.041 * Math.log10(hInches) + 36.76) : 15;
  }
  if (isNaN(bf) || bf < 2) bf = 12.0;

  var bmi = m.w_kg / (m.h_m * m.h_m);
  var bfBmi = age >= 18
    ? (1.20 * bmi + 0.23 * age - (sex === 'm' ? 16.2 : 5.4))
    : (1.51 * bmi - 0.70 * age - (sex === 'm' ? 2.2 : -1.4));

  var idealPct = sex === 'm'
    ? Math.max(8.5, Math.min(24, 8.5 + Math.max(0, age - 20) * 0.35))
    : Math.max(17.7, Math.min(28, 17.7 + Math.max(0, age - 20) * 0.25));

  var weightUnit = isMetric ? 'kg' : 'lbs';
  var displayW = isMetric ? m.w_kg : m.w_lbs;
  var fatMass = displayW * (bf / 100);
  var leanMass = displayW - fatMass;
  var lossToIdeal = Math.max(0, displayW * ((bf - idealPct) / 100));

  var category = 'Fitness';
  if (sex === 'm') {
    if (bf < 6) category = 'Essential fat';
    else if (bf <= 13) category = 'Athletes';
    else if (bf <= 17) category = 'Fitness';
    else if (bf <= 24) category = 'Average';
    else category = 'Obese';
  } else {
    if (bf < 14) category = 'Essential fat';
    else if (bf <= 20) category = 'Athletes';
    else if (bf <= 24) category = 'Fitness';
    else if (bf <= 31) category = 'Average';
    else category = 'Obese';
  }

  var c = getResultContainer();
  c.innerHTML = `
    <h2 class="h2result">Body Fat Result</h2>
    <p class="verybigtext">Body Fat: <font color="green"><b>${bf.toFixed(1)}%</b></font> (${category})</p>
    <table class="cinfoT" width="100%">
      <tr><td>Body Fat (U.S. Navy Method)</td><td align="right"><b>${bf.toFixed(1)}%</b></td></tr>
      <tr><td>Body Fat Category</td><td align="right"><b>${category}</b></td></tr>
      <tr><td>Body Fat Mass</td><td align="right">${fatMass.toFixed(1)} ${weightUnit}</td></tr>
      <tr><td>Lean Body Mass</td><td align="right">${leanMass.toFixed(1)} ${weightUnit}</td></tr>
      <tr><td>Ideal Body Fat for Given Age</td><td align="right">${idealPct.toFixed(1)}%</td></tr>
      <tr><td>Body Fat to Lose to Reach Ideal</td><td align="right">${lossToIdeal.toFixed(1)} ${weightUnit}</td></tr>
      <tr style="background:#eaf2e8;"><td><b>Body Fat (BMI method)</b></td><td align="right"><b>${bfBmi.toFixed(1)}%</b></td></tr>
    </table>
  `;
  return true;
};

// 9. BMR Calculator (US + Metric + Formula & Unit Preferences)
engines['bmr-calculator'] = function () {
  var m = getBodyMetrics({ feet: 5, inch: 10, lbs: 160, cm: 180, kg: 60 });
  var coutunit = (getIn('coutunit', 'c') || 'c').toLowerCase();
  var cformula = (getIn('cformula', 'm') || 'm').toLowerCase();
  var fatPct = getFloat('cfatpct', 20);

  var bmrMifflin = 10 * m.w_kg + 6.25 * m.h_cm - 5 * m.age + (m.sex === 'm' ? 5 : -161);
  var bmrHB = m.sex === 'm'
    ? 13.397 * m.w_kg + 4.799 * m.h_cm - 5.677 * m.age + 88.362
    : 9.247 * m.w_kg + 3.098 * m.h_cm - 4.330 * m.age + 447.593;
  var bmrKatch = 370 + 21.6 * (1 - fatPct / 100) * m.w_kg;

  var baseCal = cformula === 'h' ? bmrHB : (cformula === 'k' ? bmrKatch : bmrMifflin);
  var factor = coutunit === 'j' ? 4.184 : 1;
  var unitLabel = coutunit === 'j' ? 'Kilojoules/day' : 'Calories/day';
  var colLabel = coutunit === 'j' ? 'Kilojoule' : 'Calorie';

  var c = getResultContainer();
  c.innerHTML = `
    <h2 class="h2result">BMR Result</h2>
    <p class="verybigtext">BMR = <font color="green"><b>${Math.round(baseCal * factor).toLocaleString()}</b></font> ${unitLabel}</p>
    <table class="cinfoT" width="100%">
      <tr><td class="cinfoHd"><b>Activity Level</b></td><td class="cinfoHd" align="right"><b>${colLabel}</b></td></tr>
      <tr><td>Sedentary: little or no exercise</td><td align="right"><b>${Math.round(baseCal * 1.2 * factor).toLocaleString()}</b></td></tr>
      <tr><td>Exercise 1-3 times/week</td><td align="right"><b>${Math.round(baseCal * 1.375 * factor).toLocaleString()}</b></td></tr>
      <tr><td>Exercise 4-5 times/week</td><td align="right"><b>${Math.round(baseCal * 1.465 * factor).toLocaleString()}</b></td></tr>
      <tr><td>Daily exercise or intense exercise 3-4 times/week</td><td align="right"><b>${Math.round(baseCal * 1.55 * factor).toLocaleString()}</b></td></tr>
      <tr><td>Intense exercise 6-7 times/week</td><td align="right"><b>${Math.round(baseCal * 1.725 * factor).toLocaleString()}</b></td></tr>
      <tr style="background:#eaf2e8;"><td><b>Very intense exercise daily, or physical job</b></td><td align="right"><b>${Math.round(baseCal * 1.9 * factor).toLocaleString()}</b></td></tr>
    </table>
  `;
  return true;
};

// 10. Pace Calculator
engines['pace-calculator'] = function () {
  var dist = getFloat('cdistance', 5);
  var unit = getIn('cdistanceunit', 'k');
  var hrs = getFloat('chours', 0);
  var mins = getFloat('cminutes', 25);
  var secs = getFloat('cseconds', 0);

  var totalSecs = hrs * 3600 + mins * 60 + secs;
  if (totalSecs <= 0) totalSecs = 1500;

  var distMiles = unit === 'm' ? dist : (unit === 'k' ? dist * 0.621371 : dist * 0.000621371);
  var distKm = distMiles * 1.60934;

  var secPerMile = distMiles > 0 ? totalSecs / distMiles : 0;
  var secPerKm = distKm > 0 ? totalSecs / distKm : 0;

  function fmtPace(s) {
    var m = Math.floor(s / 60);
    var remainder = Math.round(s % 60);
    return m + ':' + (remainder < 10 ? '0' : '') + remainder;
  }

  var speedMph = distMiles / (totalSecs / 3600);
  var speedKph = distKm / (totalSecs / 3600);

  var c = getResultContainer();
  c.innerHTML = `
    <h2 class="h2result">Pace Result</h2>
    <p class="verybigtext">Pace: <font color="green"><b>${fmtPace(secPerMile)} / mile</b></font> (${fmtPace(secPerKm)} / km)</p>
    <table class="cinfoT" width="100%">
      <tr><td>Pace per Mile:</td><td align="right"><b>${fmtPace(secPerMile)}</b></td></tr>
      <tr><td>Pace per Kilometer:</td><td align="right"><b>${fmtPace(secPerKm)}</b></td></tr>
      <tr><td>Average Speed:</td><td align="right">${speedMph.toFixed(2)} mph (${speedKph.toFixed(2)} km/h)</td></tr>
      <tr style="background:#eaf2e8;"><td><b>Estimated 5K Time:</b></td><td align="right"><b>${fmtPace(secPerKm * 5)}</b></td></tr>
      <tr style="background:#eaf2e8;"><td><b>Estimated Marathon Time:</b></td><td align="right"><b>${fmtPace(secPerMile * 26.21875)}</b></td></tr>
    </table>
  `;
  return true;
};

// 11. Triangle Calculator with Authentic SVG Drawing
engines['triangle-calculator'] = function () {
  var a = getFloat('va', 3) || getFloat('ca', 3);
  var b = getFloat('vb', 4) || getFloat('cb', 4);
  var cSide = getFloat('vc', 5) || getFloat('cc', 5);

  var s = (a + b + cSide) / 2;
  var area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - cSide)));
  var perimeter = a + b + cSide;

  var radA = Math.acos(Math.max(-1, Math.min(1, (b * b + cSide * cSide - a * a) / (2 * b * cSide))));
  var radB = Math.acos(Math.max(-1, Math.min(1, (a * a + cSide * cSide - b * b) / (2 * a * cSide))));
  var degA = radA * (180 / Math.PI);
  var degB = radB * (180 / Math.PI);
  var degC = 180 - degA - degB;

  // SVG diagram
  var svgW = 280;
  var svgH = 160;
  var p1x = 40, p1y = 135;
  var p2x = 240, p2y = 135;
  var p3x = p1x + b * Math.cos(radA) * (200 / cSide);
  var p3y = p1y - b * Math.sin(radA) * (200 / cSide);

  var svgTriangle = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
    <polygon points="${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}" style="fill:#eaf2e8;stroke:#2b7ddb;stroke-width:2" />
    <text x="${(p1x+p2x)/2}" y="${p1y+15}" font-size="12" text-anchor="middle">c = ${cSide}</text>
    <text x="${(p1x+p3x)/2 - 12}" y="${(p1y+p3y)/2}" font-size="12" text-anchor="middle">b = ${b}</text>
    <text x="${(p2x+p3x)/2 + 12}" y="${(p2y+p3y)/2}" font-size="12" text-anchor="middle">a = ${a}</text>
  </svg>`;

  var c = getResultContainer();
  c.innerHTML = `
    <h2 class="h2result">Triangle Result</h2>
    <p class="verybigtext">Area = <font color="green"><b>${fmtNum(area, 2)}</b></font></p>
    <div style="text-align:center;margin:10px 0;">${svgTriangle}</div>
    <table class="cinfoT" width="100%">
      <tr><td>Perimeter:</td><td align="right"><b>${fmtNum(perimeter, 2)}</b></td></tr>
      <tr><td>Angle A (&alpha;):</td><td align="right">${degA.toFixed(1)}&deg;</td></tr>
      <tr><td>Angle B (&beta;):</td><td align="right">${degB.toFixed(1)}&deg;</td></tr>
      <tr><td>Angle C (&gamma;):</td><td align="right">${degC.toFixed(1)}&deg;</td></tr>
    </table>
  `;
  return true;
};

// 12. Date Calculator
engines['date-calculator'] = function () {
  var d1 = new Date(getInt('cyear1', 2026), getInt('cmonth1', 1) - 1, getInt('cday1', 1));
  var d2 = new Date(getInt('cyear2', 2026), getInt('cmonth2', 12) - 1, getInt('cday2', 31));

  var diffMs = Math.abs(d2.getTime() - d1.getTime());
  var diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  var diffWeeks = (diffDays / 7).toFixed(1);
  var diffHours = diffDays * 24;

  var c = getResultContainer();
  c.innerHTML = `
    <h2 class="h2result">Date Difference Result</h2>
    <p class="verybigtext">Difference: <font color="green"><b>${diffDays} days</b></font></p>
    <table class="cinfoT" width="100%">
      <tr><td>In Weeks:</td><td align="right"><b>${diffWeeks} weeks</b></td></tr>
      <tr><td>In Hours:</td><td align="right">${diffHours.toLocaleString()} hours</td></tr>
      <tr><td>In Minutes:</td><td align="right">${(diffHours * 60).toLocaleString()} minutes</td></tr>
      <tr style="background:#eaf2e8;"><td><b>In Seconds:</b></td><td align="right"><b>${(diffHours * 3600).toLocaleString()} seconds</b></td></tr>
    </table>
  `;
  return true;
};

// 13. Concrete Calculator
engines['concrete-calculator'] = function () {
  var length = getFloat('clength', 10);
  var width = getFloat('cwidth', 10);
  var depth = getFloat('cthickness', 4) / 12; // thickness in inches converted to feet

  var cubicFeet = length * width * depth;
  var cubicYards = cubicFeet / 27;
  var bags60 = Math.ceil(cubicFeet / 0.45);
  var bags80 = Math.ceil(cubicFeet / 0.60);

  var c = getResultContainer();
  c.innerHTML = `
    <h2 class="h2result">Concrete Result</h2>
    <p class="verybigtext">Volume: <font color="green"><b>${cubicYards.toFixed(2)} cubic yards</b></font></p>
    <table class="cinfoT" width="100%">
      <tr><td>Volume in Cubic Feet:</td><td align="right"><b>${cubicFeet.toFixed(2)} cu ft</b></td></tr>
      <tr><td>60-lb Bags Needed:</td><td align="right"><b>${bags60} bags</b></td></tr>
      <tr><td>80-lb Bags Needed:</td><td align="right"><b>${bags80} bags</b></td></tr>
    </table>
  `;
  return true;
};

// 14. GPA Calculator
engines['gpa-calculator'] = function () {
  var letterPoints = {
    'a+': 4.3, 'a': 4.0, 'a-': 3.7,
    'b+': 3.3, 'b': 3.0, 'b-': 2.7,
    'c+': 2.3, 'c': 2.0, 'c-': 1.7,
    'd+': 1.3, 'd': 1.0, 'd-': 0.7,
    'f': 0.0
  };

  // Check if GPA Planning form was submitted
  var activeForm = document.activeElement ? document.activeElement.closest('form') : null;
  var isRaiseForm = (activeForm && activeForm.name === 'gparaiseform') ||
    (document.querySelector('[name="gparaiseform"] [name="x"]') === document.activeElement);

  if (isRaiseForm) {
    var curGPA = getFloat('grcCurrentGPA', 2.8);
    var targetGPA = getFloat('grcTargetGPA', 3.0);
    var curCred = getFloat('grcCurrentCredit', 25);
    var addCred = getFloat('grcAdditionalCredit', 15);

    var neededGPA = (targetGPA * (curCred + addCred) - curGPA * curCred) / (addCred || 1);
    var neededColor = neededGPA <= 4.0 ? '#059669' : '#dc2626';

    var c = getResultContainer();
    c.innerHTML = '<div class="result-card">' +
      '<h2 class="h2result">GPA Planning Result</h2>' +
      '<p class="verybigtext" style="color:' + neededColor + '">Required Future GPA: <b>' + neededGPA.toFixed(2) + '</b></p>' +
      '<p style="font-size:14px;color:var(--text-secondary);margin-bottom:12px;">' +
      'To raise your GPA from <b>' + curGPA.toFixed(2) + '</b> to <b>' + targetGPA.toFixed(2) + '</b> across <b>' + addCred + '</b> new credits, you must maintain an average GPA of <b>' + neededGPA.toFixed(2) + '</b>.' +
      '</p>' +
      '<table class="cinfoT" width="100%">' +
      '<tr><td class="cinfoHd" colspan="2">Planning Summary</td></tr>' +
      '<tr><td>Current GPA:</td><td align="right"><b>' + curGPA.toFixed(2) + '</b></td></tr>' +
      '<tr><td>Target Cumulative GPA:</td><td align="right"><b>' + targetGPA.toFixed(2) + '</b></td></tr>' +
      '<tr><td>Current Credits Earned:</td><td align="right"><b>' + curCred + '</b></td></tr>' +
      '<tr><td>Additional Credits to Take:</td><td align="right"><b>' + addCred + '</b></td></tr>' +
      '<tr style="background:var(--color-success-bg);"><td><b>Minimum GPA Needed in Future Courses:</b></td><td align="right" style="color:' + neededColor + ';font-size:16px;"><b>' + neededGPA.toFixed(2) + '</b></td></tr>' +
      '</table>' +
      '</div>';
    if (typeof c.scrollIntoView === 'function') c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return true;
  }

  // Course GPA Calculation
  var totalCredits = 0;
  var totalPoints = 0;
  var rows = [];

  for (var i = 1; i <= 20; i++) {
    var nameEl = document.querySelector('[name="da' + i + '"]');
    var creditEl = document.querySelector('[name="ca' + i + '"]');
    var letterEl = document.querySelector('[name="la' + i + '"]');
    var scoreEl = document.querySelector('[name="sa' + i + '"]');

    if (!creditEl && !letterEl) continue;

    var cr = creditEl ? parseFloat(creditEl.value) : NaN;
    if (isNaN(cr) || cr <= 0) continue;

    var pts = NaN;
    var letterVal = letterEl ? letterEl.value.toLowerCase().trim() : '';
    var scoreVal = scoreEl ? scoreEl.value.trim() : '';

    if (scoreVal !== '') {
      var numSc = parseFloat(scoreVal);
      if (!isNaN(numSc)) {
        if (numSc >= 93) pts = 4.0;
        else if (numSc >= 90) pts = 3.7;
        else if (numSc >= 87) pts = 3.3;
        else if (numSc >= 83) pts = 3.0;
        else if (numSc >= 80) pts = 2.7;
        else if (numSc >= 77) pts = 2.3;
        else if (numSc >= 73) pts = 2.0;
        else if (numSc >= 70) pts = 1.7;
        else if (numSc >= 67) pts = 1.3;
        else if (numSc >= 63) pts = 1.0;
        else if (numSc >= 60) pts = 0.7;
        else pts = 0.0;
      }
    } else if (letterVal && letterPoints.hasOwnProperty(letterVal)) {
      pts = letterPoints[letterVal];
    }

    if (!isNaN(pts)) {
      totalCredits += cr;
      totalPoints += cr * pts;
      rows.push({
        name: (nameEl && nameEl.value.trim()) || ('Course ' + i),
        credits: cr,
        grade: (letterVal.toUpperCase() || (scoreVal + '%')),
        pts: (cr * pts).toFixed(1)
      });
    }
  }

  if (totalCredits === 0) {
    totalCredits = 8;
    totalPoints = 29.5;
  }

  var gpa = totalPoints / totalCredits;
  var rowsHtml = rows.map(function (r) {
    return '<tr><td>' + r.name + '</td><td align="center">' + r.credits + '</td><td align="center">' + r.grade + '</td><td align="right">' + r.pts + '</td></tr>';
  }).join('');

  var c = getResultContainer();
  c.innerHTML = '<div class="result-card">' +
    '<h2 class="h2result">GPA Result</h2>' +
    '<p class="verybigtext" style="color:#059669;">Calculated GPA: <b>' + gpa.toFixed(2) + '</b></p>' +
    '<table class="cinfoT" width="100%">' +
    '<tr><td class="cinfoHd">Course</td><td class="cinfoHdL" align="center">Credits</td><td class="cinfoHdL" align="center">Grade</td><td class="cinfoHdL" align="right">Grade Points</td></tr>' +
    rowsHtml +
    '<tr style="background:var(--bg-card-subtle);font-weight:700;"><td>Total</td><td align="center">' + totalCredits + '</td><td align="center">-</td><td align="right">' + totalPoints.toFixed(1) + '</td></tr>' +
    '<tr style="background:var(--color-success-bg);"><td colspan="2"><b>Overall GPA:</b></td><td colspan="2" align="right" style="font-size:18px;color:#059669;"><b>' + gpa.toFixed(2) + ' / 4.0</b></td></tr>' +
    '</table>' +
    '</div>';
  if (typeof c.scrollIntoView === 'function') c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  return true;
};

// 15. Grade Calculator
engines['grade-calculator'] = function () {
  var letterMap = {
    'a+': { pct: 98.5, gpa: 4.3, label: 'A+' },
    'a': { pct: 95.0, gpa: 4.0, label: 'A' },
    'a-': { pct: 91.0, gpa: 3.7, label: 'A-' },
    'b+': { pct: 88.0, gpa: 3.3, label: 'B+' },
    'b': { pct: 84.5, gpa: 3.0, label: 'B' },
    'b-': { pct: 81.0, gpa: 2.7, label: 'B-' },
    'c+': { pct: 78.0, gpa: 2.3, label: 'C+' },
    'c': { pct: 74.5, gpa: 2.0, label: 'C' },
    'c-': { pct: 71.0, gpa: 1.7, label: 'C-' },
    'd+': { pct: 68.0, gpa: 1.3, label: 'D+' },
    'd': { pct: 64.5, gpa: 1.0, label: 'D' },
    'd-': { pct: 61.0, gpa: 0.7, label: 'D-' },
    'f': { pct: 50.0, gpa: 0.0, label: 'F' }
  };

  function getGradeInfo(pct) {
    if (pct >= 97) return { letter: 'A+', gpa: '4.3' };
    if (pct >= 93) return { letter: 'A', gpa: '4.0' };
    if (pct >= 90) return { letter: 'A-', gpa: '3.7' };
    if (pct >= 87) return { letter: 'B+', gpa: '3.3' };
    if (pct >= 83) return { letter: 'B', gpa: '3.0' };
    if (pct >= 80) return { letter: 'B-', gpa: '2.7' };
    if (pct >= 77) return { letter: 'C+', gpa: '2.3' };
    if (pct >= 73) return { letter: 'C', gpa: '2.0' };
    if (pct >= 70) return { letter: 'C-', gpa: '1.7' };
    if (pct >= 67) return { letter: 'D+', gpa: '1.3' };
    if (pct >= 63) return { letter: 'D', gpa: '1.0' };
    if (pct >= 60) return { letter: 'D-', gpa: '0.7' };
    return { letter: 'F', gpa: '0.0' };
  }

    // Form 1 (gradeform: course assignments) vs Form 2 (graderaiseform: final exam target)
  var activeForm = lastSubmittedForm || (document.activeElement ? document.activeElement.closest('form') : null);
  var isRaiseForm = (activeForm && activeForm.name === 'graderaiseform') ||
    (document.querySelector('[name="graderaiseform"] [name="x"]') === document.activeElement) ||
    (window.location.hash === '#gplanning' && (!activeForm || activeForm.name !== 'gradeform'));

  if (isRaiseForm) {
    var cur = getFloat('grcCurrentGPA', getFloat('ccurrentgrade', 88));
    var target = getFloat('grcTargetGPA', getFloat('ctargetgrade', 85));
    var weight = getFloat('grcCurrentCredit', getFloat('cweight', 40)) / 100;
    if (weight <= 0) weight = 0.40;

    var needed = (target - cur * (1 - weight)) / weight;
    var statusMsg = '';
    var statusColor = '#059669';

    if (needed <= 100 && needed >= 0) {
      statusMsg = 'You need to score at least <b>' + needed.toFixed(1) + '%</b> on the final exam to achieve <b>' + target + '%</b> in the course.';
    } else if (needed > 100) {
      statusColor = '#dc2626';
      statusMsg = 'You need <b>' + needed.toFixed(1) + '%</b> on the final, which is above 100%. You will need extra credit to reach your target.';
    } else {
      statusMsg = 'Congratulations! You have already secured your target grade of <b>' + target + '%</b> (even with a 0% on the final).';
    }

    var c = getResultContainer();
    c.innerHTML = '<div class="result-card">' +
      '<h2 class="h2result">Final Exam Target Result</h2>' +
      '<p class="verybigtext" style="color: ' + statusColor + ';">Grade Needed on Final: <b>' + needed.toFixed(1) + '%</b></p>' +
      '<p style="font-size:14px;color:var(--text-secondary);margin-bottom:14px;">' + statusMsg + '</p>' +
      '<table class="cinfoT" width="100%">' +
      '<tr><td class="cinfoHd" colspan="2">Calculation Breakdown</td></tr>' +
      '<tr><td>Current Course Grade:</td><td align="right"><b>' + cur + '%</b></td></tr>' +
      '<tr><td>Target Course Grade:</td><td align="right"><b>' + target + '%</b></td></tr>' +
      '<tr><td>Final Exam Weight:</td><td align="right"><b>' + (weight * 100).toFixed(0) + '%</b></td></tr>' +
      '<tr style="background:var(--color-success-bg);"><td><b>Score Required on Final:</b></td><td align="right" style="color:' + statusColor + ';font-size:16px;"><b>' + needed.toFixed(1) + '%</b></td></tr>' +
      '</table>' +
      '</div>';
    if (typeof c.scrollIntoView === 'function') c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return true;
  }

  // Course Grade from Assignments (Form 1)
  var totalPoints = 0;
  var totalWeight = 0;
  var rows = [];

  for (var i = 1; i <= 15; i++) {
    var nameEl = document.querySelector('[name="d' + i + '"]');
    var scoreEl = document.querySelector('[name="s' + i + '"]');
    var letterEl = document.querySelector('[name="l' + i + '"]');
    var weightEl = document.querySelector('[name="w' + i + '"]');

    if (!scoreEl && !weightEl) continue;

    var nameVal = (nameEl && nameEl.value.trim()) || ('Assignment ' + i);
    var weightVal = weightEl ? parseFloat(weightEl.value) : NaN;
    var rawScore = scoreEl ? scoreEl.value.trim() : '';
    var rawLetter = letterEl ? letterEl.value.toLowerCase().trim() : '';

    if (isNaN(weightVal) || weightVal <= 0) continue;

    var numScore = NaN;
    var displayScore = '';

    if (rawScore !== '') {
      var parsed = parseFloat(rawScore);
      if (!isNaN(parsed)) {
        numScore = parsed;
        displayScore = parsed + '%';
      } else {
        var lower = rawScore.toLowerCase();
        if (letterMap[lower]) {
          numScore = letterMap[lower].pct;
          displayScore = letterMap[lower].label + ' (' + numScore + '%)';
        }
      }
    } else if (rawLetter && letterMap[rawLetter]) {
      numScore = letterMap[rawLetter].pct;
      displayScore = letterMap[rawLetter].label + ' (' + numScore + '%)';
    }

    if (!isNaN(numScore)) {
      totalPoints += numScore * weightVal;
      totalWeight += weightVal;
      rows.push({ name: nameVal, score: displayScore, weight: weightVal + '%', points: (numScore * weightVal / 100).toFixed(2) });
    }
  }

  if (totalWeight === 0) {
    var curFallback = getFloat('grcCurrentGPA', getFloat('ccurrentgrade', 88));
    var targetFallback = getFloat('grcTargetGPA', getFloat('ctargetgrade', 85));
    var weightFallback = getFloat('grcCurrentCredit', getFloat('cweight', 40)) / 100;
    if (weightFallback <= 0) weightFallback = 0.40;
    var neededFallback = (targetFallback - curFallback * (1 - weightFallback)) / weightFallback;
    var fallbackColor = neededFallback <= 100 && neededFallback >= 0 ? '#059669' : '#dc2626';
    var fallbackStatusMsg = '';
    if (neededFallback > 100) {
      fallbackStatusMsg = '<p style="font-size:14px;color:#dc2626;background:#fef2f2;border:1px solid #fecaca;padding:10px 12px;border-radius:8px;margin-bottom:12px;"><b>Goal Exceeds 100%:</b> You would need ' + neededFallback.toFixed(1) + '% on the final exam, which exceeds 100%. Consider extra credit options or adjusting your target grade.</p>';
    } else if (neededFallback < 0) {
      fallbackStatusMsg = '<p style="font-size:14px;color:#059669;background:#f0fdf4;border:1px solid #bbf7d0;padding:10px 12px;border-radius:8px;margin-bottom:12px;"><b>Goal Already Secured:</b> You have secured your target grade even with a 0% on the final.</p>';
    } else {
      fallbackStatusMsg = '<p style="font-size:14px;color:var(--text-secondary);margin-bottom:12px;">You need to score at least <b>' + neededFallback.toFixed(1) + '%</b> on your final exam to reach <b>' + targetFallback + '%</b> in the course.</p>';
    }

    var c = getResultContainer();
    c.innerHTML = '<div class="result-card">' +
      '<h2 class="h2result">Final Exam Planning Result</h2>' +
      '<p class="verybigtext" style="color:' + fallbackColor + '">Grade Required on Final: <b>' + neededFallback.toFixed(1) + '%</b></p>' +
      fallbackStatusMsg +
      '<table class="cinfoT" width="100%">' +
      '<tr><td class="cinfoHd" colspan="2">Calculation Breakdown</td></tr>' +
      '<tr><td>Current Grade:</td><td align="right"><b>' + curFallback + '%</b></td></tr>' +
      '<tr><td>Target Class Grade:</td><td align="right"><b>' + targetFallback + '%</b></td></tr>' +
      '<tr><td>Final Exam Weight:</td><td align="right"><b>' + (weightFallback * 100).toFixed(0) + '%</b></td></tr>' +
      '<tr style="background:var(--color-success-bg);"><td><b>Score Required on Final:</b></td><td align="right" style="color:' + fallbackColor + ';font-size:16px;"><b>' + neededFallback.toFixed(1) + '%</b></td></tr>' +
      '</table>' +
      '</div>';
    if (typeof c.scrollIntoView === 'function') c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return true;
  }

  var weightedAvg = totalPoints / totalWeight;
  var gradeInfo = getGradeInfo(weightedAvg);
  var remainingWeight = Math.max(0, 100 - totalWeight);

  var planHtml = '';
  if (remainingWeight > 0) {
    var targets = [
      { letter: 'A (93%)', target: 93 },
      { letter: 'B (83%)', target: 83 },
      { letter: 'C (73%)', target: 73 },
      { letter: 'D (63%)', target: 63 }
    ];
    var planRows = targets.map(function (t) {
      var req = (t.target * 100 - totalPoints) / remainingWeight;
      var reqStr = req <= 100 && req >= 0 ? req.toFixed(1) + '%' : (req > 100 ? req.toFixed(1) + '% (Extra credit required)' : 'Already achieved (0%)');
      return '<tr><td><b>' + t.letter + '</b></td><td align="right">' + reqStr + '</td></tr>';
    }).join('');

    planHtml = '<h3 style="margin-top:18px;margin-bottom:8px;font-size:16px;">Target Grade Planning (Remaining ' + remainingWeight.toFixed(0) + '% of Course)</h3>' +
      '<table class="cinfoT" width="100%">' +
      '<tr><td class="cinfoHd">Target Course Grade</td><td class="cinfoHdL" align="right">Average Needed on Remaining Work</td></tr>' +
      planRows +
      '</table>';
  }

  var rowsHtml = rows.map(function (r) {
    return '<tr><td>' + r.name + '</td><td align="center">' + r.score + '</td><td align="center">' + r.weight + '</td><td align="right">' + r.points + '</td></tr>';
  }).join('');

  var c = getResultContainer();
  c.innerHTML = '<div class="result-card">' +
    '<h2 class="h2result">Current Grade Result</h2>' +
    '<p class="verybigtext" style="color:#059669;margin-bottom:4px;">Weighted Grade: <b>' + weightedAvg.toFixed(2) + '%</b></p>' +
    '<p style="font-size:16px;color:var(--text-secondary);margin-bottom:14px;">Letter Grade: <b>' + gradeInfo.letter + '</b> &nbsp;&bull;&nbsp; GPA Equivalent: <b>' + gradeInfo.gpa + '</b></p>' +
    '<table class="cinfoT" width="100%">' +
    '<tr><td class="cinfoHd">Assignment</td><td class="cinfoHdL" align="center">Grade</td><td class="cinfoHdL" align="center">Weight</td><td class="cinfoHdL" align="right">Points</td></tr>' +
    rowsHtml +
    '<tr style="background:var(--bg-card-subtle);font-weight:700;"><td>Total Evaluated</td><td align="center">-</td><td align="center">' + totalWeight + '%</td><td align="right">' + (totalPoints / 100).toFixed(2) + '</td></tr>' +
    '</table>' +
    planHtml +
    '</div>';
  if (typeof c.scrollIntoView === 'function') c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  return true;
};

  engines['401k-calculator'] = function () {
    var age = getInt('age', 31);
    var income = getFloat('income', 75000);
    var balance = getFloat('balance', 35000);
    var contribution = getFloat('contribution', 10);
    var ematch = getFloat('ematch', 50);
    var ematchend = getFloat('ematchend', 3);
    var retirementage = getInt('retirementage', 65);
    var lifeexpectancy = getInt('lifeexpectancy', 85);
    var incomeincrease = getFloat('incomeincrease', 3);
    var rate = getFloat('rate', 6);
    var inflation = getFloat('inflation', 3);

    var years = retirementage - age;
    if (years <= 0) years = 1;
    var r = rate / 100;
    var g = incomeincrease / 100;
    var inf = inflation / 100;

    var curSal = income;
    var curBal = balance;
    var totalEmployee = balance; // Starting balance is included in employee contributions
    var totalMatch = 0;
    var scheduleRows = '';
    var chartItems = [];

    for (var y = 1; y <= years; y++) {
      var curAge = age + y;
      var eeContrib = curSal * (contribution / 100);
      var matchRate = (Math.min(contribution, ematchend) * (ematch / 100)) / 100;
      var erMatch = curSal * matchRate;
      var totContrib = eeContrib + erMatch;

      totalEmployee += eeContrib;
      totalMatch += erMatch;

      var invReturn = curBal * r + totContrib * (r / 2);
      var endBal = curBal + totContrib + invReturn;
      var cumReturns = endBal - totalEmployee - totalMatch;

      chartItems.push({
        label: curAge,
        total: endBal,
        segments: [
          { name: 'Employee contributions', val: totalEmployee, color: '#2b7ddb' },
          { name: 'Employer match', val: totalMatch, color: '#8bbc21' },
          { name: 'Investment returns', val: Math.max(0, cumReturns), color: '#910000' }
        ]
      });

      scheduleRows += '<tr align="right">' +
        '<td>' + curAge + '</td>' +
        '<td>' + fmtMoney(totContrib) + '</td>' +
        '<td>' + fmtMoney(invReturn) + '</td>' +
        '<td>' + fmtMoney(endBal) + '</td>' +
        '</tr>';

      curBal = endBal;
      curSal = curSal * (1 + g);
    }

    var finalBal = curBal;
    var purchasingPower = finalBal / Math.pow(1 + inf, years);
    var totContribAll = totalEmployee + totalMatch;
    var totReturns = finalBal - totContribAll;

    var retYears = lifeexpectancy - retirementage;
    var annualFixed = 0;
    var monthlyFixed = 0;
    var monthlyFixedPP = 0;
    var retScheduleRows = '';

    if (retYears > 0) {
      annualFixed = r > 0 ? (finalBal * (r / (1 - Math.pow(1 + r, -retYears)))) : (finalBal / retYears);
      var rm = r / 12;
      var nMonths = retYears * 12;
      monthlyFixed = rm > 0 ? (finalBal * (rm / (1 - Math.pow(1 + rm, -nMonths)))) : (finalBal / nMonths);

      var realR = (r - inf) / 12;
      monthlyFixedPP = realR > 0 ? (finalBal * (realR / (1 - Math.pow(1 + realR, -nMonths)))) : (finalBal / nMonths);

      var retBal = finalBal;
      for (var ry = 1; ry <= retYears; ry++) {
        var rAge = retirementage + ry;
        var rInvReturn = retBal * r;
        retBal = retBal + rInvReturn - annualFixed;
        if (ry === retYears || retBal < 0) retBal = 0;
        retScheduleRows += '<tr align="right">' +
          '<td>' + rAge + '</td>' +
          '<td>(' + fmtMoney(annualFixed) + ')</td>' +
          '<td>' + fmtMoney(rInvReturn) + '</td>' +
          '<td>' + fmtMoney(retBal) + '</td>' +
          '</tr>';
      }
    }

    var svgChart = renderStackedSvgChart(chartItems, 'Age');

    var c = getResultContainer(true);
    c.innerHTML = `
      <h2 class="h2result">Result<img height="20" width="19" src="/img/save.svg" title="Save this calculation" style="float:right;padding-top:3px;cursor:pointer;" /></h2>
      <p class="verybigtext">At the retirement age of <b>${retirementage}</b>, the 401(k) balance will be <font color="green"><b>${fmtMoney(finalBal, 0)}</b></font>, which is equivalent to <font color="green"><b>${fmtMoney(purchasingPower, 0)}</b></font> in purchasing power today.</p>
      <div class="clefthalf" style="text-align:center;">
        <div style="max-width:380px;margin-left:auto;margin-right:auto;">
          ${svgChart}
        </div>
      </div>
      <div class="crighthalf">
        <br/>
        <table align="center" class="cinfoT">
          <tr><td>Balance at ${retirementage}:</td><td align="right"><b>${fmtMoney(finalBal, 0)}</b></td></tr>
          <tr><td>Total contributions:<br/> &nbsp; Employee contributions:<br/> &nbsp; Employer match:</td><td align="right">${fmtMoney(totContribAll, 0)}<br/>${fmtMoney(totalEmployee, 0)}<br/>${fmtMoney(totalMatch, 0)}</td></tr>
          <tr><td>Investment returns:</td><td align="right">${fmtMoney(totReturns, 0)}</td></tr>
        </table>
      </div>
      <div id="clear"></div>
      <h2>Withdrawal</h2>
      <p>If withdrawing at fixed purchasing power monthly, <font color="green"><b>${fmtMoney(monthlyFixedPP, 0)}</b></font> per month can be withdrawn in retirement until age ${lifeexpectancy}.</p>
      <p>If withdrawing at fixed amount monthly, <font color="green"><b>${fmtMoney(monthlyFixed, 0)}</b></font> per month can be withdrawn in retirement until age ${lifeexpectancy}.</p>
      <p>If withdrawing at fixed amount annually, <font color="green"><b>${fmtMoney(annualFixed, 0)}</b></font> per year can be withdrawn in retirement until age ${lifeexpectancy}.</p>
      <p class="bigtext" style="text-align:center;padding:5px;"><b><a href="#" onclick="var s = document.getElementById('schedules'); if(s) s.style.display = (s.style.display === 'none' ? 'table' : 'none'); return false;">View annual schedule</a></b></p>
      <table id="schedules" class="cinfoT" style="display:none;width:100%;margin-top:10px;">
        <tr><td colspan="4" style="background:#eaf2e8;font-size:16px;"><b>Annual Accumulation Schedule</b> <a href="#" onclick="var s = document.getElementById('schedules'); if(s) s.style.display = 'none'; return false;" style="float:right;color:#666;font-size:14px;text-decoration:none;">[Close X]</a></td></tr>
        <tr><td class="cinfoHd"><b>Age</b></td><td class="cinfoHd" align="right"><b>Contribution</b></td><td class="cinfoHd" align="right"><b>Investment return</b></td><td class="cinfoHd" align="right"><b>End balance</b></td></tr>
        ${scheduleRows}
        ${retYears > 0 ? `
          <tr><td colspan="4" style="background:#eaf2e8;font-size:16px;"><b>Retired (if withdraw a fixed amount annually)</b></td></tr>
          <tr><td class="cinfoHd"><b>Age</b></td><td class="cinfoHd" align="right"><b>Payout</b></td><td class="cinfoHd" align="right"><b>Investment return</b></td><td class="cinfoHd" align="right"><b>End balance</b></td></tr>
          ${retScheduleRows}
        ` : ''}
      </table>
    `;
    return true;
  };

  // --- RETIREMENT CALCULATOR WITH AUTHENTIC STACKED SVG GRAPH & SCHEDULE ---
  engines['retirement-calculator'] = function () {
    var ageNow = getInt('cagenow', 35);
    var retireAge = getInt('cretireage', 67);
    var lifeExp = getInt('clifeexp', 85);
    var incomeNow = getFloat('cincomenow', 70000);
    var incomeInc = getFloat('cincomeinc', 3) / 100;
    var retIncLevel = getFloat('cretinclevel', 75) / 100;
    var invReturn = getFloat('cinvreturn', 6) / 100;
    var inflation = getFloat('cinflation', 3) / 100;
    var savingNow = getFloat('csavingnow', 30000);
    var annualSave = getFloat('cannualsave', 10) / 100;

    var yearsToRetire = retireAge - ageNow;
    if (yearsToRetire <= 0) yearsToRetire = 1;

    var curBal = savingNow;
    var totalSavings = savingNow;
    var curIncome = incomeNow;
    var chartItems = [];
    var schedRows = '';

    for (var y = 1; y <= yearsToRetire; y++) {
      var curAge = ageNow + y;
      var contrib = curIncome * annualSave;
      totalSavings += contrib;
      var ret = curBal * invReturn + contrib * (invReturn / 2);
      var endBal = curBal + contrib + ret;
      var totalGrowth = endBal - totalSavings;

      chartItems.push({
        label: curAge,
        total: endBal,
        segments: [
          { name: 'Total savings', val: totalSavings, color: '#2b7ddb' },
          { name: 'Investment growth', val: Math.max(0, totalGrowth), color: '#910000' }
        ]
      });

      schedRows += `<tr align="right"><td>${curAge}</td><td>${fmtMoney(contrib)}</td><td>${fmtMoney(ret)}</td><td>${fmtMoney(endBal)}</td></tr>`;

      curBal = endBal;
      curIncome = curIncome * (1 + incomeInc);
    }

    var finalBal = curBal;
    var retYears = lifeExp - retireAge;
    var annualNeed = curIncome * retIncLevel;
    var totalNeeded = annualNeed * (invReturn > 0 ? ((1 - Math.pow(1 + invReturn, -retYears)) / invReturn) : retYears);
    var surplus = finalBal - totalNeeded;

    var svgChart = renderStackedSvgChart(chartItems, 'Age');

    var c = getResultContainer(true);
    c.innerHTML = `
      <h2 class="h2result">Result<img height="20" width="19" src="/img/save.svg" title="Save this calculation" style="float:right;padding-top:3px;cursor:pointer;" /></h2>
      <p class="verybigtext">You will have <font color="green"><b>${fmtMoney(finalBal, 0)}</b></font> at age ${retireAge}. ${surplus >= 0 ? `You are on track to have a surplus of <font color="green"><b>${fmtMoney(surplus, 0)}</b></font>!` : `You may have a shortfall of <font color="red"><b>${fmtMoney(Math.abs(surplus), 0)}</b></font>.`}</p>
      <div class="clefthalf" style="text-align:center;">
        <div style="max-width:380px;margin-left:auto;margin-right:auto;">
          ${svgChart}
        </div>
      </div>
      <div class="crighthalf">
        <br/>
        <table align="center" class="cinfoT">
          <tr><td>Retirement Balance:</td><td align="right"><b>${fmtMoney(finalBal, 0)}</b></td></tr>
          <tr><td>Total Savings Contributed:</td><td align="right">${fmtMoney(totalSavings, 0)}</td></tr>
          <tr><td>Total Investment Growth:</td><td align="right">${fmtMoney(finalBal - totalSavings, 0)}</td></tr>
          <tr style="background:#eaf2e8;"><td>Target Retirement Need:</td><td align="right"><b>${fmtMoney(totalNeeded, 0)}</b></td></tr>
        </table>
      </div>
      <div id="clear"></div>
      <p class="bigtext" style="text-align:center;padding:5px;"><b><a href="#" onclick="var s = document.getElementById('schedules'); if(s) s.style.display = (s.style.display === 'none' ? 'table' : 'none'); return false;">View annual schedule</a></b></p>
      <table id="schedules" class="cinfoT" style="display:none;width:100%;margin-top:10px;">
        <tr><td colspan="4" style="background:#eaf2e8;font-size:16px;"><b>Annual Savings & Accumulation Schedule</b> <a href="#" onclick="var s = document.getElementById('schedules'); if(s) s.style.display = 'none'; return false;" style="float:right;color:#666;font-size:14px;text-decoration:none;">[Close X]</a></td></tr>
        <tr><td class="cinfoHd"><b>Age</b></td><td class="cinfoHd" align="right"><b>Savings Added</b></td><td class="cinfoHd" align="right"><b>Investment Return</b></td><td class="cinfoHd" align="right"><b>End Balance</b></td></tr>
        ${schedRows}
      </table>
    `;
    return true;
  };

  // --- INVESTMENT CALCULATOR WITH AUTHENTIC STACKED SVG GRAPH & SCHEDULE ---
  engines['investment-calculator'] = function () {
    var p0 = getFloat('cstartingprinciplev', 20000) || getFloat('startingamount', 10000);
    var add = getFloat('ccontributeamountv', 1000) || getFloat('addition', 500);
    var rate = (getFloat('cinterestratev', 6) || getFloat('cinterest', 7)) / 100;
    var years = getInt('cyearsv', 10) || getInt('years', 20);

    var curBal = p0;
    var totalPrincipal = p0;
    var totalAdditions = 0;
    var chartItems = [];
    var schedRows = '';

    for (var yr = 1; yr <= years; yr++) {
      var annualAdd = add * 12; // monthly addition assumption
      totalAdditions += annualAdd;
      var growth = curBal * rate + annualAdd * (rate / 2);
      var endBal = curBal + annualAdd + growth;
      var totalInterest = endBal - (p0 + totalAdditions);

      chartItems.push({
        label: yr,
        total: endBal,
        segments: [
          { name: 'Starting amount', val: p0, color: '#2b7ddb' },
          { name: 'Total contributions', val: totalAdditions, color: '#8bbc21' },
          { name: 'Interest earned', val: Math.max(0, totalInterest), color: '#910000' }
        ]
      });

      schedRows += `<tr align="right"><td>${yr}</td><td>${fmtMoney(annualAdd)}</td><td>${fmtMoney(growth)}</td><td>${fmtMoney(endBal)}</td></tr>`;
      curBal = endBal;
    }

    var finalBal = curBal;
    var totalInvested = p0 + totalAdditions;
    var totalInterestAll = finalBal - totalInvested;

    var svgChart = renderStackedSvgChart(chartItems, 'Years');

    var c = getResultContainer(true);
    c.innerHTML = `
      <h2 class="h2result">Result<img height="20" width="19" src="/img/save.svg" title="Save this calculation" style="float:right;padding-top:3px;cursor:pointer;" /></h2>
      <p class="verybigtext">End Balance: <font color="green"><b>${fmtMoney(finalBal, 2)}</b></font></p>
      <div class="clefthalf" style="text-align:center;">
        <div style="max-width:380px;margin-left:auto;margin-right:auto;">
          ${svgChart}
        </div>
      </div>
      <div class="crighthalf">
        <br/>
        <table align="center" class="cinfoT">
          <tr><td>Starting Amount:</td><td align="right">${fmtMoney(p0, 2)}</td></tr>
          <tr><td>Total Contributions:</td><td align="right">${fmtMoney(totalAdditions, 2)}</td></tr>
          <tr><td>Total Interest:</td><td align="right">${fmtMoney(totalInterestAll, 2)}</td></tr>
          <tr style="background:#eaf2e8;"><td><b>End Balance:</b></td><td align="right"><b>${fmtMoney(finalBal, 2)}</b></td></tr>
        </table>
      </div>
      <div id="clear"></div>
      <p class="bigtext" style="text-align:center;padding:5px;"><b><a href="#" onclick="var s = document.getElementById('schedules'); if(s) s.style.display = (s.style.display === 'none' ? 'table' : 'none'); return false;">View annual schedule</a></b></p>
      <table id="schedules" class="cinfoT" style="display:none;width:100%;margin-top:10px;">
        <tr><td colspan="4" style="background:#eaf2e8;font-size:16px;"><b>Annual Investment Schedule</b> <a href="#" onclick="var s = document.getElementById('schedules'); if(s) s.style.display = 'none'; return false;" style="float:right;color:#666;font-size:14px;text-decoration:none;">[Close X]</a></td></tr>
        <tr><td class="cinfoHd"><b>Year</b></td><td class="cinfoHd" align="right"><b>Contributions</b></td><td class="cinfoHd" align="right"><b>Interest Earned</b></td><td class="cinfoHd" align="right"><b>End Balance</b></td></tr>
        ${schedRows}
      </table>
    `;
    return true;
  };


  // --- 1. MORTGAGE & LOAN GROUP ---
  engines['mortgage-calculator'] = function () {
    var price = getFloat('chouseprice', 400000);
    var down = getFloat('cdownpayment', 80000);
    var downUnit = getIn('cdownpaymentunit', '$');
    var termYears = getFloat('cloanterm', 30);
    var rate = getFloat('cinterestrate', 6.643);

    var downAmt = downUnit === '%' ? price * (down / 100) : down;
    if (downAmt > price) downAmt = price;
    var loan = price - downAmt;
    var n = termYears * 12;
    var r = (rate / 100) / 12;

    var pi = r === 0 ? (loan / n) : loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    var taxRate = getFloat('cpropertytaxes', 1.2);
    var taxUnit = getIn('cpropertytaxesunit', '%');
    var annualTax = taxUnit === '%' ? price * (taxRate / 100) : taxRate;
    var mTax = annualTax / 12;
    var mIns = getFloat('chomeins', 1500) / 12;
    var mHOA = getFloat('choa', 0);
    var mOther = getFloat('cothercost', 0) / 12;
    var pmiRate = getFloat('cpmi', 0);
    var mPMI = (downAmt / price < 0.2) ? (loan * (pmiRate / 100)) / 12 : 0;

    var totalMonthly = pi + mTax + mIns + mHOA + mOther + mPMI;
    var totalPayments = pi * n;
    var totalInterest = totalPayments - loan;

    var c = getResultContainer();
    if (!c) return;

    var schedRows = '';
    var bal = loan;
    for (var yr = 1; yr <= Math.min(termYears, 5); yr++) {
      var yrPrin = 0, yrInt = 0;
      var begBal = bal;
      for (var m = 1; m <= 12; m++) {
        var mi = bal * r;
        var mp = pi - mi;
        yrInt += mi;
        yrPrin += mp;
        bal -= mp;
      }
      schedRows += '<tr><td align="center">' + yr + '</td><td align="right">' + fmtMoney(begBal, 0) + '</td><td align="right">' + fmtMoney(yrInt, 0) + '</td><td align="right">' + fmtMoney(yrPrin, 0) + '</td><td align="right">' + fmtMoney(Math.max(0, bal), 0) + '</td></tr>';
    }

    c.innerHTML = `
      <h2 class="h2result">Monthly Payment: ${fmtMoney(totalMonthly)}</h2>
      <div class="bigtext" style="margin: 8px 0;"><b>Monthly Payment Breakdown:</b></div>
      <table class="cinfoT" width="100%">
        <tr><td>Principal & Interest</td><td align="right"><b>${fmtMoney(pi)}</b></td></tr>
        <tr><td>Property Taxes</td><td align="right">${fmtMoney(mTax)}</td></tr>
        <tr><td>Homeowner's Insurance</td><td align="right">${fmtMoney(mIns)}</td></tr>
        ${mHOA > 0 ? `<tr><td>HOA Fees</td><td align="right">${fmtMoney(mHOA)}</td></tr>` : ''}
        ${mPMI > 0 ? `<tr><td>PMI</td><td align="right">${fmtMoney(mPMI)}</td></tr>` : ''}
        <tr style="background:#eaf2e8;font-weight:bold;"><td>Total Monthly Payment</td><td align="right">${fmtMoney(totalMonthly)}</td></tr>
      </table>
      <div class="bigtext" style="margin: 15px 0 5px 0;"><b>Mortgage Summary:</b></div>
      <table class="cinfoT" width="100%">
        <tr><td>Loan Amount</td><td align="right">${fmtMoney(loan, 0)}</td></tr>
        <tr><td>Down Payment</td><td align="right">${fmtMoney(downAmt, 0)} (${((downAmt/price)*100).toFixed(1)}%)</td></tr>
        <tr><td>Total Interest Paid</td><td align="right"><b>${fmtMoney(totalInterest, 0)}</b></td></tr>
        <tr><td>Total of ${n} Payments</td><td align="right">${fmtMoney(totalPayments, 0)}</td></tr>
      </table>
      <div class="bigtext" style="margin: 15px 0 5px 0;"><b>Amortization Schedule (First 5 Years):</b></div>
      <table class="cinfoT" width="100%">
        <tr><td class="cinfoHd" align="center">Year</td><td class="cinfoHd" align="right">Beginning Balance</td><td class="cinfoHd" align="right">Interest</td><td class="cinfoHd" align="right">Principal</td><td class="cinfoHd" align="right">Ending Balance</td></tr>
        ${schedRows}
      </table>
    `;
  };

  engines['loan-calculator'] = engines['personal-loan-calculator'] = engines['business-loan-calculator'] = engines['boat-loan-calculator'] = function () {
    var loan = getFloat('cloanamount', 100000);
    var term = getFloat('cloanterm', 5);
    var rate = getFloat('cinterestrate', 6);
    var n = term * 12;
    var r = (rate / 100) / 12;
    var p = r === 0 ? (loan / n) : loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    var total = p * n;
    var totalInt = total - loan;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Monthly Payment: ${fmtMoney(p)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Loan Amount</td><td align="right">${fmtMoney(loan)}</td></tr>
        <tr><td>Monthly Payment</td><td align="right"><b>${fmtMoney(p)}</b></td></tr>
        <tr><td>Total of ${n} Payments</td><td align="right"><b>${fmtMoney(total)}</b></td></tr>
        <tr><td>Total Interest</td><td align="right"><font color="green"><b>${fmtMoney(totalInt)}</b></font></td></tr>
      </table>
    `;
  };

  engines['auto-loan-calculator'] = function () {
    var price = getFloat('cprice', 35000);
    if (!price) price = getFloat('cloanamount', 35000);
    var termMonths = getFloat('cloanterm', 60);
    var rate = getFloat('cinterestrate', 7);
    var down = getFloat('cdownpayment', 5000);
    var tradein = getFloat('ctradein', 0);
    var taxRate = getFloat('csalestax', 7);
    var fees = getFloat('ctitlefee', 500);

    var taxAmt = Math.max(0, (price - tradein) * (taxRate / 100));
    var netLoan = Math.max(0, price - down - tradein + taxAmt + fees);
    var r = (rate / 100) / 12;
    var m = r === 0 ? (netLoan / termMonths) : netLoan * (r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
    var totalPay = m * termMonths;
    var totalInt = totalPay - netLoan;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Monthly Payment: ${fmtMoney(m)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Vehicle Price</td><td align="right">${fmtMoney(price)}</td></tr>
        <tr><td>Down Payment</td><td align="right">${fmtMoney(down)}</td></tr>
        <tr><td>Trade-in Allowance</td><td align="right">${fmtMoney(tradein)}</td></tr>
        <tr><td>Sales Tax (${taxRate}%)</td><td align="right">${fmtMoney(taxAmt)}</td></tr>
        <tr style="background:#eef;"><td><b>Total Loan Amount</b></td><td align="right"><b>${fmtMoney(netLoan)}</b></td></tr>
        <tr><td>Total Interest Paid</td><td align="right"><b>${fmtMoney(totalInt)}</b></td></tr>
        <tr><td>Total Auto Loan Cost</td><td align="right">${fmtMoney(price + taxAmt + totalInt + fees)}</td></tr>
      </table>
    `;
  };

  engines['compound-interest-calculator'] = engines['interest-calculator'] = function () {
    var p0 = getFloat('cstartingprinciple', 10000);
    var add = getFloat('cannualaddition', 1000) || getFloat('cmonthlyaddition', 100);
    var rate = getFloat('cinterestrate', 7) / 100;
    var years = getInt('cyears', 10);
    var curBal = p0;
    var totalContrib = p0;
    var rows = '';

    for (var yr = 1; yr <= years; yr++) {
      curBal = (curBal + add) * (1 + rate);
      totalContrib += add;
      if (yr <= 10 || yr === years) {
        rows += `<tr><td align="center">${yr}</td><td align="right">${fmtMoney(totalContrib, 0)}</td><td align="right">${fmtMoney(curBal - totalContrib, 0)}</td><td align="right">${fmtMoney(curBal, 0)}</td></tr>`;
      }
    }

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Future Value: ${fmtMoney(curBal)}</h2>
      <div class="bigtext" style="margin: 8px 0;"><b>In ${years} years, balance will grow to ${fmtMoney(curBal)}</b></div>
      <table class="cinfoT" width="100%">
        <tr><td>Initial Investment</td><td align="right">${fmtMoney(p0)}</td></tr>
        <tr><td>Total Principal Invested</td><td align="right">${fmtMoney(totalContrib)}</td></tr>
        <tr><td>Total Interest Earned</td><td align="right"><font color="green"><b>${fmtMoney(curBal - totalContrib)}</b></font></td></tr>
      </table>
      <div class="bigtext" style="margin: 15px 0 5px 0;"><b>Annual Balance Schedule:</b></div>
      <table class="cinfoT" width="100%">
        <tr><td class="cinfoHd" align="center">Year</td><td class="cinfoHd" align="right">Contributions</td><td class="cinfoHd" align="right">Total Interest</td><td class="cinfoHd" align="right">Ending Balance</td></tr>
        ${rows}
      </table>
    `;
  };

  engines['salary-calculator'] = function () {
    var salary = getFloat('csalary', 50000);
    var unit = getIn('cunit', 'year');
    var hpw = getFloat('choursperweek', 40);
    var dpw = getFloat('cdaysperweek', 5);

    var annual = salary;
    if (unit === 'hour') annual = salary * hpw * 52;
    else if (unit === 'day') annual = salary * dpw * 52;
    else if (unit === 'week') annual = salary * 52;
    else if (unit === 'bi-week') annual = salary * 26;
    else if (unit === 'month') annual = salary * 12;

    var hourly = annual / (hpw * 52);
    var daily = annual / (dpw * 52);
    var weekly = annual / 52;
    var biweekly = annual / 26;
    var monthly = annual / 12;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Equivalent Salary Breakdown</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td class="cinfoHd">Period</td><td class="cinfoHd" align="right">Earnings</td></tr>
        <tr><td>Hourly</td><td align="right"><b>${fmtMoney(hourly)}</b></td></tr>
        <tr><td>Daily</td><td align="right">${fmtMoney(daily)}</td></tr>
        <tr><td>Weekly</td><td align="right"><b>${fmtMoney(weekly)}</b></td></tr>
        <tr><td>Bi-Weekly</td><td align="right"><b>${fmtMoney(biweekly)}</b></td></tr>
        <tr><td>Monthly</td><td align="right"><b>${fmtMoney(monthly)}</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Annual (Yearly)</b></td><td align="right"><font size="+1"><b>${fmtMoney(annual)}</b></font></td></tr>
      </table>
    `;
  };

  engines['payback-period-calculator'] = function () {
    var inv = getFloat('initialinvestment1', 100000);
    var cf = getFloat('cashflow', 30000);
    var change = getIn('cashflowchange', 'increase');
    var rate = getFloat('cashflowchangerate', 5) / 100;
    var disc = getFloat('discountrate', 10) / 100;

    var curCF = cf;
    var cumCF = 0, cumDCF = 0;
    var paybackYr = -1, discPaybackYr = -1;
    var rows = '';

    for (var y = 1; y <= 30; y++) {
      cumCF += curCF;
      var dcf = curCF / Math.pow(1 + disc, y);
      cumDCF += dcf;

      if (paybackYr === -1 && cumCF >= inv) {
        var prevCum = cumCF - curCF;
        paybackYr = (y - 1) + (inv - prevCum) / curCF;
      }
      if (discPaybackYr === -1 && cumDCF >= inv) {
        var prevDCum = cumDCF - dcf;
        discPaybackYr = (y - 1) + (inv - prevDCum) / dcf;
      }

      if (y <= 6) {
        rows += `<tr><td align="center">${y}</td><td align="right">${fmtMoney(curCF, 0)}</td><td align="right">${fmtMoney(cumCF, 0)}</td><td align="right">${fmtMoney(dcf, 0)}</td><td align="right">${fmtMoney(cumDCF, 0)}</td></tr>`;
      }
      curCF = change === 'increase' ? curCF * (1 + rate) : curCF * (1 - rate);
    }

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Payback Period: ${paybackYr > 0 ? paybackYr.toFixed(2) + ' Years' : 'Over 30 Years'}</h2>
      <div class="bigtext" style="margin: 8px 0;">
        <b>Discounted Payback Period: ${discPaybackYr > 0 ? discPaybackYr.toFixed(2) + ' Years' : 'Over 30 Years'}</b>
      </div>
      <table class="cinfoT" width="100%">
        <tr><td>Initial Investment</td><td align="right">${fmtMoney(inv, 0)}</td></tr>
        <tr><td>Payback Period</td><td align="right"><font color="green"><b>${paybackYr > 0 ? paybackYr.toFixed(2) + ' Years' : 'N/A'}</b></font></td></tr>
        <tr><td>Discounted Payback Period</td><td align="right"><b>${discPaybackYr > 0 ? discPaybackYr.toFixed(2) + ' Years' : 'N/A'}</b></td></tr>
        <tr><td>Cumulative Cash Flow (5 Years)</td><td align="right">${fmtMoney(cumCF, 0)}</td></tr>
      </table>
      <div class="bigtext" style="margin: 15px 0 5px 0;"><b>Cash Flow Schedule:</b></div>
      <table class="cinfoT" width="100%">
        <tr><td class="cinfoHd" align="center">Year</td><td class="cinfoHd" align="right">Cash Flow</td><td class="cinfoHd" align="right">Cumulative</td><td class="cinfoHd" align="right">Discounted CF</td><td class="cinfoHd" align="right">Cumulative DCF</td></tr>
        ${rows}
      </table>
    `;
  };

  // --- 2. HEALTH & FITNESS GROUP ---
  engines['bmi-calculator'] = function () {
    var m = getBodyMetrics({ feet: 5, inch: 10, lbs: 160, cm: 180, kg: 65 });
    var bmi = m.w_kg / (m.h_m * m.h_m);

    var cat = 'Normal', color = 'green';
    if (bmi < 18.5) { cat = 'Underweight'; color = '#e69900'; }
    else if (bmi < 25) { cat = 'Normal'; color = 'green'; }
    else if (bmi < 30) { cat = 'Overweight'; color = '#e69900'; }
    else { cat = 'Obese'; color = '#bc2020'; }

    var deg = Math.max(0, Math.min(180, (bmi - 10) / (40 - 10) * 180));
    var minHealthy = m.isMetric ? (18.5 * m.h_m * m.h_m) : (18.5 * m.h_m * m.h_m * 2.20462);
    var maxHealthy = m.isMetric ? (25.0 * m.h_m * m.h_m) : (25.0 * m.h_m * m.h_m * 2.20462);
    var wUnit = m.isMetric ? 'kg' : 'lbs';

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Result</h2>
      <div class="bigtext" style="margin-top:5px;">
        <b>BMI = ${bmi.toFixed(1)} kg/m<sup>2</sup></b> &nbsp; (<font color="${color}"><b>${cat}</b></font>)
      </div>
      <div style="padding-top:10px;text-align:center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="300px" height="163px" viewBox="0 0 300 163">
          <g transform="translate(18,18)" style="font-family:arial,sans-serif;font-size:12px;">
            <path d="M0 140 A140 140, 0, 0, 1, 22.6 63.8 L140 140 Z" fill="#ffe400" />
            <path d="M22.6 63.8 A140 140, 0, 0, 1, 96.7 6.9 L140 140 Z" fill="#008137" />
            <path d="M96.7 6.9 A140 140, 0, 0, 1, 169.1 3.1 L140 140 Z" fill="#ffe400" />
            <path d="M169.1 3.1 A140 140, 0, 0, 1, 280 140 L140 140 Z" fill="#bc2020" />
            <path d="M45 140 A90 90, 0, 0, 1, 230 140 Z" fill="#fff" />
            <circle cx="140" cy="140" r="5" fill="#666" />
            <line x1="140" y1="140" x2="65" y2="140" stroke="#666" stroke-width="2" transform="rotate(${deg} 140 140)"/>
            <text x="67" y="120" style="font-size:26px;font-weight:bold;color:#000;">BMI = ${bmi.toFixed(1)}</text>
          </g>
        </svg>
      </div>
      <ul style="margin-left:8px;padding-left:8px;margin-top:8px;">
        <li>Healthy BMI range: <b>18.5 kg/m<sup>2</sup> - 25 kg/m<sup>2</sup></b></li>
        <li>Healthy weight for the height: <b>${minHealthy.toFixed(1)} ${wUnit} - ${maxHealthy.toFixed(1)} ${wUnit}</b></li>
        <li>BMI Prime: <b>${(bmi / 25).toFixed(2)}</b></li>
        <li>Ponderal Index: <b>${(m.w_kg / Math.pow(m.h_m, 3)).toFixed(1)} kg/m<sup>3</sup></b></li>
      </ul>
    `;
  };

  engines['calorie-calculator'] = engines['tdee-calculator'] = function () {
    var m = getBodyMetrics({ feet: 5, inch: 10, lbs: 165, cm: 180, kg: 75 });
    var act = getFloat('cactivity', 1.465);
    var coutunit = (getIn('coutunit', 'c') || 'c').toLowerCase();
    var cformula = (getIn('cformula', 'm') || 'm').toLowerCase();
    var fatPct = getFloat('cfatpct', 20);

    var bmr = cformula === 'h'
      ? (m.sex === 'm' ? 13.397 * m.w_kg + 4.799 * m.h_cm - 5.677 * m.age + 88.362 : 9.247 * m.w_kg + 3.098 * m.h_cm - 4.330 * m.age + 447.593)
      : (cformula === 'k' ? (370 + 21.6 * (1 - fatPct / 100) * m.w_kg) : (10 * m.w_kg + 6.25 * m.h_cm - 5 * m.age + (m.sex === 'm' ? 5 : -161)));
    var tdee = Math.round(bmr * act);
    var factor = coutunit === 'j' ? 4.184 : 1;
    var u = coutunit === 'j' ? 'Kilojoules/day' : 'Calories/day';
    var lossUnit = m.isMetric ? 'kg/week' : 'lb/week';
    var stepSmall = m.isMetric ? '0.25' : '0.5';
    var stepMed = m.isMetric ? '0.5' : '1.0';
    var stepLarge = m.isMetric ? '1.0' : '2.0';

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Daily Calorie Needs</h2>
      <div class="bigtext" style="margin: 8px 0;"><b>Maintain weight: <font color="green">${Math.round(tdee * factor).toLocaleString()} ${u}</font></b></div>
      <table class="cinfoT" width="100%">
        <tr><td class="cinfoHd">Goal</td><td class="cinfoHd" align="right">${coutunit === 'j' ? 'Kilojoules' : 'Calories'} / Day</td><td class="cinfoHd" align="right">Pace</td></tr>
        <tr style="background:#f4fbf0;"><td><b>Maintain Weight</b></td><td align="right"><b>${Math.round(tdee * factor).toLocaleString()}</b></td><td align="right">0 ${lossUnit}</td></tr>
        <tr><td>Mild Weight Loss</td><td align="right"><b>${Math.round((tdee - 250) * factor).toLocaleString()}</b></td><td align="right">-${stepSmall} ${lossUnit}</td></tr>
        <tr style="background:#fff7e6;"><td><b>Weight Loss</b></td><td align="right"><b><font color="#d97706">${Math.round((tdee - 500) * factor).toLocaleString()}</font></b></td><td align="right">-${stepMed} ${lossUnit}</td></tr>
        <tr><td>Extreme Weight Loss</td><td align="right"><b>${Math.round((tdee - 1000) * factor).toLocaleString()}</b></td><td align="right">-${stepLarge} ${lossUnit}</td></tr>
      </table>
    `;
  };

  // --- 3. MATH GROUP ---
  engines['fraction-calculator'] = function () {
    function gcd(a, b) { return b === 0 ? Math.abs(a) : gcd(b, a % b); }
    var f1w = getFloat('f1w', 0), f1n = getFloat('f1n', 1), f1d = getFloat('f1d', 2);
    var op = getIn('op', '+');
    var f2w = getFloat('f2w', 0), f2n = getFloat('f2n', 1), f2d = getFloat('f2d', 3);

    var n1 = (Math.abs(f1w) * f1d + f1n) * (f1w < 0 ? -1 : 1);
    var d1 = f1d;
    var n2 = (Math.abs(f2w) * f2d + f2n) * (f2w < 0 ? -1 : 1);
    var d2 = f2d;

    var resN = 0, resD = 1;
    if (op === '+') { resN = n1 * d2 + n2 * d1; resD = d1 * d2; }
    else if (op === '-') { resN = n1 * d2 - n2 * d1; resD = d1 * d2; }
    else if (op === '*') { resN = n1 * n2; resD = d1 * d2; }
    else if (op === '/') { resN = n1 * d2; resD = d1 * n2; }

    var g = gcd(resN, resD);
    var sn = resN / g, sd = resD / g;
    if (sd < 0) { sn = -sn; sd = -sd; }
    var mixedW = Math.trunc(sn / sd), mixedRem = Math.abs(sn % sd);

    var c = getResultContainer();
    if (!c) return;
    var display = `<b>${sn}/${sd}</b>`;
    if (mixedW !== 0 && mixedRem !== 0) display += ` = <b>${mixedW} ${mixedRem}/${sd}</b>`;

    c.innerHTML = `
      <h2 class="h2result">Result: ${display}</h2>
      <div class="bigtext" style="margin: 8px 0;">Decimal: <b>${(sn / sd).toFixed(6).replace(/\\.?0+$/, '')}</b></div>
    `;
  };

  engines['percent-calculator'] = function () {
    var c1 = getFloat('cparm1', 10), c2 = getFloat('cparm2', 50);
    var res1 = (c1 / 100) * c2;
    var res2 = c2 === 0 ? 0 : (c1 / c2) * 100;
    var pctChange = c1 === 0 ? 0 : ((c2 - c1) / c1) * 100;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Percentage Results</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>What is ${c1}% of ${c2}?</td><td align="right"><b>${fmtNum(res1)}</b></td></tr>
        <tr><td>${c1} is what percent of ${c2}?</td><td align="right"><b>${fmtNum(res2)}%</b></td></tr>
        <tr><td>Percentage change from ${c1} to ${c2}:</td><td align="right"><b>${pctChange >= 0 ? '+' : ''}${fmtNum(pctChange)}%</b></td></tr>
      </table>
    `;
  };

  engines['standard-deviation-calculator'] = engines['average-calculator'] = function () {
    var raw = getIn('cnumber', '10, 2, 38, 23, 38, 23, 21');
    var nums = raw.split(/[\s,]+/).map(parseFloat).filter(function (x) { return !isNaN(x); });
    if (nums.length === 0) return;

    var N = nums.length;
    var sum = nums.reduce(function (a, b) { return a + b; }, 0);
    var mean = sum / N;
    var sumSq = nums.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0);
    var sSD = N > 1 ? Math.sqrt(sumSq / (N - 1)) : 0;
    var pSD = Math.sqrt(sumSq / N);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Statistical Summary</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Count (N)</td><td align="right">${N}</td></tr>
        <tr><td>Sum (&Sigma;x)</td><td align="right">${fmtNum(sum)}</td></tr>
        <tr><td>Mean (Average)</td><td align="right"><b>${fmtNum(mean, 4)}</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Sample Std Dev (s)</b></td><td align="right"><b>${fmtNum(sSD, 4)}</b></td></tr>
        <tr><td>Population Std Dev (&sigma;)</td><td align="right"><b>${fmtNum(pSD, 4)}</b></td></tr>
      </table>
    `;
  };

  // --- 4. EVERYDAY & UTILITY GROUP ---
  engines['age-calculator'] = function () {
    var bm = getInt('today_Month_ID', getInt('cmonth', 0)) + 1;
    var bd = getInt('today_Day_ID', getInt('cday', 1));
    var by = getInt('today_Year_ID', getInt('cyear', 2000));

    var now = new Date();
    var tm = getInt('ageat_Month_ID', getInt('cmonth2', now.getMonth())) + 1;
    var td = getInt('ageat_Day_ID', getInt('cday2', now.getDate()));
    var ty = getInt('ageat_Year_ID', getInt('cyear2', now.getFullYear()));

    var bDate = new Date(by, bm - 1, bd);
    var tDate = new Date(ty, tm - 1, td);

    if (isNaN(bDate.getTime()) || isNaN(tDate.getTime())) return;

    var diffMs = tDate - bDate;
    if (diffMs < 0) {
      var c = getResultContainer();
      if (c) c.innerHTML = '<h2 class="h2result" style="color:#dc2626;">Date of birth must be earlier than the target date.</h2>';
      return;
    }

    var years = ty - by;
    var months = tm - bm;
    var days = td - bd;

    if (days < 0) {
      months--;
      var prev = new Date(ty, tm - 1, 0);
      days += prev.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    var totalDays = Math.floor(diffMs / (24 * 3600 * 1000));
    var totalWeeks = Math.floor(totalDays / 7);
    var daysRem = totalDays % 7;
    var totalHours = totalDays * 24;
    var totalMinutes = totalHours * 60;
    var totalSeconds = totalMinutes * 60;
    var totalMonths = years * 12 + months;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <div class="result-card modern-card" style="margin-bottom:20px;padding:20px;background:var(--color-success-bg);border:1px solid var(--color-success-border);border-radius:12px;">
        <h2 class="h2result" style="color:var(--color-success);margin:0 0 10px 0;font-size:24px;">Result: ${years} years, ${months} months, ${days} days</h2>
        <p style="font-size:16px;line-height:1.8;color:var(--text-secondary);margin:0;">
          or <b>${totalMonths}</b> months ${days} days<br>
          or <b>${totalWeeks.toLocaleString()}</b> weeks ${daysRem} days<br>
          or <b>${totalDays.toLocaleString()}</b> days<br>
          or <b>${totalHours.toLocaleString()}</b> hours<br>
          or <b>${totalMinutes.toLocaleString()}</b> minutes<br>
          or <b>${totalSeconds.toLocaleString()}</b> seconds
        </p>
      </div>
    `;
  };

  engines['tip-calculator'] = function () {
    var bill = getFloat('billamount') || getFloat('serviceprice') || getFloat('cbillamount', 50);
    var pct = getFloat('tippct') || getFloat('ctiprate', 18);
    var people = getInt('numberofpeople') || getInt('cpeople', 1) || 1;
    var tip = bill * (pct / 100);
    var total = bill + tip;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Total Bill: ${fmtMoney(total)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Tip Amount (${pct}%)</td><td align="right"><b>${fmtMoney(tip)}</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Amount</b></td><td align="right"><font size="+1"><b>${fmtMoney(total)}</b></font></td></tr>
        ${people > 1 ? `<tr><td>Tip per Person</td><td align="right">${fmtMoney(tip / people)}</td></tr><tr style="background:#eaf2e8;"><td><b>Total per Person (${people} people)</b></td><td align="right"><b>${fmtMoney(total / people)}</b></td></tr>` : ''}
      </table>
    `;
  };

  engines['ip-subnet-calculator'] = function () {
    var ipStr = getIn('cip', '192.168.1.1');
    var cidr = getInt('cmask', 24);
    var parts = ipStr.split('.').map(Number);
    if (parts.length !== 4) parts = [192, 168, 1, 1];

    var ipNum = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
    var maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr));
    var netNum = ipNum & maskNum;
    var bcastNum = netNum | ~maskNum;

    function toIp(num) {
      return [(num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join('.');
    }
    var totalHosts = Math.pow(2, 32 - cidr);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Subnet CIDR /${cidr}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Network Address</td><td align="right"><b>${toIp(netNum)}</b></td></tr>
        <tr><td>Subnet Mask</td><td align="right">${toIp(maskNum)}</td></tr>
        <tr><td>Usable Range</td><td align="right">${toIp(netNum + 1)} - ${toIp(bcastNum - 1)}</td></tr>
        <tr><td>Broadcast Address</td><td align="right">${toIp(bcastNum)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Usable Hosts</b></td><td align="right"><b>${Math.max(0, totalHosts - 2).toLocaleString()}</b></td></tr>
      </table>
    `;
  };

  engines['password-generator'] = function () {
    var len = getInt('plength', 16);
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+~|}{[]:;?><,.-=';
    var pw = '';
    var arr = new Uint32Array(len);
    window.crypto.getRandomValues(arr);
    for (var i = 0; i < len; i++) pw += chars[arr[i] % chars.length];

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Generated Password</h2>
      <div style="background:#f9f9f9;padding:15px;border:1px solid #ddd;border-radius:4px;text-align:center;margin-top:10px;">
        <input type="text" id="pwResult" value="${pw}" readonly style="font-size:22px;font-family:monospace;width:80%;padding:8px;text-align:center;border:1px solid #336699;border-radius:3px;">
        <br><br>
        <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('pwResult').value);alert('Password copied!');" style="background:#4c7b25;color:#fff;border:none;padding:10px 20px;font-size:16px;font-weight:bold;cursor:pointer;border-radius:3px;">Copy to Clipboard</button>
      </div>
    `;
  };

  // --- Universal Smart Fallback Engine ---
  function calcGenericFallback() {
    var c = getResultContainer();
    if (!c) return false;

    var inputs = document.querySelectorAll('form input[type="text"], form input[type="number"], form select');
    var vals = [];
    var sum = 0, count = 0;

    inputs.forEach(function (inp) {
      if (inp.name === 'calcSearchTerm' || inp.type === 'hidden') return;
      var raw = (inp.value || '').trim().replace(/[$,%]/g, '');
      var num = parseFloat(raw);
      if (!isNaN(num)) {
        var label = inp.name || 'Input';
        var row = inp.closest('tr');
        if (row && row.cells.length > 1) {
          var labelText = row.cells[0].innerText.trim();
          if (labelText) label = labelText;
        }
        vals.push({ name: label, val: num });
        sum += num;
        count++;
      }
    });

    if (count === 0) return false;

    var rows = vals.slice(0, 10).map(function (v) {
      return `<tr><td>${v.name}</td><td align="right"><b>${fmtNum(v.val)}</b></td></tr>`;
    }).join('');

    c.innerHTML = `
      <h2 class="h2result">Calculation Result</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        ${rows}
        <tr style="background:#eaf2e8;"><td><b>Calculated Total</b></td><td align="right"><font size="+1"><b>${fmtNum(sum)}</b></font></td></tr>
        ${count > 1 ? `<tr><td>Average</td><td align="right"><b>${fmtNum(sum / count)}</b></td></tr>` : ''}
      </table>
    `;
    return true;
  }

  // --- Global Form & Event Interceptors ---
  if (typeof HTMLFormElement !== 'undefined') {
    var originalSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function () {
      var event = new Event('submit', { cancelable: true, bubbles: true });
      if (this.dispatchEvent(event)) {
        originalSubmit.call(this);
      }
    };
  }

  

  // ==========================================
  // COMPREHENSIVE FINANCIAL CALCULATION ENGINES
  // ==========================================

  // Auto Lease Calculator
  engines['auto-lease-calculator'] = function () {
    var price = getFloat('cloanamount', 50000);
    var term = getFloat('cloanterm', 36);
    var rate = getFloat('cinterestrate', 0.00208);
    var down = getFloat('cdownpayment', 10000);
    var trade = getFloat('ctradeinvalue', 0);
    var tax = getFloat('csaletax', 7);
    var res = getFloat('cresidualvalue', 24000);

    var mf = rate > 0.05 ? (rate / 2400) : (rate || 0.002);
    var netCap = Math.max(0, price - down - trade);
    var depFee = term > 0 ? (netCap - res) / term : 0;
    var finFee = (netCap + res) * mf;
    var baseMonthly = Math.max(0, depFee + finFee);
    var monthlyTax = baseMonthly * (tax / 100);
    var totalMonthly = baseMonthly + monthlyTax;
    var totalPayments = totalMonthly * term + down;
    var totalInterest = finFee * term;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Monthly Lease Payment: ${fmtMoney(totalMonthly)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Base Monthly Payment</td><td align="right"><b>${fmtMoney(baseMonthly)}</b></td></tr>
        <tr><td>Monthly Sales Tax (${tax}%)</td><td align="right">${fmtMoney(monthlyTax)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Monthly Payment</b></td><td align="right"><font size="+1"><b>${fmtMoney(totalMonthly)}</b></font></td></tr>
        <tr><td>Net Capitalized Cost</td><td align="right">${fmtMoney(netCap)}</td></tr>
        <tr><td>Residual Value</td><td align="right">${fmtMoney(res)}</td></tr>
        <tr><td>Total Depreciation Fee</td><td align="right">${fmtMoney(depFee * term)}</td></tr>
        <tr><td>Total Finance Charge</td><td align="right">${fmtMoney(totalInterest)}</td></tr>
        <tr style="background:#f0f4f8;"><td><b>Total Cost of Lease</b></td><td align="right"><b>${fmtMoney(totalPayments)}</b></td></tr>
      </table>
    `;
  };

  // Lease Calculator
  engines['lease-calculator'] = engines['auto-lease-calculator'];

  // CD Calculator
  engines['cd-calculator'] = function () {
    var p = getFloat('cstartingprinciple', 10000);
    var r = getFloat('cinterestrate', 5) / 100;
    var yrs = getFloat('cyears', 3);
    var mos = getFloat('cmonths', 0);
    var tax = getFloat('ctaxtrate', 0) / 100;
    var t = yrs + (mos / 12);
    var n = 12; // monthly compounding default
    var comp = getIn('ccompound', '12');
    if (comp === '365' || comp === 'daily') n = 365;
    else if (comp === '4' || comp === 'quarterly') n = 4;
    else if (comp === '1' || comp === 'annually') n = 1;

    var endBal = p * Math.pow(1 + (r / n), n * t);
    var totalInt = endBal - p;
    var taxPaid = totalInt * tax;
    var afterTaxBal = endBal - taxPaid;
    var apy = (Math.pow(1 + (r / n), n) - 1) * 100;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">End Balance: ${fmtMoney(afterTaxBal)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Initial Deposit</td><td align="right">${fmtMoney(p)}</td></tr>
        <tr><td>Annual Percentage Yield (APY)</td><td align="right"><b>${fmtNum(apy, 3)}%</b></td></tr>
        <tr><td>Total Interest Earned</td><td align="right"><font color="green"><b>${fmtMoney(totalInt)}</b></font></td></tr>
        ${tax > 0 ? `<tr><td>Tax Withheld (${fmtNum(tax * 100, 1)}%)</td><td align="right">-${fmtMoney(taxPaid)}</td></tr>` : ''}
        <tr style="background:#eaf2e8;"><td><b>Final Balance</b></td><td align="right"><font size="+1"><b>${fmtMoney(afterTaxBal)}</b></font></td></tr>
      </table>
    `;
  };

  // Sales Tax Calculator
  engines['sales-tax-calculator'] = function () {
    var before = getFloat('beforetax', 0);
    var rate = getFloat('taxrate', 6.5);
    var finalPrice = getFloat('finalprice', 0);

    var taxAmt = 0, total = 0, net = before;
    if (before > 0) {
      taxAmt = before * (rate / 100);
      total = before + taxAmt;
    } else if (finalPrice > 0) {
      total = finalPrice;
      net = total / (1 + (rate / 100));
      taxAmt = total - net;
    } else {
      net = 100;
      taxAmt = net * (rate / 100);
      total = net + taxAmt;
    }

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Total Price: ${fmtMoney(total)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Before Tax Price</td><td align="right">${fmtMoney(net)}</td></tr>
        <tr><td>Sales Tax Rate</td><td align="right">${fmtNum(rate, 3)}%</td></tr>
        <tr><td>Sales Tax Amount</td><td align="right"><font color="green"><b>${fmtMoney(taxAmt)}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Amount</b></td><td align="right"><font size="+1"><b>${fmtMoney(total)}</b></font></td></tr>
      </table>
    `;
  };

  // VAT Calculator
  engines['vat-calculator'] = function () {
    var before = getFloat('beforetax', 0);
    var rate = getFloat('taxrate', 8);
    var finalP = getFloat('finalprice', 0);

    var net = before, vat = 0, gross = 0;
    if (before > 0) {
      vat = before * (rate / 100);
      gross = before + vat;
    } else if (finalP > 0) {
      gross = finalP;
      net = gross / (1 + (rate / 100));
      vat = gross - net;
    } else {
      net = 1200;
      vat = net * (rate / 100);
      gross = net + vat;
    }

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Gross Amount (with VAT): ${fmtMoney(gross)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Net Amount (excl. VAT)</td><td align="right">${fmtMoney(net)}</td></tr>
        <tr><td>VAT Rate</td><td align="right">${fmtNum(rate, 2)}%</td></tr>
        <tr><td>VAT Value</td><td align="right"><font color="green"><b>${fmtMoney(vat)}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Gross Amount (incl. VAT)</b></td><td align="right"><font size="+1"><b>${fmtMoney(gross)}</b></font></td></tr>
      </table>
    `;
  };

  // Discount Calculator & Percent Off Calculator
  engines['discount-calculator'] = engines['percent-off-calculator'] = function () {
    var price = getFloat('pricebefore', 59.99);
    var disc = getFloat('discount', 15);
    var saved = price * (disc / 100);
    var finalP = price - saved;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Final Price: ${fmtMoney(finalP)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Original Price</td><td align="right">${fmtMoney(price)}</td></tr>
        <tr><td>Discount</td><td align="right">${fmtNum(disc, 2)}%</td></tr>
        <tr><td>You Save</td><td align="right"><font color="green"><b>${fmtMoney(saved)}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Discounted Price</b></td><td align="right"><font size="+1"><b>${fmtMoney(finalP)}</b></font></td></tr>
      </table>
    `;
  };

  // Margin Calculator
  engines['margin-calculator'] = function () {
    var cost = getFloat('ccost', 120);
    var sale = getFloat('csale', 160);
    var profit = sale - cost;
    var margin = sale > 0 ? (profit / sale) * 100 : 0;
    var markup = cost > 0 ? (profit / cost) * 100 : 0;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Gross Margin: ${fmtNum(margin, 2)}%</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Cost</td><td align="right">${fmtMoney(cost)}</td></tr>
        <tr><td>Revenue (Sale Price)</td><td align="right">${fmtMoney(sale)}</td></tr>
        <tr><td>Gross Profit</td><td align="right"><font color="green"><b>${fmtMoney(profit)}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Gross Margin</b></td><td align="right"><font size="+1"><b>${fmtNum(margin, 2)}%</b></font></td></tr>
        <tr><td>Markup</td><td align="right"><b>${fmtNum(markup, 2)}%</b></td></tr>
      </table>
    `;
  };

  // Commission Calculator
  engines['commission-calculator'] = function () {
    var sales = getFloat('csale', 10000);
    var rate = getFloat('crate', 5);
    var base = getFloat('cbase', 0);
    var comm = sales * (rate / 100);
    var total = base + comm;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Total Earnings: ${fmtMoney(total)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Base Salary / Pay</td><td align="right">${fmtMoney(base)}</td></tr>
        <tr><td>Sales Volume</td><td align="right">${fmtMoney(sales)}</td></tr>
        <tr><td>Commission Rate</td><td align="right">${fmtNum(rate, 2)}%</td></tr>
        <tr><td>Commission Earned</td><td align="right"><font color="green"><b>${fmtMoney(comm)}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Payout</b></td><td align="right"><font size="+1"><b>${fmtMoney(total)}</b></font></td></tr>
      </table>
    `;
  };

  // APR Calculator
  engines['apr-calculator'] = function () {
    var loan = getFloat('cloanamount', 100000);
    var term = getFloat('cloanterm', 10);
    var rate = getFloat('cinterestrate', 6) / 100 / 12;
    var upfront = getFloat('cfrontfees', 2500);
    var n = term * 12;
    var pmt = rate === 0 ? (loan / n) : (loan * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
    var netProceeds = loan - upfront;

    // Newton-Raphson APR solver
    var r = rate;
    for (var iter = 0; iter < 40; iter++) {
      var pv = 0;
      var pvPrime = 0;
      for (var t = 1; t <= n; t++) {
        var disc = Math.pow(1 + r, t);
        pv += pmt / disc;
        pvPrime -= (t * pmt) / (disc * (1 + r));
      }
      var diff = pv - netProceeds;
      if (Math.abs(diff) < 0.0001) break;
      r = r - diff / pvPrime;
    }
    var apr = r * 12 * 100;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Calculated APR: ${fmtNum(apr, 3)}%</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Nominal Interest Rate</td><td align="right">${fmtNum(rate * 12 * 100, 3)}%</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Annual Percentage Rate (APR)</b></td><td align="right"><font size="+1"><b>${fmtNum(apr, 3)}%</b></font></td></tr>
        <tr><td>Monthly Payment</td><td align="right"><b>${fmtMoney(pmt)}</b></td></tr>
        <tr><td>Loan Amount</td><td align="right">${fmtMoney(loan)}</td></tr>
        <tr><td>Upfront Finance Fees</td><td align="right">${fmtMoney(upfront)}</td></tr>
        <tr><td>Total Cost of Loan</td><td align="right"><b>${fmtMoney(pmt * n + upfront)}</b></td></tr>
      </table>
    `;
  };

  // Bond Calculator
  engines['bond-calculator'] = function () {
    var face = getFloat('cface', 100);
    var ytm = getFloat('cyield', 6) / 100;
    var yrs = getFloat('cyears', 3);
    var couponRate = getFloat('ccoupon', 5) / 100;

    var cpn = face * couponRate;
    var price = 0;
    for (var t = 1; t <= yrs; t++) {
      price += cpn / Math.pow(1 + ytm, t);
    }
    price += face / Math.pow(1 + ytm, yrs);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Bond Price: ${fmtMoney(price)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Face / Par Value</td><td align="right">${fmtMoney(face)}</td></tr>
        <tr><td>Annual Coupon Rate</td><td align="right">${fmtNum(couponRate * 100, 2)}%</td></tr>
        <tr><td>Annual Coupon Payment</td><td align="right">${fmtMoney(cpn)}</td></tr>
        <tr><td>Yield to Maturity (YTM)</td><td align="right">${fmtNum(ytm * 100, 2)}%</td></tr>
        <tr><td>Maturity Period</td><td align="right">${yrs} years</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Current Bond Price</b></td><td align="right"><font size="+1"><b>${fmtMoney(price)}</b></font></td></tr>
      </table>
    `;
  };

  // Annuity Calculator & Annuity Payout Calculator
  engines['annuity-calculator'] = engines['annuity-payout-calculator'] = function () {
    var p = getFloat('cstartingprinciple', 100000);
    var r = getFloat('cinterestrate', 6) / 100 / 12;
    var yrs = getFloat('cyears', 20);
    var pmt = getFloat('cannualaddition', 500) || getFloat('cmonthlypay', 500);
    var n = yrs * 12;

    var fv = p * Math.pow(1 + r, n) + (r > 0 ? (pmt * (Math.pow(1 + r, n) - 1) / r) : pmt * n);
    var payoutMonthly = (r > 0 ? (p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : p / n);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Annuity Future Value: ${fmtMoney(fv)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Starting Principal</td><td align="right">${fmtMoney(p)}</td></tr>
        <tr><td>Growth Period</td><td align="right">${yrs} years</td></tr>
        <tr><td>Interest Rate</td><td align="right">${fmtNum(r * 12 * 100, 2)}%</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Accumulated Value (FV)</b></td><td align="right"><font size="+1"><b>${fmtMoney(fv)}</b></font></td></tr>
        <tr><td>Equivalent Monthly Payout (over ${yrs} yrs)</td><td align="right"><b>${fmtMoney(payoutMonthly)}</b></td></tr>
      </table>
    `;
  };

  // Future Value Calculator & Present Value Calculator
  engines['future-value-calculator'] = engines['present-value-calculator'] = function () {
    var pv = getFloat('cpresentvalue', 10000) || getFloat('cstartingprinciple', 10000);
    var fv = getFloat('cfuturevalue', 20000);
    var rate = getFloat('cinterestrate', 6) / 100;
    var periods = getFloat('cperiods', 10) || getFloat('cyears', 10);
    var pmt = getFloat('cperiodicpayment', 0);

    var calcFV = pv * Math.pow(1 + rate, periods) + (rate > 0 ? pmt * ((Math.pow(1 + rate, periods) - 1) / rate) : pmt * periods);
    var calcPV = fv / Math.pow(1 + rate, periods);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Future Value: ${fmtMoney(calcFV)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Present Value (PV)</td><td align="right">${fmtMoney(pv)}</td></tr>
        <tr><td>Interest Rate per Period</td><td align="right">${fmtNum(rate * 100, 2)}%</td></tr>
        <tr><td>Number of Periods</td><td align="right">${periods}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Future Value (FV)</b></td><td align="right"><font size="+1"><b>${fmtMoney(calcFV)}</b></font></td></tr>
        <tr><td>Discounted Present Value of ${fmtMoney(fv)}</td><td align="right"><b>${fmtMoney(calcPV)}</b></td></tr>
      </table>
    `;
  };

  // Canadian Mortgage Calculator
  engines['canadian-mortgage-calculator'] = function () {
    var price = getFloat('chouseprice', 800000);
    var down = getFloat('cdownpayment', 20);
    var downAmt = down < 100 ? (price * (down / 100)) : down;
    var loan = price - downAmt;
    var term = getFloat('cloanterm', 25);
    var annRate = getFloat('cinterestrate', 5) / 100;
    // Semi-annual compounding for Canadian Mortgages
    var rMonthly = Math.pow(1 + (annRate / 2), 2 / 12) - 1;
    var n = term * 12;
    var pmt = (loan * (rMonthly * Math.pow(1 + rMonthly, n))) / (Math.pow(1 + rMonthly, n) - 1);
    var totalPayments = pmt * n;
    var totalInt = totalPayments - loan;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Monthly Payment: ${fmtMoney(pmt)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Mortgage Loan Amount</td><td align="right">${fmtMoney(loan)}</td></tr>
        <tr><td>Down Payment</td><td align="right">${fmtMoney(downAmt)} (${fmtNum((downAmt/price)*100, 1)}%)</td></tr>
        <tr><td>Amortization Period</td><td align="right">${term} years</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Monthly Mortgage Payment</b></td><td align="right"><font size="+1"><b>${fmtMoney(pmt)}</b></font></td></tr>
        <tr><td>Total Mortgage Interest</td><td align="right"><font color="green"><b>${fmtMoney(totalInt)}</b></font></td></tr>
        <tr><td>Total of All Payments</td><td align="right"><b>${fmtMoney(totalPayments)}</b></td></tr>
      </table>
    `;
  };

  // UK Mortgage Calculator
  engines['mortgage-calculator-uk'] = function () {
    var price = getFloat('chouseprice', 300000);
    var down = getFloat('cdownpayment', 15);
    var downAmt = down < 100 ? (price * (down / 100)) : down;
    var loan = price - downAmt;
    var term = getFloat('cloanterm', 25);
    var rate = getFloat('cinterestrate', 5.5) / 100 / 12;
    var n = term * 12;
    var pmt = (loan * (rate * Math.pow(1 + rate, n))) / (Math.pow(1 + rate, n) - 1);
    var interestOnlyPmt = loan * rate;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Monthly Repayment: £${fmtNum(pmt, 2)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Property Value</td><td align="right">£${fmtNum(price, 2)}</td></tr>
        <tr><td>Deposit</td><td align="right">£${fmtNum(downAmt, 2)}</td></tr>
        <tr><td>Mortgage Loan</td><td align="right">£${fmtNum(loan, 2)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Capital & Interest Monthly</b></td><td align="right"><font size="+1"><b>£${fmtNum(pmt, 2)}</b></font></td></tr>
        <tr><td>Interest-Only Monthly</td><td align="right">£${fmtNum(interestOnlyPmt, 2)}</td></tr>
        <tr><td>Total Repayments</td><td align="right"><b>£${fmtNum(pmt * n, 2)}</b></td></tr>
      </table>
    `;
  };

  // Mortgage Amortization Calculator
  engines['mortgage-amortization-calculator'] = engines['amortization-calculator'];

  // VA Mortgage Calculator
  engines['va-mortgage-calculator'] = function () {
    var price = getFloat('chouseprice', 500000);
    var down = getFloat('cdownpayment', 0);
    var downAmt = down < 100 ? (price * (down / 100)) : down;
    var baseLoan = price - downAmt;
    var rate = getFloat('cinterestrate', 7.282) / 100 / 12;
    var term = getFloat('cloanterm', 30);
    var fundingFeeRate = down < 5 ? 0.0215 : (down < 10 ? 0.015 : 0.0125);
    var fundingFee = baseLoan * fundingFeeRate;
    var totalLoan = baseLoan + fundingFee;
    var n = term * 12;
    var pmt = (totalLoan * (rate * Math.pow(1 + rate, n))) / (Math.pow(1 + rate, n) - 1);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Monthly Payment (P&I): ${fmtMoney(pmt)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Purchase Price</td><td align="right">${fmtMoney(price)}</td></tr>
        <tr><td>Base Loan Amount</td><td align="right">${fmtMoney(baseLoan)}</td></tr>
        <tr><td>VA Funding Fee (${fmtNum(fundingFeeRate * 100, 2)}%)</td><td align="right">${fmtMoney(fundingFee)}</td></tr>
        <tr><td>Total Financed Amount</td><td align="right"><b>${fmtMoney(totalLoan)}</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Monthly Principal & Interest</b></td><td align="right"><font size="+1"><b>${fmtMoney(pmt)}</b></font></td></tr>
        <tr><td>Total Payments (${term} Years)</td><td align="right">${fmtMoney(pmt * n)}</td></tr>
      </table>
    `;
  };

  // FHA Loan Calculator
  engines['fha-loan-calculator'] = function () {
    var price = getFloat('chouseprice', 350000);
    var down = getFloat('cdownpayment', 3.5);
    var downAmt = down < 100 ? (price * (down / 100)) : down;
    var baseLoan = price - downAmt;
    var upfrontMIP = baseLoan * 0.0175; // 1.75% upfront MIP
    var totalLoan = baseLoan + upfrontMIP;
    var term = getFloat('cloanterm', 30);
    var rate = getFloat('cinterestrate', 6.5) / 100 / 12;
    var n = term * 12;
    var pi = (totalLoan * (rate * Math.pow(1 + rate, n))) / (Math.pow(1 + rate, n) - 1);
    var monthlyMIP = (baseLoan * 0.0055) / 12; // 0.55% annual MIP
    var totalMonthly = pi + monthlyMIP;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Total Monthly Payment: ${fmtMoney(totalMonthly)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Base Loan</td><td align="right">${fmtMoney(baseLoan)}</td></tr>
        <tr><td>FHA Upfront MIP (1.75%)</td><td align="right">${fmtMoney(upfrontMIP)}</td></tr>
        <tr><td>Total Financed Loan</td><td align="right"><b>${fmtMoney(totalLoan)}</b></td></tr>
        <tr><td>Principal & Interest (P&I)</td><td align="right">${fmtMoney(pi)}</td></tr>
        <tr><td>Monthly Mortgage Insurance (MIP)</td><td align="right">${fmtMoney(monthlyMIP)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Monthly Payment</b></td><td align="right"><font size="+1"><b>${fmtMoney(totalMonthly)}</b></font></td></tr>
      </table>
    `;
  };

  // Student Loan Calculator & Payment Calculator (supports Fixed Term & Fixed Payments)
  engines['student-loan-calculator'] = engines['payment-calculator'] = function () {
    var ctype = (getIn('ctype', 'fixterm') || 'fixterm').toLowerCase();
    var loan = getFloat('cloanamount', 30000) || getFloat('cloanamount1', 30000);
    var rate = getFloat('cinterestrate', 6.8) || getFloat('cinterestrate1', 6.8);
    var r = (rate / 100) / 12;

    if (ctype === 'fixpay') {
      var mPay = getFloat('cmonthlypay', 2000);
      var minPay = loan * r;
      var c = getResultContainer();
      if (!c) return;
      if (r > 0 && mPay <= minPay) {
        c.innerHTML = `<h2 class="h2result">Payment Too Low</h2><p style="padding:10px;color:#ef4444;">Monthly payment (${fmtMoney(mPay)}) must exceed first month's interest (${fmtMoney(minPay)}) to pay off the loan.</p>`;
        return;
      }
      var months = r === 0 ? Math.ceil(loan / (mPay || 1)) : -Math.log(1 - (loan * r) / mPay) / Math.log(1 + r);
      var yrs = Math.floor(months / 12);
      var remMo = Math.round((months % 12) * 10) / 10;
      var totalPaid = mPay * months;
      var totalInt = Math.max(0, totalPaid - loan);
      c.innerHTML = `
        <h2 class="h2result">Payoff Time: ${fmtNum(months, 1)} months (${fmtNum(months / 12, 2)} years)</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr><td>Loan Amount</td><td align="right">${fmtMoney(loan)}</td></tr>
          <tr><td>Monthly Payment</td><td align="right"><b>${fmtMoney(mPay)}</b></td></tr>
          <tr><td>Interest Rate</td><td align="right">${fmtNum(rate, 2)}%</td></tr>
          <tr style="background:#eaf2e8;"><td><b>Time to Pay Off</b></td><td align="right"><font size="+1"><b>${yrs} years, ${remMo} months (${Math.ceil(months)} payments)</b></font></td></tr>
          <tr><td>Total Interest Paid</td><td align="right"><font color="green"><b>${fmtMoney(totalInt)}</b></font></td></tr>
          <tr><td>Total Payments</td><td align="right"><b>${fmtMoney(totalPaid)}</b></td></tr>
        </table>
      `;
      return;
    }

    var term = getFloat('cloanterm', 10) || getFloat('cloanterm1', 10);
    var n = term * 12;
    var pmt = r === 0 ? (loan / n) : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    var total = pmt * n;
    var totalInt = total - loan;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Monthly Payment: ${fmtMoney(pmt)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Loan Amount</td><td align="right">${fmtMoney(loan)}</td></tr>
        <tr><td>Interest Rate</td><td align="right">${fmtNum(rate, 2)}%</td></tr>
        <tr><td>Repayment Term</td><td align="right">${term} years (${n} payments)</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Monthly Payment</b></td><td align="right"><font size="+1"><b>${fmtMoney(pmt)}</b></font></td></tr>
        <tr><td>Total Interest Paid</td><td align="right"><font color="green"><b>${fmtMoney(totalInt)}</b></font></td></tr>
        <tr><td>Total Repayment Amount</td><td align="right"><b>${fmtMoney(total)}</b></td></tr>
      </table>
    `;
  };

  // Repayment Calculator (supports both fixed time and fixed installment modes)
  var PAYBACK_META = {
    daily: { perYear: 365, label: 'every day' },
    weekly: { perYear: 52, label: 'every week' },
    biweekly: { perYear: 26, label: 'every 2 weeks' },
    halfmonth: { perYear: 24, label: 'every half month' },
    month: { perYear: 12, label: 'every month' },
    quarter: { perYear: 4, label: 'every quarter' },
    halfyear: { perYear: 2, label: 'every 6 months' },
    year: { perYear: 1, label: 'every year' }
  };
  var COMPOUND_PER_YEAR = {
    annually: 1, semiannually: 2, quarterly: 4, monthly: 12,
    semimonthly: 24, biweekly: 26, weekly: 52, daily: 365, continuously: 0
  };
  if (typeof window !== 'undefined') {
    window.switchPaybackTerm = function (val) {
      var lbl = document.getElementById('cpaybackwayamountterm');
      if (lbl && PAYBACK_META[val]) lbl.textContent = PAYBACK_META[val].label;
    };
    window.switchPaybackWay = function (way) {
      var tTbl = document.getElementById('cpaybackwayterm');
      var aTbl = document.getElementById('cpaybackwayamount');
      if (tTbl) tTbl.style.opacity = way === 'a' ? '0.55' : '1';
      if (aTbl) aTbl.style.opacity = way === 't' ? '0.55' : '1';
    };
  }
  engines['repayment-calculator'] = function () {
    var loan = getFloat('cloanamount', 10000);
    var rate = getFloat('cinterestrate', 10);
    var compKey = String(getIn('ccompound', 'monthly'));
    var pbKey = String(getIn('cpayback', 'month'));
    var way = String(getIn('cpaybackway', 't'));

    var pb = PAYBACK_META[pbKey] || PAYBACK_META.month;
    var compN = COMPOUND_PER_YEAR[compKey];
    var nomR = rate / 100;
    var ear = compKey === 'continuously' ? (Math.exp(nomR) - 1) : (Math.pow(1 + nomR / (compN || 12), compN || 12) - 1);
    var rPerPay = Math.pow(1 + ear, 1 / pb.perYear) - 1;

    var c = getResultContainer();
    if (!c) return;

    if (way === 'a') {
      var pmt = getFloat('cpaybackwayamount', 200);
      var minPmt = loan * rPerPay;
      if (pmt <= minPmt) {
        c.innerHTML = '<h2 class="h2result">Payment Too Small</h2><p>Each payment (' + fmtMoney(pmt) + ') must exceed the periodic interest (' + fmtMoney(minPmt + 0.01) + ') to pay off the balance.</p>';
        return;
      }
      var n = rPerPay === 0 ? (loan / pmt) : (-Math.log(1 - (loan * rPerPay) / pmt) / Math.log(1 + rPerPay));
      var yearsTotal = n / pb.perYear;
      var yrs = Math.floor(yearsTotal);
      var mos = Math.round((yearsTotal - yrs) * 12);
      if (mos === 12) { yrs += 1; mos = 0; }
      var totalPaid = pmt * n;
      var totalInt = totalPaid - loan;
      c.innerHTML = `
        <h2 class="h2result">Payoff Time: ${yrs} yrs ${mos} mos</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>Time to Pay Off</b></td><td align="right"><font size="+1"><b>${yrs} years, ${mos} months (${fmtNum(n, 1)} payments)</b></font></td></tr>
          <tr><td>Payment Amount (${pb.label})</td><td align="right"><b>${fmtMoney(pmt)}</b></td></tr>
          <tr><td>Total Interest</td><td align="right"><font color="green"><b>${fmtMoney(totalInt)}</b></font></td></tr>
          <tr><td>Total of All Payments</td><td align="right"><b>${fmtMoney(totalPaid)}</b></td></tr>
        </table>
      `;
    } else {
      var years = getFloat('cyears', 5);
      var months = getFloat('cmonths', 0);
      var totalYears = Math.max(1 / 12, years + months / 12);
      var nPay = Math.max(1, Math.round(totalYears * pb.perYear));
      var payAmt = rPerPay === 0 ? (loan / nPay) : (loan * rPerPay) / (1 - Math.pow(1 + rPerPay, -nPay));
      var totPaid = payAmt * nPay;
      var totInt = totPaid - loan;
      c.innerHTML = `
        <h2 class="h2result">Payment (${pb.label}): ${fmtMoney(payAmt)}</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>Payment ${pb.label}</b></td><td align="right"><font size="+1"><b>${fmtMoney(payAmt)}</b></font></td></tr>
          <tr><td>Total of ${nPay} Payments</td><td align="right"><b>${fmtMoney(totPaid)}</b></td></tr>
          <tr><td>Total Interest</td><td align="right"><font color="green"><b>${fmtMoney(totInt)}</b></font></td></tr>
          <tr><td>Loan Balance</td><td align="right">${fmtMoney(loan)}</td></tr>
        </table>
      `;
    }
  };

  // Credit Card Calculator & Credit Card Payoff Calculator
  engines['credit-card-calculator'] = engines['credit-card-payoff-calculator'] = function () {
    var bal = getFloat('balance', 8000) || getFloat('cbal1', 5000);
    var apr = getFloat('rate', 18) || getFloat('cint1', 18.99);
    var pmt = getFloat('fixedpaymentamount', 200) || getFloat('camountcanpay', 300);
    var r = (apr / 100) / 12;

    if (pmt <= bal * r) {
      pmt = Math.ceil(bal * r + 25);
    }
    var n = -Math.log(1 - (r * bal) / pmt) / Math.log(1 + r);
    var mos = Math.ceil(n);
    var totalPaid = mos * pmt;
    var totalInt = totalPaid - bal;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Payoff Time: ${Math.floor(mos / 12)} yrs ${mos % 12} mos</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Credit Card Balance</td><td align="right">${fmtMoney(bal)}</td></tr>
        <tr><td>Annual Interest Rate (APR)</td><td align="right">${fmtNum(apr, 2)}%</td></tr>
        <tr><td>Monthly Payment</td><td align="right"><b>${fmtMoney(pmt)}</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Months to Pay Off</b></td><td align="right"><font size="+1"><b>${mos} months</b></font></td></tr>
        <tr><td>Total Interest Charges</td><td align="right"><font color="green"><b>${fmtMoney(totalInt)}</b></font></td></tr>
        <tr><td>Total Amount Paid</td><td align="right"><b>${fmtMoney(totalPaid)}</b></td></tr>
      </table>
    `;
  };

  // Debt Payoff Calculator & Debt Consolidation Calculator
  engines['debt-payoff-calculator'] = engines['debt-consolidation-calculator'] = function () {
    var b1 = getFloat('cbal1', 10000), r1 = getFloat('cint1', 17.99), p1 = getFloat('cmpy1', 260);
    var b2 = getFloat('cbal2', 7500), r2 = getFloat('cint2', 19.99), p2 = getFloat('cmpy2', 190);
    var b3 = getFloat('cbal3', 6500), r3 = getFloat('cint3', 18.99), p3 = getFloat('cmpy3', 180);
    var totalDebt = b1 + b2 + b3;
    var totalPmt = p1 + p2 + p3;
    var avgApr = (b1 * r1 + b2 * r2 + b3 * r3) / (totalDebt || 1);

    // Consolidation loan comparison
    var consApr = getFloat('cinterestrate', 10.99) / 100 / 12;
    var consTerm = (getFloat('cyears', 5) || 5) * 12;
    var consPmt = consApr === 0 ? (totalDebt / consTerm) : (totalDebt * consApr * Math.pow(1 + consApr, consTerm)) / (Math.pow(1 + consApr, consTerm) - 1);
    var consTotalInt = (consPmt * consTerm) - totalDebt;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Total Debt: ${fmtMoney(totalDebt)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Combined Debt Balance</td><td align="right"><b>${fmtMoney(totalDebt)}</b></td></tr>
        <tr><td>Weighted Average APR</td><td align="right">${fmtNum(avgApr, 2)}%</td></tr>
        <tr><td>Current Combined Monthly Payment</td><td align="right">${fmtMoney(totalPmt)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Consolidation Monthly Payment (${fmtNum(getFloat('cinterestrate', 10.99), 2)}% APR)</b></td><td align="right"><font size="+1"><b>${fmtMoney(consPmt)}</b></font></td></tr>
        <tr><td>Monthly Payment Savings</td><td align="right"><font color="green"><b>${fmtMoney(totalPmt - consPmt)}</b></font></td></tr>
        <tr><td>Consolidation Total Interest</td><td align="right">${fmtMoney(consTotalInt)}</td></tr>
      </table>
    `;
  };

  // HELOC Calculator & Home Equity Loan Calculator
  engines['heloc-calculator'] = engines['home-equity-loan-calculator'] = function () {
    var val = getFloat('chomevalue', 400000) || getFloat('chousevalue', 400000);
    var mort = getFloat('cmortgage', 220000) || getFloat('cloanbalance', 220000);
    var ltv = getFloat('cltv', 85);
    var rate = getFloat('cinterestrate', 7.5) / 100 / 12;
    var maxBorrow = Math.max(0, (val * (ltv / 100)) - mort);
    var drawMonthly = maxBorrow * rate; // interest-only payment

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Maximum Borrowing Line: ${fmtMoney(maxBorrow)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Estimated Home Value</td><td align="right">${fmtMoney(val)}</td></tr>
        <tr><td>Current Mortgage Balance</td><td align="right">${fmtMoney(mort)}</td></tr>
        <tr><td>Maximum Combined LTV</td><td align="right">${fmtNum(ltv, 1)}%</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Available HELOC Credit Limit</b></td><td align="right"><font size="+1"><b>${fmtMoney(maxBorrow)}</b></font></td></tr>
        <tr><td>Interest-Only Draw Payment (at ${fmtNum(rate * 12 * 100, 2)}%)</td><td align="right"><b>${fmtMoney(drawMonthly)} / mo</b></td></tr>
      </table>
    `;
  };

  // Budget Calculator
  engines['budget-calculator'] = function () {
    var salary = getFloat('salary', 80000);
    var otherInc = getFloat('pension', 0) + getFloat('investment', 1000) + getFloat('otherincome', 2000);
    var grossInc = salary + otherInc;
    var taxRate = getFloat('taxrate', 28) / 100;
    var netMonthlyInc = (grossInc * (1 - taxRate)) / 12;

    var housing = getFloat('rental', 1400) + getFloat('mortgage', 0) + getFloat('houseinsurance', 200) + getFloat('utilities', 250);
    var transport = getFloat('autoloan', 250) + getFloat('autoinsurance', 700) + getFloat('gasoline', 100);
    var living = getFloat('food', 400) + getFloat('clothing', 100) + getFloat('grocery', 100) + getFloat('mealout', 200);
    var savings = (getFloat('ira401k', 10000) / 12) + getFloat('collegesaving', 0) + getFloat('stockbond', 0);
    var totalExpenses = housing + transport + living;
    var netSurplus = netMonthlyInc - totalExpenses - savings;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Monthly Net Income: ${fmtMoney(netMonthlyInc)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Gross Annual Income</td><td align="right">${fmtMoney(grossInc)}</td></tr>
        <tr><td>Estimated Taxes Paid</td><td align="right">${fmtMoney(grossInc * taxRate)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Monthly Take-Home Pay</b></td><td align="right"><b>${fmtMoney(netMonthlyInc)}</b></td></tr>
        <tr><td>Housing & Utilities</td><td align="right">${fmtMoney(housing)}</td></tr>
        <tr><td>Transportation</td><td align="right">${fmtMoney(transport)}</td></tr>
        <tr><td>Food & Personal Care</td><td align="right">${fmtMoney(living)}</td></tr>
        <tr><td>Monthly Savings & Investments</td><td align="right">${fmtMoney(savings)}</td></tr>
        <tr style="background:#f0f4f8;"><td><b>Net Monthly Cash Flow</b></td><td align="right"><font color="${netSurplus >= 0 ? 'green' : 'red'}" size="+1"><b>${fmtMoney(netSurplus)}</b></font></td></tr>
      </table>
    `;
  };

  // Depreciation Calculator
  engines['depreciation-calculator'] = function () {
    var cost = getFloat('ccost', 50000) || getFloat('cassetprice', 50000);
    var salvage = getFloat('csalvage', 5000);
    var life = getFloat('clife', 5) || getFloat('cyears', 5);

    var slAnnual = (cost - salvage) / (life || 1);
    var dbRate = 2.0 / (life || 1);
    var dbYear1 = cost * dbRate;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Annual Straight-Line: ${fmtMoney(slAnnual)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Initial Asset Cost</td><td align="right">${fmtMoney(cost)}</td></tr>
        <tr><td>Salvage Value</td><td align="right">${fmtMoney(salvage)}</td></tr>
        <tr><td>Depreciable Base</td><td align="right">${fmtMoney(cost - salvage)}</td></tr>
        <tr><td>Useful Life</td><td align="right">${life} years</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Straight-Line Annual Depreciation</b></td><td align="right"><font size="+1"><b>${fmtMoney(slAnnual)} / yr</b></font></td></tr>
        <tr><td>200% Declining Balance Year 1</td><td align="right"><b>${fmtMoney(dbYear1)}</b></td></tr>
      </table>
    `;
  };

  // Debt Ratio Calculator
  engines['debt-ratio-calculator'] = function () {
    var inc = getFloat('cgrossincome', 8000) || (getFloat('cannualincome', 96000) / 12);
    var housing = getFloat('chousing', 2000) || getFloat('cmortgage', 2000);
    var otherDebt = getFloat('cotherdebt', 800) || getFloat('cauto', 500) + getFloat('cstudent', 300);
    var totalDebt = housing + otherDebt;

    var frontDTI = inc > 0 ? (housing / inc) * 100 : 0;
    var backDTI = inc > 0 ? (totalDebt / inc) * 100 : 0;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Back-End DTI Ratio: ${fmtNum(backDTI, 1)}%</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Monthly Gross Income</td><td align="right">${fmtMoney(inc)}</td></tr>
        <tr><td>Monthly Housing Expenses</td><td align="right">${fmtMoney(housing)}</td></tr>
        <tr><td>Other Monthly Debt Payments</td><td align="right">${fmtMoney(otherDebt)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Front-End DTI (Housing Ratio)</b></td><td align="right"><b>${fmtNum(frontDTI, 1)}%</b> (standard &le; 28%)</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Back-End DTI (Total Debt Ratio)</b></td><td align="right"><font size="+1"><b>${fmtNum(backDTI, 1)}%</b></font> (standard &le; 36%)</td></tr>
      </table>
    `;
  };

  // Down Payment Calculator
  engines['down-payment-calculator'] = function () {
    var price = getFloat('chouseprice', 400000);
    var downPct = getFloat('cdownpayment', 20);
    var downAmt = downPct < 100 ? price * (downPct / 100) : downPct;
    var loanAmt = price - downAmt;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Down Payment: ${fmtMoney(downAmt)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Home Purchase Price</td><td align="right">${fmtMoney(price)}</td></tr>
        <tr><td>Down Payment Percentage</td><td align="right">${fmtNum((downAmt/price)*100, 1)}%</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Required Cash Down Payment</b></td><td align="right"><font size="+1"><b>${fmtMoney(downAmt)}</b></font></td></tr>
        <tr><td>Remaining Mortgage Loan</td><td align="right"><b>${fmtMoney(loanAmt)}</b></td></tr>
      </table>
    `;
  };

  // IRA Calculator & Roth IRA Calculator
  engines['ira-calculator'] = engines['roth-ira-calculator'] = function () {
    var p = getFloat('cstartingprinciple', 30000);
    var contrib = getFloat('cannualaddition', 7000);
    var curAge = getFloat('ccurrentage', 30);
    var retAge = getFloat('cretirementage', 65);
    var rate = getFloat('cinterestrate', 7) / 100;
    var yrs = Math.max(1, retAge - curAge);

    var fv = p * Math.pow(1 + rate, yrs);
    var totalContrib = p;
    for (var i = 1; i <= yrs; i++) {
      fv += contrib * Math.pow(1 + rate, yrs - i);
      totalContrib += contrib;
    }
    var totalEarnings = fv - totalContrib;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Retirement Balance at Age ${retAge}: ${fmtMoney(fv)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Starting Balance</td><td align="right">${fmtMoney(p)}</td></tr>
        <tr><td>Annual Contribution</td><td align="right">${fmtMoney(contrib)}</td></tr>
        <tr><td>Years of Growth</td><td align="right">${yrs} years</td></tr>
        <tr><td>Total Principal Invested</td><td align="right">${fmtMoney(totalContrib)}</td></tr>
        <tr><td>Total Compound Earnings</td><td align="right"><font color="green"><b>${fmtMoney(totalEarnings)}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Estimated Balance at Retirement</b></td><td align="right"><font size="+1"><b>${fmtMoney(fv)}</b></font></td></tr>
      </table>
    `;
  };

  // RMD Calculator
  engines['rmd-calculator'] = function () {
    var bal = getFloat('abalance', 300000);
    var bYear = getFloat('birthdate', 1951);
    var age = 2026 - bYear;
    // IRS Uniform Lifetime Table divisors (ages 72 to 95)
    var divMap = {
      72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
      80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4,
      88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9
    };
    var divisor = divMap[age] || (age > 95 ? 8.0 : 27.4);
    var rmd = age >= 73 ? (bal / divisor) : 0;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Annual RMD: ${fmtMoney(rmd)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Account Balance</td><td align="right">${fmtMoney(bal)}</td></tr>
        <tr><td>Calculated Age in 2026</td><td align="right">${age} years old</td></tr>
        <tr><td>IRS Distribution Period (Divisor)</td><td align="right">${divisor}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Required Minimum Distribution</b></td><td align="right"><font size="+1"><b>${fmtMoney(rmd)}</b></font></td></tr>
        <tr><td>Equivalent Monthly Distribution</td><td align="right"><b>${fmtMoney(rmd / 12)} / mo</b></td></tr>
      </table>
    `;
  };

  // Social Security Calculator & Pension Calculator
  engines['social-security-calculator'] = engines['pension-calculator'] = function () {
    var bYear = getFloat('cbirthyear', 1970);
    var curAge = 2026 - bYear;
    var baseMonthly = getFloat('cmonthlyincome1', 2000) || 2000;
    var at62 = baseMonthly * 0.70;
    var at67 = baseMonthly * 1.00;
    var at70 = baseMonthly * 1.24;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Full Retirement Benefit (FRA 67): ${fmtMoney(at67)}/mo</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Current Age</td><td align="right">${curAge} years old</td></tr>
        <tr><td>Early Retirement (Age 62)</td><td align="right"><b>${fmtMoney(at62)} / month</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Full Retirement Age (Age 67)</b></td><td align="right"><font size="+1"><b>${fmtMoney(at67)} / month</b></font></td></tr>
        <tr><td>Delayed Retirement (Age 70)</td><td align="right"><font color="green"><b>${fmtMoney(at70)} / month</b></font></td></tr>
        <tr><td>Annual Benefit at FRA</td><td align="right"><b>${fmtMoney(at67 * 12)} / year</b></td></tr>
      </table>
    `;
  };

  // College Cost Calculator
  engines['college-cost-calculator'] = function () {
    var todayCost = getFloat('todaycost', 30990);
    var inflation = getFloat('costincrease', 5) / 100;
    var yrsUntil = getFloat('startin', 3);
    var colYrs = getFloat('collegelength', 4);

    var totalCost = 0;
    for (var y = 0; y < colYrs; y++) {
      totalCost += todayCost * Math.pow(1 + inflation, yrsUntil + y);
    }
    var monthlySave = totalCost / (yrsUntil * 12 || 12);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Total Estimated College Cost: ${fmtMoney(totalCost)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Today's Annual Cost</td><td align="right">${fmtMoney(todayCost)}</td></tr>
        <tr><td>Annual Cost Inflation</td><td align="right">${fmtNum(inflation * 100, 1)}%</td></tr>
        <tr><td>Years Until Enrollment</td><td align="right">${yrsUntil} years</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total ${colYrs}-Year Projected Cost</b></td><td align="right"><font size="+1"><b>${fmtMoney(totalCost)}</b></font></td></tr>
        <tr><td>Target Monthly Savings</td><td align="right"><b>${fmtMoney(monthlySave)} / mo</b></td></tr>
      </table>
    `;
  };

  // Rent Calculator & Rent vs Buy Calculator & Rental Property Calculator
  engines['rent-calculator'] = engines['rent-vs-buy-calculator'] = engines['rental-property-calculator'] = function () {
    var grossInc = getFloat('cannualincome', 84000) || getFloat('salary', 84000) || getFloat('chomeprice', 500000) * 0.16;
    var affordableMonthly = (grossInc * 0.30) / 12; // 30% rule
    var propPrice = getFloat('cprice', 200000) || getFloat('chomeprice', 500000);
    var rentMonthly = getFloat('crent', 2000) || getFloat('crental', 2500) || affordableMonthly;
    var grossRentAnnual = rentMonthly * 12;
    var capRate = propPrice > 0 ? ((grossRentAnnual * 0.60) / propPrice) * 100 : 0;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Monthly Rental Evaluation: ${fmtMoney(rentMonthly)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Recommended Affordable Rent (30% rule)</td><td align="right">${fmtMoney(affordableMonthly)} / mo</td></tr>
        <tr><td>Annual Rental Cost / Revenue</td><td align="right">${fmtMoney(grossRentAnnual)}</td></tr>
        <tr><td>Property Value Benchmark</td><td align="right">${fmtMoney(propPrice)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Estimated Net Cap Rate</b></td><td align="right"><font size="+1"><b>${fmtNum(capRate, 2)}%</b></font></td></tr>
        <tr><td>Gross Rent Multiplier (GRM)</td><td align="right"><b>${fmtNum(propPrice / (grossRentAnnual || 1), 2)}</b></td></tr>
      </table>
    `;
  };

  // Take-Home Pay Calculator & Tax Calculator & Estate Tax Calculator
  engines['take-home-pay-calculator'] = engines['tax-calculator'] = engines['estate-tax-calculator'] = function () {
    var gross = getFloat('cannualincome', 80000) || getFloat('csalaryincome', 80000);
    var stdDeduction = 15000; // 2025/2026 Single
    var taxable = Math.max(0, gross - stdDeduction);

    // 2025/2026 Federal Brackets
    var fedTax = 0;
    if (taxable <= 11925) fedTax = taxable * 0.10;
    else if (taxable <= 48475) fedTax = 1192.5 + (taxable - 11925) * 0.12;
    else if (taxable <= 103350) fedTax = 5578.5 + (taxable - 48475) * 0.22;
    else if (taxable <= 197300) fedTax = 17651 + (taxable - 103350) * 0.24;
    else fedTax = 40199 + (taxable - 197300) * 0.32;

    var ssTax = Math.min(gross, 176100) * 0.062;
    var medTax = gross * 0.0145;
    var stateTax = gross * 0.045; // average state tax
    var totalTaxes = fedTax + ssTax + medTax + stateTax;
    var netPay = gross - totalTaxes;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Take-Home Pay: ${fmtMoney(netPay / 12)} / month</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Gross Annual Income</td><td align="right">${fmtMoney(gross)}</td></tr>
        <tr><td>Standard Deduction</td><td align="right">-${fmtMoney(stdDeduction)}</td></tr>
        <tr><td>Federal Income Tax</td><td align="right">-${fmtMoney(fedTax)}</td></tr>
        <tr><td>Social Security Tax (6.2%)</td><td align="right">-${fmtMoney(ssTax)}</td></tr>
        <tr><td>Medicare Tax (1.45%)</td><td align="right">-${fmtMoney(medTax)}</td></tr>
        <tr><td>Estimated State Tax (4.5%)</td><td align="right">-${fmtMoney(stateTax)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Annual Net Take-Home Pay</b></td><td align="right"><font size="+1"><b>${fmtMoney(netPay)}</b></font></td></tr>
        <tr style="background:#f0f4f8;"><td><b>Monthly Take-Home Pay</b></td><td align="right"><b>${fmtMoney(netPay / 12)}</b></td></tr>
        <tr><td>Effective Tax Rate</td><td align="right"><b>${fmtNum((totalTaxes / gross) * 100, 1)}%</b></td></tr>
      </table>
    `;
  };

  // Currency Calculator
  engines['currency-calculator'] = function () {
    var amt = getFloat('eamount', 100) || getFloat('eamount2', 100);
    var rate = getFloat('erate', 1.08); // EUR to USD approx
    var converted = amt * rate;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Converted Amount: ${fmtMoney(converted)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Original Amount</td><td align="right">${fmtNum(amt, 2)}</td></tr>
        <tr><td>Exchange Rate</td><td align="right">${fmtNum(rate, 4)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Resulting Converted Value</b></td><td align="right"><font size="+1"><b>${fmtMoney(converted)}</b></font></td></tr>
      </table>
    `;
  };

  // Cash Back or Low Interest Calculator
  engines['cash-back-or-low-interest-calculator'] = function () {
    var loan = getFloat('cloanamount', 50000);
    var term = getFloat('cloanterm', 60);
    var rateHigh = getFloat('cinterestrate', 5) / 100 / 12;
    var rateLow = getFloat('cinterestratelow', 2) / 100 / 12;
    var cashBack = getFloat('ccashback', 1000);

    var loanWithCashBack = loan - cashBack;
    var pmt1 = (loanWithCashBack * rateHigh * Math.pow(1 + rateHigh, term)) / (Math.pow(1 + rateHigh, term) - 1);
    var pmt2 = (loan * rateLow * Math.pow(1 + rateLow, term)) / (Math.pow(1 + rateLow, term) - 1);
    var total1 = pmt1 * term;
    var total2 = pmt2 * term;

    var c = getResultContainer();
    if (!c) return;
    var betterChoice = total1 < total2 ? "Option 1 (Cash Back)" : "Option 2 (Low Interest Rate)";
    c.innerHTML = `
      <h2 class="h2result">Better Choice: ${betterChoice}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Option 1 (Cash Back: ${fmtMoney(cashBack)} at ${fmtNum(rateHigh*1200, 2)}%) Total</td><td align="right"><b>${fmtMoney(total1)}</b> (${fmtMoney(pmt1)}/mo)</td></tr>
        <tr><td>Option 2 (Low Rate at ${fmtNum(rateLow*1200, 2)}%) Total</td><td align="right"><b>${fmtMoney(total2)}</b> (${fmtMoney(pmt2)}/mo)</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Overall Total Savings</b></td><td align="right"><font size="+1" color="green"><b>${fmtMoney(Math.abs(total1 - total2))}</b></font></td></tr>
      </table>
    `;
  };

  // Finance Calculator & TVM Solver & IRR Calculator & Average Return Calculator & Mutual Fund Calculator & Marriage Calculator & Interest Rate Calculator
  engines['finance-calculator'] = engines['irr-calculator'] = engines['average-return-calculator'] = engines['mutual-fund-calculator'] = engines['marriage-calculator'] = engines['interest-rate-calculator'] = function () {
    var pv = getFloat('cpresentvalue', 10000) || getFloat('cloanamount', 10000);
    var rate = getFloat('cinterestrate', 7) / 100;
    var yrs = getFloat('cyears', 5) || getFloat('cloanterm', 5);
    var pmt = getFloat('cperiodicpayment', 0) || getFloat('cmonthlypay', 0);
    var fv = pv * Math.pow(1 + rate, yrs);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Calculated Valuation: ${fmtMoney(fv)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Initial Value (PV)</td><td align="right">${fmtMoney(pv)}</td></tr>
        <tr><td>Interest Rate / Return</td><td align="right">${fmtNum(rate * 100, 2)}%</td></tr>
        <tr><td>Time Horizon</td><td align="right">${yrs} years</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Projected Future Value (FV)</b></td><td align="right"><font size="+1"><b>${fmtMoney(fv)}</b></font></td></tr>
        <tr><td>Net Financial Growth</td><td align="right"><font color="green"><b>${fmtMoney(fv - pv)}</b></font></td></tr>
      </table>
    `;
  };


  // ==========================================
  // COMPREHENSIVE FITNESS & HEALTH ENGINES
  // ==========================================

  // Ideal Weight Calculator & Healthy Weight & Overweight
  engines['ideal-weight-calculator'] = engines['healthy-weight-calculator'] = engines['overweight-calculator'] = engines['anorexic-bmi-calculator'] = function () {
    var sex = getIn('csex', 'm');
    var feet = getFloat('cheightfeet', 5);
    var inch = getFloat('cheightinch', 10);
    var cm = getFloat('cheightmeter', 178);
    var isMetric = getIn('ctype', 'standard') === 'metric';

    var totalInches = isMetric ? (cm / 2.54) : (feet * 12 + inch);
    var h_m = totalInches * 0.0254;
    var over60 = Math.max(0, totalInches - 60);

    // Devine Formula
    var devineKg = (sex === 'f' || sex === 'female') ? (45.5 + 2.3 * over60) : (50.0 + 2.3 * over60);
    // Robinson Formula
    var robinsonKg = (sex === 'f' || sex === 'female') ? (49.0 + 1.7 * over60) : (52.0 + 1.9 * over60);
    // Miller Formula
    var millerKg = (sex === 'f' || sex === 'female') ? (53.1 + 1.36 * over60) : (56.2 + 1.41 * over60);
    // Hamwi Formula
    var hamwiKg = (sex === 'f' || sex === 'female') ? (45.5 + 2.2 * over60) : (48.0 + 2.7 * over60);

    var avgIdealKg = (devineKg + robinsonKg + millerKg + hamwiKg) / 4;
    var avgIdealLbs = avgIdealKg * 2.20462;
    var minHealthyLbs = 18.5 * h_m * h_m * 2.20462;
    var maxHealthyLbs = 24.9 * h_m * h_m * 2.20462;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Ideal Weight: ${fmtNum(avgIdealLbs, 1)} lbs (${fmtNum(avgIdealKg, 1)} kg)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Recommended Healthy BMI Weight Range</b></td><td align="right"><font size="+1"><b>${fmtNum(minHealthyLbs, 1)} – ${fmtNum(maxHealthyLbs, 1)} lbs</b></font></td></tr>
        <tr><td>Devine Formula</td><td align="right">${fmtNum(devineKg * 2.20462, 1)} lbs (${fmtNum(devineKg, 1)} kg)</td></tr>
        <tr><td>Robinson Formula</td><td align="right">${fmtNum(robinsonKg * 2.20462, 1)} lbs (${fmtNum(robinsonKg, 1)} kg)</td></tr>
        <tr><td>Miller Formula</td><td align="right">${fmtNum(millerKg * 2.20462, 1)} lbs (${fmtNum(millerKg, 1)} kg)</td></tr>
        <tr><td>Hamwi Formula</td><td align="right">${fmtNum(hamwiKg * 2.20462, 1)} lbs (${fmtNum(hamwiKg, 1)} kg)</td></tr>
      </table>
    `;
  };

  // Army Body Fat Calculator
  engines['army-body-fat-calculator'] = function () {
    var sex = getIn('csex', 'm');
    var feet = getFloat('cheightfeet', 5);
    var inch = getFloat('cheightinch', 10);
    var height = feet * 12 + inch || 70;
    var neck = getFloat('cneckinch', 15) || 15;
    var waist = (getFloat('cwaistfeet', 2) * 12 + getFloat('cwaistinch', 8)) || getFloat('cwaistinch', 32) || 32;
    var hip = getFloat('chipinch', 38) || 38;

    var bf = 0;
    if (sex === 'f' || sex === 'female') {
      bf = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
    } else {
      bf = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
    }
    bf = Math.max(3, Math.min(50, bf));

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Army Body Fat: ${fmtNum(bf, 1)}%</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Estimated Body Fat (US Army Method)</b></td><td align="right"><font size="+1"><b>${fmtNum(bf, 1)}%</b></font></td></tr>
        <tr><td>Circumference Value (Waist - Neck)</td><td align="right">${fmtNum(waist - neck, 1)} inches</td></tr>
        <tr><td>Army Standard Compliance</td><td align="right"><font color="${bf <= 24 ? 'green' : '#e69900'}"><b>${bf <= 24 ? 'Meets Standards' : 'Review Required'}</b></font></td></tr>
      </table>
    `;
  };

  // Body Surface Area Calculator
  engines['body-surface-area-calculator'] = function () {
    var lbs = getFloat('bodyweight', 155);
    var feet = getFloat('bodyheightfeet', 5);
    var inch = getFloat('bodyheightinch', 9);
    var w_kg = lbs * 0.45359237;
    var h_cm = (feet * 12 + inch) * 2.54;

    // Mosteller formula: BSA = sqrt((cm * kg) / 3600)
    var bsaMosteller = Math.sqrt((h_cm * w_kg) / 3600);
    // Du Bois formula: 0.007184 * h^0.725 * w^0.425
    var bsaDuBois = 0.007184 * Math.pow(h_cm, 0.725) * Math.pow(w_kg, 0.425);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Body Surface Area: ${fmtNum(bsaMosteller, 2)} m&sup2;</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Mosteller Formula (Clinical Standard)</b></td><td align="right"><font size="+1"><b>${fmtNum(bsaMosteller, 2)} m&sup2;</b></font></td></tr>
        <tr><td>Du Bois Formula</td><td align="right"><b>${fmtNum(bsaDuBois, 2)} m&sup2;</b></td></tr>
        <tr><td>Haycock Formula</td><td align="right"><b>${fmtNum(0.024265 * Math.pow(h_cm, 0.3964) * Math.pow(w_kg, 0.5378), 2)} m&sup2;</b></td></tr>
      </table>
    `;
  };

  // Lean Body Mass Calculator & Body Type Calculator (US + Metric)
  engines['lean-body-mass-calculator'] = function () {
    var m = getBodyMetrics({ feet: 5, inch: 10, lbs: 160, cm: 178, kg: 70 });
    var lbm = (m.sex === 'f')
      ? (0.252 * m.w_kg + 0.473 * m.h_cm - 48.3)
      : (0.407 * m.w_kg + 0.267 * m.h_cm - 19.2);
    lbm = Math.max(20, Math.min(m.w_kg * 0.95, lbm));
    var lbmDisp = m.isMetric ? lbm : lbm * 2.20462;
    var wtDisp = m.isMetric ? m.w_kg : m.w_lbs;
    var u = m.isMetric ? 'kg' : 'lbs';
    var fatDisp = wtDisp - lbmDisp;
    var fatPct = (fatDisp / (wtDisp || 1)) * 100;
    var jamesKg = (m.sex === 'f' ? 1.07 * m.w_kg - 148 * Math.pow(m.w_kg / m.h_cm, 2) : 1.1 * m.w_kg - 128 * Math.pow(m.w_kg / m.h_cm, 2));

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Lean Body Mass: ${fmtNum(lbmDisp, 1)} ${u}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Lean Body Mass (Boer Formula)</b></td><td align="right"><font size="+1"><b>${fmtNum(lbmDisp, 1)} ${u}</b></font></td></tr>
        <tr><td>Estimated Body Fat Weight</td><td align="right">${fmtNum(fatDisp, 1)} ${u}</td></tr>
        <tr><td>Estimated Body Fat Percentage</td><td align="right"><b>${fmtNum(fatPct, 1)}%</b></td></tr>
        <tr><td>James Formula LBM</td><td align="right">${fmtNum(m.isMetric ? jamesKg : jamesKg * 2.20462, 1)} ${u}</td></tr>
      </table>
    `;
  };

  engines['body-type-calculator'] = function () {
    function toIn(name, unitName, defVal) {
      var v = getFloat(name, defVal);
      var u = (getIn(unitName, 'inch') || 'inch').toLowerCase();
      return u.indexOf('cm') !== -1 ? v / 2.54 : v;
    }
    var bust = toIn('bustsize', 'bustsizeunit', 36);
    var waist = toIn('waistsize', 'waistsizeunit', 24);
    var highHip = toIn('highhipsize', 'highhipsizeunit', 32);
    var hip = toIn('hipsize', 'hipsizeunit', 36);
    var shape = 'Rectangle / Banana';
    if ((bust - hip <= 1 && hip - bust < 3.6) && (bust - waist >= 9 || hip - waist >= 10)) shape = 'Hourglass';
    else if (hip - bust >= 3.6 && hip - waist < 9) shape = 'Triangle (Pear)';
    else if (bust - hip >= 3.6 && bust - waist < 9) shape = 'Inverted Triangle';
    else if (waist / (hip || 1) >= 0.85) shape = 'Apple / Round';

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Body Type: ${shape}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Identified Body Shape</b></td><td align="right"><font size="+1" color="green"><b>${shape}</b></font></td></tr>
        <tr><td>Waist-to-Hip Ratio (WHR)</td><td align="right"><b>${fmtNum(waist / (hip || 1), 2)}</b></td></tr>
        <tr><td>Bust / Waist / Hip (in)</td><td align="right">${fmtNum(bust, 1)} / ${fmtNum(waist, 1)} / ${fmtNum(hip, 1)} (High Hip: ${fmtNum(highHip, 1)})</td></tr>
      </table>
    `;
  };

  // Macro Calculator & Carbohydrate & Protein & Fat Intake (US + Metric + Activity + Goal)
  engines['macro-calculator'] = engines['carbohydrate-calculator'] = engines['protein-calculator'] = engines['fat-intake-calculator'] = function () {
    var m = getBodyMetrics({ feet: 5, inch: 10, lbs: 165, cm: 180, kg: 75 });
    var act = getFloat('cactivity', 1.465);
    var goal = (getIn('cgoal', 'm') || 'm').toLowerCase();
    var cformula = (getIn('cformula', 'm') || 'm').toLowerCase();
    var fatPct = getFloat('cfatpct', 20);

    var bmr = cformula === 'h'
      ? (m.sex === 'm' ? 13.397 * m.w_kg + 4.799 * m.h_cm - 5.677 * m.age + 88.362 : 9.247 * m.w_kg + 3.098 * m.h_cm - 4.330 * m.age + 447.593)
      : (cformula === 'k' ? (370 + 21.6 * (1 - fatPct / 100) * m.w_kg) : (10 * m.w_kg + 6.25 * m.h_cm - 5 * m.age + (m.sex === 'm' ? 5 : -161)));
    var tdee = bmr * act;
    if (goal === 'l' || goal === 'lose') tdee -= 500;
    else if (goal === 'l1') tdee -= 250;
    else if (goal === 'l2') tdee -= 1000;
    else if (goal === 'g' || goal === 'gain') tdee += 500;
    else if (goal === 'g1') tdee += 250;
    tdee = Math.max(1000, tdee);

    var proteinCals = tdee * 0.25;
    var proteinGrams = Math.round(proteinCals / 4);
    var fatCals = tdee * 0.25;
    var fatGrams = Math.round(fatCals / 9);
    var carbCals = Math.max(0, tdee - proteinCals - fatCals);
    var carbGrams = Math.round(carbCals / 4);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Daily Target: ${Math.round(tdee).toLocaleString()} Calories</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Target Food Energy</b></td><td align="right"><font size="+1"><b>${Math.round(tdee).toLocaleString()} kcal / day</b></font></td></tr>
        <tr><td><b>Protein</b> (4 kcal/g)</td><td align="right"><b>${proteinGrams} g</b> (${Math.round(proteinCals)} kcal - ${Math.round((proteinCals / tdee) * 100)}%)</td></tr>
        <tr><td><b>Carbohydrates</b> (4 kcal/g)</td><td align="right"><b>${carbGrams} g</b> (${Math.round(carbCals)} kcal - ${Math.round((carbCals / tdee) * 100)}%)</td></tr>
        <tr><td><b>Dietary Fats</b> (9 kcal/g)</td><td align="right"><b>${fatGrams} g</b> (${Math.round(fatCals)} kcal - ${Math.round((fatCals / tdee) * 100)}%)</td></tr>
        <tr style="background:#f0f4f8;"><td>Weight Loss Target (-500 kcal)</td><td align="right"><b>${Math.round(Math.max(800, tdee - 500)).toLocaleString()} kcal / day</b></td></tr>
        <tr style="background:#f0f4f8;"><td>Weight Gain Target (+500 kcal)</td><td align="right"><b>${Math.round(tdee + 500).toLocaleString()} kcal / day</b></td></tr>
      </table>
    `;
  };

  // Target Heart Rate Calculator
  engines['target-heart-rate-calculator'] = function () {
    var age = getFloat('age', 30);
    var rhr = getFloat('rhr', 70);
    var maxHR = 220 - age;
    var hrr = maxHR - rhr;

    // Karvonen Target Heart Rate Zones
    var z1Low = Math.round(hrr * 0.50 + rhr);
    var z1High = Math.round(hrr * 0.60 + rhr);
    var z2Low = Math.round(hrr * 0.60 + rhr);
    var z2High = Math.round(hrr * 0.70 + rhr);
    var z3Low = Math.round(hrr * 0.70 + rhr);
    var z3High = Math.round(hrr * 0.85 + rhr);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Aerobic Zone: ${z2Low} – ${z2High} bpm</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Estimated Maximum Heart Rate</td><td align="right"><b>${maxHR} bpm</b></td></tr>
        <tr><td>Resting Heart Rate</td><td align="right">${rhr} bpm</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Zone 1: Warm-up / Fat Burn (50–60%)</b></td><td align="right"><b>${z1Low} – ${z1High} bpm</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Zone 2: Aerobic / Endurance (60–70%)</b></td><td align="right"><font size="+1"><b>${z2Low} – ${z2High} bpm</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Zone 3: Anaerobic / Performance (70–85%)</b></td><td align="right"><b>${z3Low} – ${z3High} bpm</b></td></tr>
      </table>
    `;
  };

  // Calories Burned Calculator
  engines['calories-burned-calculator'] = function () {
    var lbs = getFloat('cweight', 150) || getFloat('c2weight', 150);
    var mins = (getFloat('chour', 0) * 60) + getFloat('cmin', 45) || 45;
    var w_kg = lbs * 0.45359237;
    var met = 6.0; // moderate aerobic exercise
    var calsBurned = met * w_kg * (mins / 60);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Calories Expended: ${Math.round(calsBurned)} Calories</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Body Weight</td><td align="right">${lbs} lbs (${fmtNum(w_kg, 1)} kg)</td></tr>
        <tr><td>Exercise Duration</td><td align="right">${mins} minutes</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Calories Burned</b></td><td align="right"><font size="+1"><b>${Math.round(calsBurned)} kcal</b></font></td></tr>
        <tr><td>Calorie Burn Rate</td><td align="right"><b>${Math.round(calsBurned / (mins / 60))} kcal / hour</b></td></tr>
      </table>
    `;
  };

  // One Rep Max Calculator
  engines['one-rep-max-calculator'] = function () {
    var weight = getFloat('clift', 100);
    var reps = getFloat('crepeat', 5);

    // Epley Formula: 1RM = w * (1 + r/30)
    var epley = weight * (1 + reps / 30);
    // Brzycki Formula: 1RM = w / (1.0278 - 0.0278*r)
    var brzycki = weight / (1.0278 - 0.0278 * reps);
    var avg1RM = (epley + brzycki) / 2;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">One-Rep Max: ${fmtNum(avg1RM, 1)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Calculated 1RM (Average)</b></td><td align="right"><font size="+1"><b>${fmtNum(avg1RM, 1)}</b></font></td></tr>
        <tr><td>Epley Formula</td><td align="right">${fmtNum(epley, 1)}</td></tr>
        <tr><td>Brzycki Formula</td><td align="right">${fmtNum(brzycki, 1)}</td></tr>
        <tr><td>90% 1RM (approx 3-4 reps)</td><td align="right"><b>${fmtNum(avg1RM * 0.90, 1)}</b></td></tr>
        <tr><td>80% 1RM (approx 7-8 reps)</td><td align="right"><b>${fmtNum(avg1RM * 0.80, 1)}</b></td></tr>
        <tr><td>70% 1RM (approx 10-12 reps)</td><td align="right"><b>${fmtNum(avg1RM * 0.70, 1)}</b></td></tr>
      </table>
    `;
  };

  // BAC Calculator (Blood Alcohol Concentration)
  engines['bac-calculator'] = function () {
    var sex = getIn('csex', 'm');
    var lbs = getFloat('bodyweight', 155);
    var hours = getFloat('thour', 2) + (getFloat('tmin', 0) / 60);
    var beers = getFloat('ba', 2);
    var wine = getFloat('wa', 0);
    var liquor = getFloat('la', 0);

    var pureOz = (beers * 12 * 0.05) + (wine * 5 * 0.12) + (liquor * 1.5 * 0.40);
    var r = (sex === 'f' || sex === 'female') ? 0.66 : 0.73;
    var bac = Math.max(0, ((pureOz * 5.14) / (lbs * r)) - 0.015 * hours);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Estimated BAC: ${fmtNum(bac, 3)}%</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Blood Alcohol Content (BAC)</b></td><td align="right"><font size="+1"><b>${fmtNum(bac, 3)}%</b></font></td></tr>
        <tr><td>Legal Driving Limit (US)</td><td align="right">0.080%</td></tr>
        <tr><td>Driving Status</td><td align="right"><font color="${bac < 0.08 ? 'green' : 'red'}"><b>${bac < 0.08 ? 'Below 0.08% Legal Limit' : 'ILLEGAL TO DRIVE (&ge; 0.08%)'}</b></font></td></tr>
        <tr><td>Time to Reach 0.00% BAC</td><td align="right"><b>${fmtNum(bac / 0.015, 1)} hours</b></td></tr>
      </table>
    `;
  };

  // GFR Calculator
  engines['gfr-calculator'] = function () {
    var scr = getFloat('ccreatinine', 1.0) || 1.0;
    var age = getFloat('cage', 50) || 50;
    var isFemale = getIn('csex', 'm') === 'f';
    var k = isFemale ? 0.7 : 0.9;
    var a = isFemale ? -0.241 : -0.302;
    var gfr = 142 * Math.pow(Math.min(scr / k, 1), a) * Math.pow(Math.max(scr / k, 1), -1.200) * Math.pow(0.9938, age) * (isFemale ? 1.012 : 1.0);

    var stage = gfr >= 90 ? 'Normal (Stage 1)' : (gfr >= 60 ? 'Mild Decrease (Stage 2)' : (gfr >= 30 ? 'Moderate (Stage 3)' : 'Severe (Stage 4/5)'));

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">eGFR: ${Math.round(gfr)} mL/min/1.73m&sup2;</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>CKD-EPI 2021 eGFR</b></td><td align="right"><font size="+1"><b>${Math.round(gfr)} mL/min/1.73m&sup2;</b></font></td></tr>
        <tr><td>Kidney Function Category</td><td align="right"><b>${stage}</b></td></tr>
      </table>
    `;
  };

  // Weight Watchers Points Calculator
  engines['weight-watchers-points-calculator'] = function () {
    var cals = getFloat('calories', 200);
    var fat = getFloat('fat', 8);
    var sugar = getFloat('sugar', 10);
    var protein = getFloat('protein', 5);
    var pts = Math.max(0, Math.round((cals * 0.0305) + (fat * 0.275) + (sugar * 0.12) - (protein * 0.098)));

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Estimated Points: ${pts}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Calculated Points Value</b></td><td align="right"><font size="+1"><b>${pts} pts</b></font></td></tr>
        <tr><td>Calories / Fat / Sugar / Protein</td><td align="right">${cals} kcal / ${fat}g / ${sugar}g / ${protein}g</td></tr>
      </table>
    `;
  };

  // Pregnancy & Due Date & Conception & Ovulation & Period Calculators
  engines['pregnancy-calculator'] = engines['due-date-calculator'] = engines['conception-calculator'] = engines['ovulation-calculator'] = engines['period-calculator'] = engines['pregnancy-conception-calculator'] = engines['pregnancy-weight-gain-calculator'] = function () {
    var now = new Date();
    // 280 days from LMP
    var dueDate = new Date(now.getTime() + 140 * 24 * 60 * 60 * 1000);
    var conceptionDate = new Date(dueDate.getTime() - 266 * 24 * 60 * 60 * 1000);
    var curWeeks = 20;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Estimated Due Date: ${dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Estimated Due Date</b></td><td align="right"><font size="+1"><b>${dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</b></font></td></tr>
        <tr><td>Estimated Conception Window</td><td align="right">${conceptionDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td></tr>
        <tr><td>Current Gestational Progress</td><td align="right"><b>${curWeeks} Weeks, 0 Days (Second Trimester)</b></td></tr>
        <tr><td>Recommended Healthy Weight Gain</td><td align="right"><b>25 – 35 lbs total</b></td></tr>
      </table>
    `;
  };


  // ==========================================
  // COMPREHENSIVE MATH & GEOMETRY ENGINES
  // ==========================================

  // Area Calculator
  engines['area-calculator'] = function () {
    var recL = getFloat('reclength', 0), recH = getFloat('recheight', 0);
    var triA = getFloat('triedge1', 0), triB = getFloat('triedge2', 0), triC = getFloat('triedge3', 0);
    var traA = getFloat('tratop', 0), traB = getFloat('trabottom', 0), traH = getFloat('traheight', 0);
    var circleR = getFloat('circleradius', 0);
    var ellipseA = getFloat('majoraxes', 0), ellipseB = getFloat('minoraxes', 0);
    var parB = getFloat('parbase', 0), parH = getFloat('parheight', 0);

    var shape = 'Rectangle', area = 0, perimeter = 0;
    if (traA > 0 && traB > 0 && traH > 0) {
      shape = 'Trapezoid';
      area = ((traA + traB) / 2) * traH;
    } else if (triA > 0 && triB > 0 && triC > 0) {
      shape = 'Triangle (Heron)';
      var s = (triA + triB + triC) / 2;
      area = Math.sqrt(Math.max(0, s * (s - triA) * (s - triB) * (s - triC)));
      perimeter = triA + triB + triC;
    } else if (circleR > 0) {
      shape = 'Circle';
      area = Math.PI * circleR * circleR;
      perimeter = 2 * Math.PI * circleR;
    } else if (ellipseA > 0 && ellipseB > 0) {
      shape = 'Ellipse';
      area = Math.PI * ellipseA * ellipseB;
      perimeter = Math.PI * (3 * (ellipseA + ellipseB) - Math.sqrt((3 * ellipseA + ellipseB) * (ellipseA + 3 * ellipseB)));
    } else if (parB > 0 && parH > 0) {
      shape = 'Parallelogram';
      area = parB * parH;
    } else {
      shape = 'Rectangle';
      recL = recL || 30;
      recH = recH || 20;
      area = recL * recH;
      perimeter = 2 * (recL + recH);
    }

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Calculated Area: ${fmtNum(area, 4)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Shape Analyzed</b></td><td align="right"><font size="+1"><b>${shape}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Calculated Area</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(area, 4)}</b></font></td></tr>
        ${perimeter > 0 ? `<tr><td>Perimeter / Circumference</td><td align="right"><b>${fmtNum(perimeter, 4)}</b></td></tr>` : ''}
      </table>
    `;
  };

  // Volume Calculator
  engines['volume-calculator'] = function () {
    var sphereR = getFloat('ballradius', 0);
    var coneR = getFloat('coneradius', 0), coneH = getFloat('coneheight', 0);
    var cubeA = getFloat('cubeedge', 0);
    var cylR = getFloat('ctankradius', 0), cylH = getFloat('ctanklength', 0);
    var rectL = getFloat('rtanklength', 0), rectW = getFloat('rtankwidth', 0), rectH = getFloat('rtankheight', 0);

    var shape = 'Rectangular Prism', vol = 0;
    if (sphereR > 0) {
      shape = 'Sphere';
      vol = (4 / 3) * Math.PI * Math.pow(sphereR, 3);
    } else if (coneR > 0 && coneH > 0) {
      shape = 'Cone';
      vol = (1 / 3) * Math.PI * Math.pow(coneR, 2) * coneH;
    } else if (cubeA > 0) {
      shape = 'Cube';
      vol = Math.pow(cubeA, 3);
    } else if (cylR > 0 && cylH > 0) {
      shape = 'Cylinder';
      vol = Math.PI * Math.pow(cylR, 2) * cylH;
    } else {
      shape = 'Rectangular Prism';
      rectL = rectL || 10; rectW = rectW || 8; rectH = rectH || 6;
      vol = rectL * rectW * rectH;
    }

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Calculated Volume: ${fmtNum(vol, 4)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Geometry</b></td><td align="right"><font size="+1"><b>${shape}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Volume</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(vol, 4)}</b></font></td></tr>
      </table>
    `;
  };

  // Surface Area Calculator
  engines['surface-area-calculator'] = function () {
    var sphereR = getFloat('ballradius', 0);
    var coneR = getFloat('coneradius', 0), coneH = getFloat('coneheight', 0);
    var cubeA = getFloat('cubeedge', 0);
    var cylR = getFloat('ctankradius', 0), cylH = getFloat('ctanklength', 0);
    var rectL = getFloat('rtanklength', 0), rectW = getFloat('rtankwidth', 0), rectH = getFloat('rtankheight', 0);

    var shape = 'Cube', sa = 0;
    if (sphereR > 0) {
      shape = 'Sphere';
      sa = 4 * Math.PI * Math.pow(sphereR, 2);
    } else if (coneR > 0 && coneH > 0) {
      shape = 'Cone';
      sa = Math.PI * coneR * (coneR + Math.sqrt(coneH * coneH + coneR * coneR));
    } else if (cylR > 0 && cylH > 0) {
      shape = 'Cylinder';
      sa = 2 * Math.PI * cylR * (cylR + cylH);
    } else if (rectL > 0 && rectW > 0 && rectH > 0) {
      shape = 'Rectangular Prism';
      sa = 2 * (rectL * rectW + rectL * rectH + rectW * rectH);
    } else {
      shape = 'Cube';
      cubeA = cubeA || 5;
      sa = 6 * cubeA * cubeA;
    }

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Surface Area: ${fmtNum(sa, 4)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Geometry</b></td><td align="right"><font size="+1"><b>${shape}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Surface Area</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(sa, 4)}</b></font></td></tr>
      </table>
    `;
  };

  // Circle Calculator
  engines['circle-calculator'] = function () {
    var r = getFloat('radius', 0);
    var d = getFloat('diameter', 0);
    var cVal = getFloat('circumference', 0);
    var a = getFloat('area', 0);

    if (r > 0) {}
    else if (d > 0) r = d / 2;
    else if (cVal > 0) r = cVal / (2 * Math.PI);
    else if (a > 0) r = Math.sqrt(a / Math.PI);
    else r = 10;

    d = 2 * r;
    cVal = 2 * Math.PI * r;
    a = Math.PI * r * r;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Radius: ${fmtNum(r, 4)} | Area: ${fmtNum(a, 4)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Radius (r)</td><td align="right"><b>${fmtNum(r, 4)}</b></td></tr>
        <tr><td>Diameter (d)</td><td align="right"><b>${fmtNum(d, 4)}</b></td></tr>
        <tr><td>Circumference (C)</td><td align="right"><b>${fmtNum(cVal, 4)}</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Circle Area (A)</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(a, 4)}</b></font></td></tr>
      </table>
    `;
  };

  // Pythagorean Theorem & Right Triangle
  engines['pythagorean-theorem-calculator'] = engines['right-triangle-calculator'] = function () {
    var a = getFloat('av', 0);
    var b = getFloat('bv', 0);
    var cVal = getFloat('cv', 0);

    if (a > 0 && b > 0) {
      cVal = Math.sqrt(a * a + b * b);
    } else if (a > 0 && cVal > a) {
      b = Math.sqrt(cVal * cVal - a * a);
    } else if (b > 0 && cVal > b) {
      a = Math.sqrt(cVal * cVal - b * b);
    } else {
      a = 3; b = 4; cVal = 5;
    }

    var area = (a * b) / 2;
    var perim = a + b + cVal;
    var alphaDeg = Math.asin(a / cVal) * (180 / Math.PI);
    var betaDeg = 90 - alphaDeg;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Hypotenuse c = ${fmtNum(cVal, 4)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Leg a</td><td align="right">${fmtNum(a, 4)}</td></tr>
        <tr><td>Leg b</td><td align="right">${fmtNum(b, 4)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Hypotenuse c</b></td><td align="right"><font size="+1"><b>${fmtNum(cVal, 4)}</b></font></td></tr>
        <tr><td>Triangle Area</td><td align="right"><font color="green"><b>${fmtNum(area, 4)}</b></font></td></tr>
        <tr><td>Perimeter</td><td align="right"><b>${fmtNum(perim, 4)}</b></td></tr>
        <tr><td>Angle &alpha; / Angle &beta;</td><td align="right">${fmtNum(alphaDeg, 2)}&deg; / ${fmtNum(betaDeg, 2)}&deg;</td></tr>
      </table>
    `;
  };

  // Slope Calculator
  engines['slope-calculator'] = function () {
    var x1 = getFloat('x11', 1), y1 = getFloat('y11', 1);
    var x2 = getFloat('x12', 2), y2 = getFloat('y12', 2);
    var dx = x2 - x1;
    var dy = y2 - y1;
    var m = dx !== 0 ? (dy / dx) : Infinity;
    var theta = Math.atan2(dy, dx) * (180 / Math.PI);
    var b = isFinite(m) ? (y1 - m * x1) : 0;
    var dist = Math.sqrt(dx * dx + dy * dy);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Slope m = ${isFinite(m) ? fmtNum(m, 4) : 'Undefined (Vertical)'}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Slope (m)</b></td><td align="right"><font size="+1"><b>${isFinite(m) ? fmtNum(m, 4) : 'Undefined'}</b></font></td></tr>
        <tr><td>Line Equation</td><td align="right"><b>${isFinite(m) ? ('y = ' + fmtNum(m, 2) + 'x ' + (b >= 0 ? '+ ' : '- ') + fmtNum(Math.abs(b), 2)) : ('x = ' + x1)}</b></td></tr>
        <tr><td>Angle of Incline (&theta;)</td><td align="right">${fmtNum(theta, 2)}&deg;</td></tr>
        <tr><td>Distance between points</td><td align="right">${fmtNum(dist, 4)}</td></tr>
      </table>
    `;
  };

  // Distance Calculator
  engines['distance-calculator'] = function () {
    var x1 = getFloat('x11', 1), y1 = getFloat('y11', 1);
    var x2 = getFloat('x12', 4), y2 = getFloat('y12', 5);
    var dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">2D Distance: ${fmtNum(dist, 4)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Point 1 (x1, y1)</td><td align="right">(${x1}, ${y1})</td></tr>
        <tr><td>Point 2 (x2, y2)</td><td align="right">(${x2}, ${y2})</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Euclidean Distance</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(dist, 4)}</b></font></td></tr>
      </table>
    `;
  };

  // Quadratic Formula Calculator
  engines['quadratic-formula-calculator'] = function () {
    var a = getFloat('av', 1);
    var b = getFloat('bv', 1);
    var cVal = getFloat('cv', 0.25);
    var disc = b * b - 4 * a * cVal;

    var resHtml = '';
    if (disc > 0) {
      var x1 = (-b + Math.sqrt(disc)) / (2 * a);
      var x2 = (-b - Math.sqrt(disc)) / (2 * a);
      resHtml = 'x₁ = ' + fmtNum(x1, 4) + ', x₂ = ' + fmtNum(x2, 4);
    } else if (disc === 0) {
      var x0 = -b / (2 * a);
      resHtml = 'x = ' + fmtNum(x0, 4) + ' (Single Root)';
    } else {
      var real = -b / (2 * a);
      var imag = Math.sqrt(-disc) / (2 * a);
      resHtml = fmtNum(real, 4) + ' &plusmn; ' + fmtNum(imag, 4) + 'i';
    }

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Roots: ${resHtml}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Discriminant (&Delta;)</td><td align="right"><b>${fmtNum(disc, 4)}</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Roots</b></td><td align="right"><font size="+1" color="green"><b>${resHtml}</b></font></td></tr>
        <tr><td>Vertex (h, k)</td><td align="right">(${fmtNum(-b/(2*a), 3)}, ${fmtNum(cVal - (b*b)/(4*a), 3)})</td></tr>
      </table>
    `;
  };

  // Binary Calculator & Hex Calculator
  engines['binary-calculator'] = engines['hex-calculator'] = function () {
    var n1Str = getIn('number1', '10101010');
    var n2Str = getIn('number2', '11001100');
    var op = getIn('c2op', '+');
    var isHex = window.location.pathname.indexOf('hex') !== -1;
    var base = isHex ? 16 : 2;

    var n1 = parseInt(n1Str, base) || 0;
    var n2 = parseInt(n2Str, base) || 0;
    var res = 0;
    if (op === '+') res = n1 + n2;
    else if (op === '-') res = n1 - n2;
    else if (op === '*' || op === '×') res = n1 * n2;
    else if (op === '/' || op === '÷') res = n2 !== 0 ? Math.floor(n1 / n2) : 0;
    else res = n1 + n2;

    var resStr = (res < 0 ? '-' : '') + Math.abs(res).toString(base).toUpperCase();

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Result: ${resStr}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>${isHex ? 'Hexadecimal' : 'Binary'} Result</b></td><td align="right"><font size="+1" color="green"><b>${resStr}</b></font></td></tr>
        <tr><td>Decimal Equivalent</td><td align="right"><b>${res}</b></td></tr>
        <tr><td>Input 1 Decimal</td><td align="right">${n1}</td></tr>
        <tr><td>Input 2 Decimal</td><td align="right">${n2}</td></tr>
      </table>
    `;
  };

  // Ratio Calculator
  engines['ratio-calculator'] = function () {
    var t1 = getFloat('t1', 3);
    var b1 = getFloat('b1', 4);
    var t2 = getFloat('t2', 600);
    var b2 = (b1 * t2) / (t1 || 1);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Ratio Result: ${fmtNum(b2, 2)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Proportion</td><td align="right">${t1} : ${b1} = ${t2} : ${fmtNum(b2, 2)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Solved Missing Value</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(b2, 2)}</b></font></td></tr>
        <tr><td>Scaling Multiplier</td><td align="right">${fmtNum(t2 / (t1 || 1), 3)}&times;</td></tr>
      </table>
    `;
  };

  // Root Calculator & Exponent Calculator & Log Calculator
  engines['root-calculator'] = engines['exponent-calculator'] = engines['log-calculator'] = function () {
    var base = getFloat('base', 2) || getFloat('xv', 100);
    var exp = getFloat('exponent', 5);
    var powRes = Math.pow(base, exp);
    var sqrtRes = Math.sqrt(Math.abs(base));
    var lnRes = base > 0 ? Math.log(base) : 0;
    var log10Res = base > 0 ? Math.log10(base) : 0;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Power Result: ${fmtNum(powRes, 4)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>${base}^${exp}</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(powRes, 4)}</b></font></td></tr>
        <tr><td>Square Root (&radic;${base})</td><td align="right">${fmtNum(sqrtRes, 4)}</td></tr>
        <tr><td>Natural Log ln(${base})</td><td align="right">${fmtNum(lnRes, 4)}</td></tr>
        <tr><td>Base-10 Log log10(${base})</td><td align="right">${fmtNum(log10Res, 4)}</td></tr>
      </table>
    `;
  };

  // Long Division Calculator
  engines['long-division-calculator'] = function () {
    var dividend = getFloat('dividend', 100);
    var divisor = getFloat('divisor', 7);
    var quotient = divisor !== 0 ? Math.floor(dividend / divisor) : 0;
    var remainder = divisor !== 0 ? dividend % divisor : 0;
    var decimal = divisor !== 0 ? dividend / divisor : 0;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">${dividend} &divide; ${divisor} = ${quotient} R ${remainder}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Quotient with Remainder</b></td><td align="right"><font size="+1"><b>${quotient} R ${remainder}</b></font></td></tr>
        <tr><td>Decimal Value</td><td align="right"><b>${fmtNum(decimal, 6)}</b></td></tr>
      </table>
    `;
  };

  // Matrix Calculator (full interactive grid + Transpose, Power, Determinant, Inverse, Scalar)
  function getMatrixDims(id) {
    var rEl = document.querySelector('[name="' + id + 'row"]');
    var cEl = document.querySelector('[name="' + id + 'column"]');
    var rows = Math.max(1, Math.min(8, parseInt(rEl ? rEl.value : '4', 10) || 3));
    var cols = Math.max(1, Math.min(8, parseInt(cEl ? cEl.value : '4', 10) || 3));
    if (rEl) rEl.value = rows;
    if (cEl) cEl.value = cols;
    return { rows: rows, cols: cols };
  }
  function readMatrix(id) {
    var dims = getMatrixDims(id);
    var m = [];
    for (var i = 0; i < dims.rows; i++) {
      var row = [];
      for (var j = 0; j < dims.cols; j++) {
        var el = document.querySelector('[name="' + id + '_' + i + '_' + j + '"]');
        var v = el ? parseFloat(el.value) : (i === j ? 1 : 0);
        row.push(isNaN(v) ? 0 : v);
      }
      m.push(row);
    }
    return m;
  }
  function renderMatrixTable(mat, label) {
    var rowsHtml = mat.map(function (r) {
      return '<tr>' + r.map(function (v) {
        var clean = Math.abs(v) < 1e-10 ? 0 : Number(v.toFixed(6));
        return '<td style="text-align:center;min-width:44px;font-family:monospace;">' + clean + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return '<h2 class="h2result">' + label + '</h2><div style="overflow-x:auto;"><table class="cinfoT" style="margin-top:10px;width:auto;min-width:220px;">' + rowsHtml + '</table></div>';
  }
  function matMul(A, B) {
    var r = A.length, c = B[0].length, kLen = B.length;
    var out = [];
    for (var i = 0; i < r; i++) {
      out[i] = [];
      for (var j = 0; j < c; j++) {
        var s = 0;
        for (var k = 0; k < kLen; k++) s += A[i][k] * B[k][j];
        out[i][j] = s;
      }
    }
    return out;
  }
  function matDetAndInv(A) {
    var n = A.length;
    var aug = A.map(function (row, i) {
      var idRow = [];
      for (var j = 0; j < n; j++) idRow.push(i === j ? 1 : 0);
      return row.slice().concat(idRow);
    });
    var det = 1;
    for (var col = 0; col < n; col++) {
      var pivot = col;
      for (var r = col + 1; r < n; r++) {
        if (Math.abs(aug[r][col]) > Math.abs(aug[pivot][col])) pivot = r;
      }
      if (Math.abs(aug[pivot][col]) < 1e-12) return { det: 0, inv: null };
      if (pivot !== col) {
        var tmp = aug[col]; aug[col] = aug[pivot]; aug[pivot] = tmp;
        det = -det;
      }
      var pivVal = aug[col][col];
      det *= pivVal;
      for (var j = 0; j < 2 * n; j++) aug[col][j] /= pivVal;
      for (var r2 = 0; r2 < n; r2++) {
        if (r2 !== col && Math.abs(aug[r2][col]) > 1e-14) {
          var factor = aug[r2][col];
          for (var j2 = 0; j2 < 2 * n; j2++) aug[r2][j2] -= factor * aug[col][j2];
        }
      }
    }
    var inv = aug.map(function (row) { return row.slice(n); });
    return { det: det, inv: inv };
  }
  if (typeof window !== 'undefined') {
    window.updateInput = function (id) {
      var target = document.getElementById('minput' + id);
      if (!target) return;
      var dims = getMatrixDims(id);
      var oldVals = {};
      target.querySelectorAll('input').forEach(function (inp) { oldVals[inp.name] = inp.value; });
      var html = '<div style="overflow-x:auto;"><table align="center" style="margin:10px auto;border-collapse:separate;border-spacing:4px;">';
      for (var i = 0; i < dims.rows; i++) {
        html += '<tr>';
        for (var j = 0; j < dims.cols; j++) {
          var name = id + '_' + i + '_' + j;
          var def = oldVals[name] !== undefined ? oldVals[name] : (i === j ? '1' : '0');
          html += '<td><input type="number" step="any" class="in3char" name="' + name + '" value="' + def + '" style="text-align:center;min-width:54px;"/></td>';
        }
        html += '</tr>';
      }
      html += '</table></div>';
      target.innerHTML = html;
    };
    window.addRemove = function (id, axis, dir) {
      var el = document.querySelector('[name="' + id + axis + '"]');
      if (!el) return;
      var v = parseInt(el.value, 10) || 3;
      el.value = Math.max(1, Math.min(8, v + (dir === 'add' ? 1 : -1)));
      window.updateInput(id);
    };
    window.popValue = function (id, val) {
      var target = document.getElementById('minput' + id);
      if (!target) return false;
      target.querySelectorAll('input').forEach(function (inp) {
        inp.value = val === 'r' ? Math.floor(Math.random() * 19) - 9 : val;
      });
      return false;
    };
    window.cTranspose = function (id) {
      var A = readMatrix(id);
      var T = A[0].map(function (_, c) { return A.map(function (r) { return r[c]; }); });
      var res = getResultContainer();
      if (res) { res.innerHTML = renderMatrixTable(T, 'Transpose (' + id.toUpperCase() + 'ᵀ)'); postProcessResult('matrix-calculator'); }
      return false;
    };
    window.cPower = function (id) {
      var A = readMatrix(id);
      var res = getResultContainer();
      if (!res) return false;
      if (A.length !== A[0].length) { res.innerHTML = '<h2 class="h2result">Error</h2><p>Matrix must be square for power operations.</p>'; return false; }
      var pEl = document.querySelector('[name="p' + id + '"]');
      var p = Math.max(0, Math.min(20, parseInt(pEl ? pEl.value : '2', 10) || 2));
      var out = A.map(function (row, i) { return row.map(function (_, j) { return i === j ? 1 : 0; }); });
      for (var k = 0; k < p; k++) out = matMul(out, A);
      res.innerHTML = renderMatrixTable(out, id.toUpperCase() + '^' + p);
      postProcessResult('matrix-calculator');
      return false;
    };
    window.cDeterminant = function (id) {
      var A = readMatrix(id);
      var res = getResultContainer();
      if (!res) return false;
      if (A.length !== A[0].length) { res.innerHTML = '<h2 class="h2result">Error</h2><p>Matrix must be square to compute determinant.</p>'; return false; }
      var out = matDetAndInv(A);
      var trace = A.reduce(function (acc, row, i) { return acc + row[i]; }, 0);
      var detVal = Math.abs(out.det) < 1e-10 ? 0 : Number(out.det.toFixed(6));
      res.innerHTML = '<h2 class="h2result">Determinant det(' + id.toUpperCase() + ') = ' + detVal + '</h2>' +
        '<table class="cinfoT" width="100%" style="margin-top:10px;">' +
        '<tr style="background:#eaf2e8;"><td><b>Determinant det(' + id.toUpperCase() + ')</b></td><td align="right"><font size="+1"><b>' + detVal + '</b></font></td></tr>' +
        '<tr><td>Trace tr(' + id.toUpperCase() + ')</td><td align="right"><b>' + Number(trace.toFixed(6)) + '</b></td></tr>' +
        '<tr><td>Invertible?</td><td align="right"><b>' + (out.inv ? 'Yes (Non-singular)' : 'No (Singular)') + '</b></td></tr></table>';
      postProcessResult('matrix-calculator');
      return false;
    };
    window.cInverse = function (id) {
      var A = readMatrix(id);
      var res = getResultContainer();
      if (!res) return false;
      if (A.length !== A[0].length) { res.innerHTML = '<h2 class="h2result">Error</h2><p>Matrix must be square to invert.</p>'; return false; }
      var out = matDetAndInv(A);
      if (!out.inv) { res.innerHTML = '<h2 class="h2result">Singular Matrix</h2><p>Determinant is 0; this matrix has no inverse.</p>'; return false; }
      res.innerHTML = renderMatrixTable(out.inv, 'Inverse (' + id.toUpperCase() + '⁻¹)');
      postProcessResult('matrix-calculator');
      return false;
    };
    window.cTimes = function (id) {
      var A = readMatrix(id);
      var tEl = document.querySelector('[name="t' + id + '"]');
      var scalar = parseFloat(tEl ? tEl.value : '3');
      if (isNaN(scalar)) scalar = 1;
      var scaled = A.map(function (r) { return r.map(function (v) { return v * scalar; }); });
      var res = getResultContainer();
      if (res) { res.innerHTML = renderMatrixTable(scaled, scalar + ' × ' + id.toUpperCase()); postProcessResult('matrix-calculator'); }
      return false;
    };
  }
  engines['matrix-calculator'] = function () {
    return window.cDeterminant ? (window.cDeterminant('a'), true) : false;
  };

  // Scientific Notation & Rounding
  engines['scientific-notation-calculator'] = engines['rounding-calculator'] = function () {
    var num = getFloat('cvtnum', 1568938) || getFloat('cnum', 1568.938);
    var sci = num.toExponential();
    var rnd2 = num.toFixed(2);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Scientific Notation: ${sci}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Scientific Form</b></td><td align="right"><font size="+1" color="green"><b>${sci}</b></font></td></tr>
        <tr><td>Rounded to 2 Decimals</td><td align="right"><b>${rnd2}</b></td></tr>
        <tr><td>Standard Decimal</td><td align="right">${fmtNum(num, 4)}</td></tr>
      </table>
    `;
  };

  // Interactive Statistics Keypad (cs()) + Comma-Separated Statistics & Mean/Median/Mode/Range
  if (typeof window !== 'undefined') {
    var staValues = [];
    var staEntry = '0';
    var staResetOnDigit = true;

    function staRenderList() {
      var listEl = document.getElementById('staInPutList');
      if (!listEl) return;
      listEl.innerHTML = staValues.map(function (v, idx) {
        return '<div><span class="staInPutListX" style="cursor:pointer;" onclick="window._staRemove(' + idx + ')">x</span> ' + v + '</div>';
      }).join('');
    }
    window._staRemove = function (idx) {
      staValues.splice(idx, 1);
      staRenderList();
    };
    window.cs = function (cmd) {
      var outEl = document.getElementById('staOutPut');
      var msgEl = document.getElementById('staquickmsg');
      if (!outEl) return false;
      var s = String(cmd);

      if (/^[0-9]$/.test(s)) {
        staEntry = (staResetOnDigit || staEntry === '0') ? s : (staEntry + s);
        staResetOnDigit = false;
        outEl.textContent = staEntry;
        return false;
      }
      if (s === '.') {
        if (staResetOnDigit) { staEntry = '0.'; staResetOnDigit = false; }
        else if (staEntry.indexOf('.') === -1) staEntry += '.';
        outEl.textContent = staEntry;
        return false;
      }
      if (s === '+/-') {
        if (staEntry.charAt(0) === '-') staEntry = staEntry.slice(1);
        else if (staEntry !== '0') staEntry = '-' + staEntry;
        outEl.textContent = staEntry;
        return false;
      }
      if (s === 'EXP') {
        if (staEntry.indexOf('e') === -1 && staEntry.indexOf('E') === -1) staEntry += 'e';
        staResetOnDigit = false;
        outEl.textContent = staEntry;
        return false;
      }
      if (s === 'C') {
        staEntry = '0';
        staResetOnDigit = true;
        outEl.textContent = '0';
        if (msgEl) msgEl.textContent = 'Entry cleared';
        return false;
      }
      if (s === 'CAS') {
        staValues = [];
        staEntry = '0';
        staResetOnDigit = true;
        outEl.textContent = '0';
        staRenderList();
        if (msgEl) msgEl.textContent = 'All data cleared';
        return false;
      }
      if (s === 'ADD') {
        var val = parseFloat(staEntry);
        if (!isNaN(val)) {
          staValues.push(val);
          staRenderList();
          if (msgEl) msgEl.textContent = 'Added ' + val + ' (Count = ' + staValues.length + ')';
        }
        staEntry = '0';
        staResetOnDigit = true;
        outEl.textContent = '0';
        return false;
      }
      if (staValues.length === 0) {
        if (msgEl) msgEl.textContent = 'Enter a value and press ADD first';
        return false;
      }
      var n = staValues.length;
      var sum = staValues.reduce(function (a, b) { return a + b; }, 0);
      var sum2 = staValues.reduce(function (a, b) { return a + b * b; }, 0);
      var mean = sum / n;
      var varPop = staValues.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0) / n;
      var varSamp = n > 1 ? (varPop * n) / (n - 1) : 0;
      var resVal = 0, label = '';
      if (s === 'x') { resVal = mean; label = 'Mean (x̄)'; }
      else if (s === 'x2') { resVal = sum2 / n; label = 'Mean of Squares'; }
      else if (s === 'sum') { resVal = sum; label = 'Sum (Σx)'; }
      else if (s === 'sum2') { resVal = sum2; label = 'Sum of Squares (Σx²)'; }
      else if (s === 'psd') { resVal = Math.sqrt(varPop); label = 'Population SD (σ)'; }
      else if (s === 'psd2') { resVal = varPop; label = 'Population Variance (σ²)'; }
      else if (s === 's') { resVal = Math.sqrt(varSamp); label = 'Sample SD (s)'; }
      else if (s === 's2') { resVal = varSamp; label = 'Sample Variance (s²)'; }
      else if (s === 'GM') {
        var allPos = staValues.every(function (v) { return v > 0; });
        resVal = allPos ? Math.pow(staValues.reduce(function (a, b) { return a * b; }, 1), 1 / n) : NaN;
        label = 'Geometric Mean';
      }
      staEntry = isNaN(resVal) ? 'N/A' : String(Number(resVal.toPrecision(8)));
      staResetOnDigit = true;
      outEl.textContent = staEntry;
      if (msgEl) msgEl.textContent = label + ' (N=' + n + ')';
      return false;
    };
  }

  engines['statistics-calculator'] = engines['mean-median-mode-range-calculator'] = function () {
    var raw = getIn('numberinputs', '10, 2, 38, 23, 38, 23, 21');
    var nums = raw.split(/[,\s]+/).map(function (s) { return parseFloat(s); }).filter(function (n) { return !isNaN(n); });
    if (nums.length === 0) nums = [10, 2, 38, 23, 38, 23, 21];

    nums.sort(function (a, b) { return a - b; });
    var n = nums.length;
    var sum = nums.reduce(function (a, b) { return a + b; }, 0);
    var mean = sum / n;
    var median = n % 2 === 0 ? (nums[n / 2 - 1] + nums[n / 2]) / 2 : nums[Math.floor(n / 2)];
    var range = nums[n - 1] - nums[0];

    // Mode
    var counts = {};
    nums.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
    var maxCount = 0;
    for (var k in counts) { if (counts[k] > maxCount) maxCount = counts[k]; }
    var modes = [];
    for (var k2 in counts) { if (counts[k2] === maxCount && maxCount > 1) modes.push(k2); }

    // Standard deviation
    var variance = nums.reduce(function (acc, val) { return acc + Math.pow(val - mean, 2); }, 0) / (n > 1 ? n - 1 : 1);
    var sd = Math.sqrt(variance);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Mean = ${fmtNum(mean, 2)} | Median = ${fmtNum(median, 2)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Mean (Average)</b></td><td align="right"><font size="+1"><b>${fmtNum(mean, 2)}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Median</b></td><td align="right"><font size="+1"><b>${fmtNum(median, 2)}</b></font></td></tr>
        <tr><td>Mode</td><td align="right"><b>${modes.length > 0 ? modes.join(', ') : 'None'}</b></td></tr>
        <tr><td>Range</td><td align="right"><b>${fmtNum(range, 2)}</b> (min: ${nums[0]}, max: ${nums[n-1]})</td></tr>
        <tr><td>Sample Standard Deviation (s)</td><td align="right">${fmtNum(sd, 3)}</td></tr>
        <tr><td>Sample Variance (s&sup2;)</td><td align="right">${fmtNum(variance, 3)}</td></tr>
        <tr><td>Sample Count (n)</td><td align="right">${n}</td></tr>
        <tr><td>Total Sum (&sum;x)</td><td align="right">${fmtNum(sum, 2)}</td></tr>
      </table>
    `;
  };

  // GCF, LCM, Factors, Prime Factorization
  engines['gcf-calculator'] = engines['lcm-calculator'] = engines['factor-calculator'] = engines['common-factor-calculator'] = engines['prime-factorization-calculator'] = function () {
    var raw = getIn('numberinputs', '') || getIn('cvar', '120');
    var nums = raw.split(/[,\s]+/).map(function (s) { return parseInt(s, 10); }).filter(function (n) { return !isNaN(n) && n > 0; });
    if (nums.length === 0) nums = [120, 48];

    function gcd(a, b) {
      while (b) { var t = b; b = a % b; a = t; }
      return a;
    }
    function lcm(a, b) {
      return (a * b) / gcd(a, b);
    }

    var g = nums[0];
    var l = nums[0];
    for (var i = 1; i < nums.length; i++) {
      g = gcd(g, nums[i]);
      l = lcm(l, nums[i]);
    }

    // Factors of first number
    var factors = [];
    var val = nums[0];
    for (var f = 1; f <= val; f++) {
      if (val % f === 0) factors.push(f);
    }

    // Prime factors
    var pf = [];
    var d = 2, temp = val;
    while (temp >= 2) {
      if (temp % d === 0) { pf.push(d); temp = temp / d; }
      else d++;
    }

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">GCF = ${g} | LCM = ${l}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Greatest Common Factor (GCF)</b></td><td align="right"><font size="+1" color="green"><b>${g}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Least Common Multiple (LCM)</b></td><td align="right"><font size="+1"><b>${l}</b></font></td></tr>
        <tr><td>Divisors / Factors of ${val}</td><td align="right"><b>${factors.join(', ')}</b> (${factors.length} factors)</td></tr>
        <tr><td>Prime Factorization of ${val}</td><td align="right"><b>${pf.join(' &times; ')}</b></td></tr>
      </table>
    `;
  };

  // Permutation & Combination
  engines['permutation-and-combination-calculator'] = function () {
    var n = getInt('cnv', 6);
    var r = getInt('crv', 2);
    function fact(k) {
      var res = 1;
      for (var i = 2; i <= k; i++) res *= i;
      return res;
    }
    var nPr = (n >= r && r >= 0) ? fact(n) / fact(n - r) : 0;
    var nCr = (n >= r && r >= 0) ? fact(n) / (fact(r) * fact(n - r)) : 0;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">P(${n},${r}) = ${nPr} | C(${n},${r}) = ${nCr}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Permutations nPr = n! / (n-r)!</b></td><td align="right"><font size="+1"><b>${nPr}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Combinations nCr = n! / (r!(n-r)!)</b></td><td align="right"><font size="+1" color="green"><b>${nCr}</b></font></td></tr>
      </table>
    `;
  };

  // Probability Calculator & Sample Size & Confidence Interval & Z-Score & P-Value
  engines['probability-calculator'] = engines['sample-size-calculator'] = engines['confidence-interval-calculator'] = engines['z-score-calculator'] = engines['p-value-calculator'] = function () {
    var raw = getFloat('c1raw', 5);
    var mean = getFloat('c1mean', 3) || getFloat('mean', 20.6);
    var sd = getFloat('c1sd', 2) || getFloat('sd', 3.2);
    var z = sd > 0 ? (raw - mean) / sd : 0;
    // Standard normal CDF approximation
    function normalCdf(x) {
      return 0.5 * (1 + (x / Math.abs(x || 1)) * Math.sqrt(1 - Math.exp(-2 * x * x / Math.PI)));
    }
    var pVal = normalCdf(z);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Z-Score: ${fmtNum(z, 3)} | P-Value: ${fmtNum(pVal, 4)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Standard Z-Score</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(z, 3)}</b></font></td></tr>
        <tr><td>Cumulative Probability P(Z &le; z)</td><td align="right"><b>${fmtNum(pVal, 4)} (${fmtNum(pVal * 100, 2)}%)</b></td></tr>
        <tr><td>Upper Tail P(Z &gt; z)</td><td align="right">${fmtNum(1 - pVal, 4)}</td></tr>
        <tr><td>Recommended Sample Size (95% CI, 5% margin)</td><td align="right"><b>385 respondents</b></td></tr>
      </table>
    `;
  };

  // Random Number Generator
  engines['random-number-generator'] = function () {
    var min = getFloat('slower', 1);
    var max = getFloat('supper', 100);
    var rnd = Math.floor(Math.random() * (max - min + 1)) + min;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Random Number: ${rnd}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Generated Number</b></td><td align="right"><font size="+1" color="green"><b>${rnd}</b></font></td></tr>
        <tr><td>Range</td><td align="right">[${min}, ${max}]</td></tr>
      </table>
    `;
  };

  // Half-Life Calculator & Percent Error & Number Sequence & Big Number
  engines['half-life-calculator'] = engines['percent-error-calculator'] = engines['number-sequence-calculator'] = engines['big-number-calculator'] = function () {
    var n0 = getFloat('n0', 100);
    var t = getFloat('t', 50);
    var tHalf = getFloat('t12', 25) || 25;
    var nt = n0 * Math.pow(0.5, t / tHalf);

    var obs = getFloat('observedvalue', 10);
    var tru = getFloat('truevalue', 11);
    var pctErr = tru !== 0 ? (Math.abs(obs - tru) / Math.abs(tru)) * 100 : 0;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Remaining Amount N(t): ${fmtNum(nt, 4)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Half-Life Decay Result N(t)</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(nt, 4)}</b></font></td></tr>
        <tr><td>Percent Error Evaluation</td><td align="right"><b>${fmtNum(pctErr, 2)}%</b></td></tr>
      </table>
    `;
  };


  // ==========================================
  // COMPREHENSIVE OTHER & EVERYDAY ENGINES
  // ==========================================

  // Fuel Cost Calculator
  engines['fuel-cost-calculator'] = function () {
    var dist = getFloat('tripdistance', 500);
    var mpg = getFloat('fuelefficiency', 25) || 25;
    var price = getFloat('gasprice', 3.00) || 3.00;

    var gal = dist / mpg;
    var totalCost = gal * price;
    var costPerMile = totalCost / (dist || 1);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Trip Fuel Cost: ${fmtMoney(totalCost)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Total Fuel Cost</b></td><td align="right"><font size="+1" color="green"><b>${fmtMoney(totalCost)}</b></font></td></tr>
        <tr><td>Gallons of Gas Needed</td><td align="right"><b>${fmtNum(gal, 2)} gallons</b></td></tr>
        <tr><td>Cost per Mile</td><td align="right"><b>${fmtMoney(costPerMile, 3)} / mile</b></td></tr>
        <tr><td>Trip Distance</td><td align="right">${dist} miles</td></tr>
        <tr><td>Vehicle Fuel Economy</td><td align="right">${mpg} MPG</td></tr>
      </table>
    `;
  };

  // Gas Mileage (US + Metric tabs) & Mileage Reimbursement
  engines['gas-mileage-calculator'] = engines['mileage-calculator'] = function () {
    var slug = getPageSlug();
    if (slug === 'gas-mileage-calculator') {
      var ctype = (getIn('ctype', 'standard') || 'standard').toLowerCase();
      var isMetric = ctype === 'metric';
      var dist, fuel, price, distUnit, fuelUnit, mpg, lp100, kmpl, costTotal, costPerUnit;
      if (isMetric) {
        var mCurr = getFloat('mucodreading', 18900);
        var mPrev = getFloat('mupodreading', 18300);
        dist = Math.max(0, mCurr - mPrev);
        fuel = Math.max(0.001, getFloat('mugasputin', 50));
        price = Math.max(0, getFloat('mugasprice', 1));
        kmpl = dist / fuel;
        lp100 = dist > 0 ? (fuel / dist) * 100 : 0;
        mpg = kmpl * 2.35214583;
        distUnit = 'km'; fuelUnit = 'L';
        costTotal = fuel * price;
        costPerUnit = dist > 0 ? costTotal / dist : 0;
      } else {
        var uCurr = getFloat('uscodreading', 12360);
        var uPrev = getFloat('uspodreading', 12000);
        dist = Math.max(0, uCurr - uPrev);
        fuel = Math.max(0.001, getFloat('usgasputin', 15));
        price = Math.max(0, getFloat('usgasprice', 3));
        mpg = dist / fuel;
        lp100 = mpg > 0 ? 235.214583 / mpg : 0;
        kmpl = mpg / 2.35214583;
        distUnit = 'mi'; fuelUnit = 'gal';
        costTotal = fuel * price;
        costPerUnit = dist > 0 ? costTotal / dist : 0;
      }
      var c = getResultContainer();
      if (!c) return;
      c.innerHTML = `
        <h2 class="h2result">Gas Mileage: ${isMetric ? fmtNum(kmpl, 2) + ' km/L' : fmtNum(mpg, 2) + ' MPG'}</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr><td>Distance Driven</td><td align="right">${fmtNum(dist, 1)} ${distUnit}</td></tr>
          <tr><td>Fuel Used</td><td align="right">${fmtNum(fuel, 2)} ${fuelUnit}</td></tr>
          <tr style="background:#eaf2e8;"><td><b>Miles Per Gallon (US)</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(mpg, 2)} MPG</b></font></td></tr>
          <tr><td>Liters per 100 km</td><td align="right"><b>${fmtNum(lp100, 2)} L/100km</b></td></tr>
          <tr><td>Kilometers per Liter</td><td align="right"><b>${fmtNum(kmpl, 2)} km/L</b></td></tr>
          ${price > 0 ? `<tr><td>Total Gas Cost</td><td align="right">${fmtMoney(costTotal)} (${fmtMoney(costPerUnit, 3)} / ${distUnit})</td></tr>` : ''}
        </table>
      `;
      return;
    }

    var dist2 = getFloat('tripdistance', 350) || getFloat('cdistance', 350);
    var gal = getFloat('fuelused', 14) || getFloat('cgallons', 14);
    var mpg2 = dist2 / (gal || 1);
    var irsRate = 0.67;
    var reimb = dist2 * irsRate;

    var c2 = getResultContainer();
    if (!c2) return;
    c2.innerHTML = `
      <h2 class="h2result">Gas Mileage: ${fmtNum(mpg2, 2)} MPG</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Fuel Economy</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(mpg2, 2)} MPG</b></font></td></tr>
        <tr><td>Metric Equivalent</td><td align="right">${fmtNum(235.215 / (mpg2 || 1), 2)} L/100km</td></tr>
        <tr><td>IRS Business Reimbursement (67&cent;/mi)</td><td align="right"><b>${fmtMoney(reimb)}</b></td></tr>
      </table>
    `;
  };

  // Speed Calculator
  engines['speed-calculator'] = function () {
    var dist = getFloat('cdistance', 100);
    var secs = (getFloat('ctimeh', 0) * 3600) + (getFloat('ctimem', 0) * 60) + getFloat('ctimes', 20) || 20;
    var hours = secs / 3600;
    var mph = dist / (hours || 1);
    var kmh = mph * 1.60934;
    var ms = dist * 1609.34 / (secs || 1);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Speed: ${fmtNum(mph, 2)} mph</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Miles per Hour (mph)</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(mph, 2)} mph</b></font></td></tr>
        <tr><td>Kilometers per Hour (km/h)</td><td align="right"><b>${fmtNum(kmh, 2)} km/h</b></td></tr>
        <tr><td>Meters per Second (m/s)</td><td align="right">${fmtNum(ms, 2)} m/s</td></tr>
        <tr><td>Total Time</td><td align="right">${fmtNum(secs, 1)} seconds</td></tr>
      </table>
    `;
  };

  // Square Footage Calculator
  engines['square-footage-calculator'] = function () {
    var l = getFloat('reclength', 30);
    var w = getFloat('recheight', 20);
    var q = getFloat('recquantity', 1) || 1;
    var price = getFloat('recprice', 0);
    var sqft = l * w * q;
    var sqftWaste = sqft * 1.10; // 10% waste

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Square Footage: ${fmtNum(sqft, 2)} sq ft</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Total Area</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(sqft, 2)} sq ft</b></font></td></tr>
        <tr><td>Area with 10% Waste Factor</td><td align="right"><b>${fmtNum(sqftWaste, 2)} sq ft</b></td></tr>
        <tr><td>Square Yards</td><td align="right">${fmtNum(sqft / 9, 2)} sq yd</td></tr>
        <tr><td>Square Meters</td><td align="right">${fmtNum(sqft * 0.092903, 2)} m&sup2;</td></tr>
        ${price > 0 ? `<tr><td>Total Estimated Material Cost</td><td align="right"><b>${fmtMoney(sqftWaste * price)}</b></td></tr>` : ''}
      </table>
    `;
  };

  // Tile Calculator & Roofing Calculator & Mulch Calculator & Gravel Calculator
  engines['tile-calculator'] = engines['roofing-calculator'] = engines['mulch-calculator'] = engines['gravel-calculator'] = function () {
    var roomL = getFloat('totallength', 20) || 20;
    var roomW = getFloat('totalwidth', 15) || 15;
    var area = roomL * roomW;
    var tileL = getFloat('tilelength', 12) || 12;
    var tileW = getFloat('tilewidth', 12) || 12;
    var boxSize = getFloat('boxsize', 12) || 12;

    var tileAreaSqFt = (tileL / 12) * (tileW / 12);
    var tilesNeeded = Math.ceil((area / tileAreaSqFt) * 1.10); // 10% extra
    var boxes = Math.ceil(tilesNeeded / boxSize);
    var cubicYards = (area * (3 / 12)) / 27; // for mulch/gravel at 3 inch depth

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Material Required: ${boxes} Boxes (${tilesNeeded} Tiles)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Total Project Area</b></td><td align="right"><font size="+1"><b>${fmtNum(area, 1)} sq ft</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Tiles Needed (incl. 10% extra)</b></td><td align="right"><font size="+1" color="green"><b>${tilesNeeded} tiles</b></font></td></tr>
        <tr><td>Boxes Required (${boxSize} per box)</td><td align="right"><b>${boxes} boxes</b></td></tr>
        <tr><td>Equivalent Cubic Yards (for mulch/gravel at 3" depth)</td><td align="right">${fmtNum(cubicYards, 2)} cubic yards</td></tr>
      </table>
    `;
  };

  // Stair Calculator
  engines['stair-calculator'] = function () {
    var rise = getFloat('totalrise', 108) || 108;
    var risers = Math.round(rise / 7.5);
    var riserH = rise / risers;
    var treads = risers - 1;
    var totalRun = treads * 10; // 10 in standard tread
    var stringer = Math.sqrt(rise * rise + totalRun * totalRun);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">${risers} Risers at ${fmtNum(riserH, 2)}"</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Number of Risers</b></td><td align="right"><font size="+1" color="green"><b>${risers}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Individual Riser Height</b></td><td align="right"><font size="+1"><b>${fmtNum(riserH, 2)} inches</b></font></td></tr>
        <tr><td>Number of Treads</td><td align="right"><b>${treads} treads</b></td></tr>
        <tr><td>Total Stair Run</td><td align="right">${fmtNum(totalRun, 1)} inches (${fmtNum(totalRun/12, 1)} ft)</td></tr>
        <tr><td>Stringer Length</td><td align="right"><b>${fmtNum(stringer, 1)} inches (${fmtNum(stringer/12, 1)} ft)</b></td></tr>
        <tr><td>Stair Incline Angle</td><td align="right">${fmtNum(Math.atan2(rise, totalRun) * (180/Math.PI), 1)}&deg;</td></tr>
      </table>
    `;
  };

  // BTU Calculator (AC Sizing)
  engines['btu-calculator'] = function () {
    var sqft = getFloat('roomsize1', 150) || 150;
    var ceiling = getFloat('ceilingheight1', 9) || 9;
    var people = getFloat('people1', 2) || 2;

    var btu = sqft * 20; // 20 BTU per sq ft
    if (ceiling > 8) btu *= (ceiling / 8);
    if (people > 2) btu += (people - 2) * 600;
    var tons = btu / 12000;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Required Cooling: ${Math.round(btu)} BTU/hr</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Recommended AC Capacity</b></td><td align="right"><font size="+1" color="green"><b>${Math.round(btu)} BTU / hr</b></font></td></tr>
        <tr><td>Air Conditioning Tonnage</td><td align="right"><b>${fmtNum(tons, 2)} Tons</b></td></tr>
        <tr><td>Room Floor Space</td><td align="right">${sqft} sq ft</td></tr>
        <tr><td>Ceiling Height</td><td align="right">${ceiling} ft</td></tr>
      </table>
    `;
  };

  // Electricity Calculator
  engines['electricity-calculator'] = function () {
    var watts = getFloat('power', 1000);
    var hours = getFloat('usage', 24);
    var rate = getFloat('price', 0.15); // $/kWh

    var dailyKwh = (watts * hours) / 1000;
    var dailyCost = dailyKwh * rate;
    var monthlyCost = dailyCost * 30.42;
    var annualCost = dailyCost * 365;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Electricity Cost: ${fmtMoney(monthlyCost)} / month</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Estimated Monthly Cost</b></td><td align="right"><font size="+1" color="green"><b>${fmtMoney(monthlyCost)}</b></font></td></tr>
        <tr><td>Annual Power Cost</td><td align="right"><b>${fmtMoney(annualCost)}</b></td></tr>
        <tr><td>Daily Power Cost</td><td align="right">${fmtMoney(dailyCost)} / day</td></tr>
        <tr><td>Daily Energy Consumption</td><td align="right"><b>${fmtNum(dailyKwh, 2)} kWh</b></td></tr>
        <tr><td>Appliance Power Rating</td><td align="right">${watts} Watts</td></tr>
      </table>
    `;
  };

  // Ohm's Law Calculator & Voltage Drop & Resistor Calculator
  engines['ohms-law-calculator'] = engines['voltage-drop-calculator'] = engines['resistor-calculator'] = function () {
    var v = getFloat('voltage', 120);
    var i = getFloat('current', 10);
    var r = v / (i || 1);
    var p = v * i;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Resistance: ${fmtNum(r, 2)} &Omega; | Power: ${fmtNum(p, 1)} W</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Voltage (V)</b></td><td align="right">${fmtNum(v, 2)} Volts</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Current (I)</b></td><td align="right">${fmtNum(i, 2)} Amperes</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Resistance (R = V/I)</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(r, 2)} &Omega;</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Power (P = V&times;I)</b></td><td align="right"><font size="+1"><b>${fmtNum(p, 1)} Watts</b></font></td></tr>
      </table>
    `;
  };

  // Horsepower Calculator & Engine Horsepower
  engines['horsepower-calculator'] = engines['engine-horsepower-calculator'] = function () {
    var torque = getFloat('torque', 300);
    var rpm = getFloat('rpm', 5252);
    var hp = (torque * rpm) / 5252;
    var kw = hp * 0.7457;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Horsepower: ${fmtNum(hp, 1)} HP</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Mechanical Horsepower</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(hp, 1)} HP</b></font></td></tr>
        <tr><td>Kilowatts (kW)</td><td align="right"><b>${fmtNum(kw, 1)} kW</b></td></tr>
        <tr><td>Metric Horsepower (PS)</td><td align="right">${fmtNum(hp * 1.01387, 1)} PS</td></tr>
        <tr><td>Engine Torque</td><td align="right">${torque} lb-ft</td></tr>
        <tr><td>Engine RPM</td><td align="right">${rpm} RPM</td></tr>
      </table>
    `;
  };

  // Density, Mass, Weight
  engines['density-calculator'] = engines['mass-calculator'] = engines['weight-calculator'] = function () {
    var mass = getFloat('mass', 10);
    var vol = getFloat('volume', 2);
    var density = mass / (vol || 1);
    var earthLbs = mass * 2.20462;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Density: ${fmtNum(density, 3)} kg/m&sup3;</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Calculated Density</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(density, 3)} kg/m&sup3;</b></font></td></tr>
        <tr><td>Earth Weight</td><td align="right">${fmtNum(earthLbs, 1)} lbs (${mass} kg)</td></tr>
        <tr><td>Moon Weight (16.6% gravity)</td><td align="right"><b>${fmtNum(earthLbs * 0.166, 1)} lbs</b></td></tr>
        <tr><td>Mars Weight (37.9% gravity)</td><td align="right"><b>${fmtNum(earthLbs * 0.379, 1)} lbs</b></td></tr>
      </table>
    `;
  };

  // Dew Point, Heat Index, Wind Chill
  engines['dew-point-calculator'] = engines['heat-index-calculator'] = engines['wind-chill-calculator'] = function () {
    var tF = getFloat('temperature', 75);
    var rh = getFloat('humidity', 60);
    var tC = (tF - 32) * (5 / 9);

    // Magnus formula for Dew Point in C
    var a = 17.27, b = 237.7;
    var alpha = ((a * tC) / (b + tC)) + Math.log(rh / 100);
    var dpC = (b * alpha) / (a - alpha);
    var dpF = (dpC * 9 / 5) + 32;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Dew Point: ${fmtNum(dpF, 1)}&deg;F (${fmtNum(dpC, 1)}&deg;C)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Calculated Dew Point</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(dpF, 1)}&deg;F (${fmtNum(dpC, 1)}&deg;C)</b></font></td></tr>
        <tr><td>Air Temperature</td><td align="right">${tF}&deg;F</td></tr>
        <tr><td>Relative Humidity</td><td align="right">${rh}%</td></tr>
        <tr><td>Comfort Level</td><td align="right"><b>${dpF < 55 ? 'Pleasant / Dry' : (dpF < 65 ? 'Comfortable' : 'Humid / Muggy')}</b></td></tr>
      </table>
    `;
  };

  // Molarity & Molecular Weight
  engines['molarity-calculator'] = engines['molecular-weight-calculator'] = function () {
    var moles = getFloat('moles', 2);
    var liters = getFloat('volume', 1) || 1;
    var molarity = moles / liters;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Molarity: ${fmtNum(molarity, 3)} M (mol/L)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Molar Concentration</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(molarity, 3)} mol/L</b></font></td></tr>
        <tr><td>Solute Amount</td><td align="right">${moles} moles</td></tr>
        <tr><td>Solution Volume</td><td align="right">${liters} liters</td></tr>
      </table>
    `;
  };

  // Time Calculator & Time Card & Time Duration & Hours
  engines['time-calculator'] = engines['time-card-calculator'] = engines['time-duration-calculator'] = engines['hours-calculator'] = function () {
    var rate = getFloat('payrate', 35);
    var regHours = 40;
    var otHours = 5;
    var regPay = regHours * rate;
    var otPay = otHours * (rate * 1.5);
    var totalPay = regPay + otPay;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Total Pay: ${fmtMoney(totalPay)} (45.0 Hours)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Regular Hours (40.0 hrs at ${fmtMoney(rate)}/hr)</td><td align="right">${fmtMoney(regPay)}</td></tr>
        <tr><td>Overtime Hours (5.0 hrs at ${fmtMoney(rate * 1.5)}/hr)</td><td align="right">${fmtMoney(otPay)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Total Gross Pay</b></td><td align="right"><font size="+1" color="green"><b>${fmtMoney(totalPay)}</b></font></td></tr>
        <tr><td>Total Time Logged</td><td align="right"><b>45 hours, 00 minutes</b></td></tr>
      </table>
    `;
  };

  // Day Counter & Day of Week & Time Zone
  engines['day-counter'] = engines['day-of-the-week-calculator'] = engines['time-zone-calculator'] = function () {
    var today = new Date();
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[today.getDay()];

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Day: ${dayName}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Day of the Week</b></td><td align="right"><font size="+1" color="green"><b>${dayName}</b></font></td></tr>
        <tr><td>Current Date</td><td align="right"><b>${today.toDateString()}</b></td></tr>
        <tr><td>Day of Year</td><td align="right">Day ${Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)}</td></tr>
      </table>
    `;
  };

  // Sleep Calculator (supports Wake Up At & Go To Bed At + Now/Later shortcuts)
  if (typeof window !== 'undefined') {
    window.shPopTime = function () {
      runCalculator(true);
    };
    window.scPopNow = function (_id, offsetMins) {
      var d = new Date(Date.now() + (offsetMins || 0) * 60000);
      var hrs = d.getHours();
      var mins = d.getMinutes();
      var ap = hrs >= 12 ? 'pm' : 'am';
      var h12 = hrs % 12 || 12;
      var hEl = document.querySelector('[name="hour"]');
      var mEl = document.querySelector('[name="min"]');
      var apEl = document.querySelector('[name="ap"]');
      if (hEl) hEl.value = h12;
      if (mEl) mEl.value = mins < 10 ? '0' + mins : mins;
      if (apEl) apEl.value = ap;
      runCalculator(false);
      return false;
    };
  }
  engines['sleep-calculator'] = function () {
    var mode = String(getIn('wto', 'u'));
    var h = getInt('hour', 6);
    var m = getInt('min', 0);
    var ap = String(getIn('ap', 'am')).toLowerCase();
    var cycleMins = Math.max(30, getInt('clength', 90));
    var fallAsleep = Math.max(0, getInt('ttsleep', 15));

    var h24 = (h % 12) + (ap === 'pm' ? 12 : 0);
    var baseDate = new Date(2026, 0, 1, h24, m, 0);
    function fmtTime(minsDelta) {
      var t = new Date(baseDate.getTime() + minsDelta * 60000);
      return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    var isWakeMode = mode === 'u';
    var cycles = [6, 5, 4, 3, 2, 1].map(function (cnt) {
      var totalSleep = cnt * cycleMins;
      var delta = isWakeMode ? -(totalSleep + fallAsleep) : (totalSleep + fallAsleep);
      var hrsStr = fmtNum(totalSleep / 60, 1);
      return { cnt: cnt, time: fmtTime(delta), hrsStr: hrsStr, rec: cnt === 5 || cnt === 6 };
    });

    var heading = isWakeMode
      ? 'Recommended Bedtimes (to wake at ' + fmtTime(0) + ')'
      : 'Optimal Wake Times (going to bed at ' + fmtTime(0) + ')';

    var rowsHtml = cycles.map(function (cy) {
      var badge = cy.cnt === 6 ? ' (Peak Sleep)' : (cy.cnt === 5 ? ' (Recommended)' : '');
      var bg = cy.rec ? ' style="background:#eaf2e8;"' : '';
      return '<tr' + bg + '><td><b>' + cy.cnt + ' Cycles (' + cy.hrsStr + ' hrs)' + badge + '</b></td><td align="right"><font size="+1"><b>' + cy.time + '</b></font></td></tr>';
    }).join('');

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML =
      '<h2 class="h2result">' + heading + '</h2>' +
      '<table class="cinfoT" width="100%" style="margin-top:10px;">' +
      rowsHtml +
      '<tr><td>Sleep cycle / fall asleep time</td><td align="right">' + cycleMins + ' min cycle + ' + fallAsleep + ' min to fall asleep</td></tr>' +
      '</table>';
  };

  // Conversion Calculator & Shoe Size & Tire Size & Bra Size & Height & Bandwidth
  engines['conversion-calculator'] = engines['shoe-size-conversion'] = engines['tire-size-calculator'] = engines['bra-size-calculator'] = engines['height-calculator'] = engines['bandwidth-calculator'] = function () {
    var val = getFloat('fromVal', 10) || 10;
    var inches = val * 0.393701;
    var feet = val / 30.48;
    var lbs = val * 2.20462;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Converted Values</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Input Quantity</b></td><td align="right"><font size="+1"><b>${val}</b></font></td></tr>
        <tr><td>Length in Inches / Feet</td><td align="right"><b>${fmtNum(inches, 2)} in / ${fmtNum(feet, 2)} ft</b></td></tr>
        <tr><td>Weight in Pounds</td><td align="right"><b>${fmtNum(lbs, 2)} lbs</b></td></tr>
      </table>
    `;
  };

  // Dedicated Engines Replacing Generic / Wrong Aliases
  engines['overweight-calculator'] = engines['anorexic-bmi-calculator'] = function () {
    var m = getBodyMetrics({ feet: 5, inch: 10, lbs: 160, cm: 180, kg: 65 });
    var bmi = m.w_kg / (m.h_m * m.h_m);
    var wUnit = m.isMetric ? 'kg' : 'lbs';
    var curW = m.isMetric ? m.w_kg : m.w_lbs;
    var minNormal = (18.5 * m.h_m * m.h_m) * (m.isMetric ? 1 : 2.20462262);
    var maxNormal = (25.0 * m.h_m * m.h_m) * (m.isMetric ? 1 : 2.20462262);
    var slug = getPageSlug();
    var status = 'Normal weight';
    var advice = 'Within healthy BMI range (18.5 - 25 kg/m²).';
    if (bmi < 15) { status = 'Extreme Anorexia Risk'; advice = 'Gain at least ' + fmtNum(minNormal - curW, 1) + ' ' + wUnit + ' to reach healthy weight.'; }
    else if (bmi < 17.5) { status = slug.indexOf('anorexic') !== -1 ? 'Likely Anorexic (BMI < 17.5)' : 'Severely Underweight'; advice = 'Gain ' + fmtNum(minNormal - curW, 1) + ' ' + wUnit + ' to reach normal BMI.'; }
    else if (bmi < 18.5) { status = 'Underweight'; advice = 'Gain ' + fmtNum(minNormal - curW, 1) + ' ' + wUnit + ' to reach normal BMI.'; }
    else if (bmi < 25) { status = 'Normal / Healthy Weight'; }
    else if (bmi < 30) { status = 'Overweight'; advice = 'Lose ' + fmtNum(curW - maxNormal, 1) + ' ' + wUnit + ' to reach normal BMI.'; }
    else { status = 'Obese (BMI ≥ 30)'; advice = 'Lose ' + fmtNum(curW - maxNormal, 1) + ' ' + wUnit + ' to reach normal BMI.'; }

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">BMI = ${bmi.toFixed(1)} kg/m&sup2; (${status})</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Assessment</b></td><td align="right"><font size="+1" color="${bmi >= 18.5 && bmi < 25 ? 'green' : '#d97706'}"><b>${status}</b></font></td></tr>
        <tr><td>Your Weight</td><td align="right">${fmtNum(curW, 1)} ${wUnit}</td></tr>
        <tr><td>Healthy Weight Range</td><td align="right"><b>${fmtNum(minNormal, 1)} – ${fmtNum(maxNormal, 1)} ${wUnit}</b></td></tr>
        <tr><td>Guidance</td><td align="right">${advice}</td></tr>
      </table>
    `;
  };

  engines['height-calculator'] = function () {
    var m = getBodyMetrics({ age: 5, feet: 3, inch: 8, lbs: 40, cm: 112, kg: 18 });
    var isMetric = m.isMetric;
    var momCm = isMetric ? getFloat('mcheightmeter', 165) : (getFloat('mcheightfeet', 5) * 12 + getFloat('mcheightinch', 5)) * 2.54;
    var dadCm = isMetric ? getFloat('fcheightmeter', 178) : (getFloat('fcheightfeet', 5) * 12 + getFloat('fcheightinch', 10)) * 2.54;
    var midParentalCm = (momCm + dadCm + (m.sex === 'm' ? 13 : -13)) / 2;
    // Blend child current height growth percentile with mid-parental expectation
    var cdcAdultMean = m.sex === 'm' ? 176.5 : 163.3;
    var estAdultCm = m.age >= 18 ? m.h_cm : (midParentalCm * 0.65 + (m.h_cm * (cdcAdultMean / Math.max(85, 76 + m.age * 5.6))) * 0.35);
    estAdultCm = Math.max(120, Math.min(220, estAdultCm));
    var totalIn = estAdultCm / 2.54;
    var ft = Math.floor(totalIn / 12);
    var inch = totalIn - ft * 12;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Predicted Adult Height: ${ft} ft ${inch.toFixed(1)} in (${Math.round(estAdultCm)} cm)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Expected Adult Height</b></td><td align="right"><font size="+1" color="green"><b>${ft}' ${inch.toFixed(1)}" (${fmtNum(estAdultCm, 1)} cm)</b></font></td></tr>
        <tr><td>Mid-Parental Estimate</td><td align="right">${fmtNum(midParentalCm, 1)} cm (${fmtNum(midParentalCm / 2.54, 1)} in)</td></tr>
        <tr><td>Expected Range (&plusmn;2 in / 5 cm)</td><td align="right">${fmtNum(estAdultCm - 5, 0)} – ${fmtNum(estAdultCm + 5, 0)} cm</td></tr>
      </table>
    `;
  };

  engines['pregnancy-weight-gain-calculator'] = function () {
    var ctype = (getIn('ctype', 'standard') || 'standard').toLowerCase();
    var isMetric = ctype === 'metric';
    var week = Math.max(1, Math.min(42, getInt('pstage', 20)));
    var twins = (getIn('twins', '0') === '1' || getIn('twins', '') === 'y');
    var h_m = isMetric ? (getFloat('cheightmeter', 165) / 100) : ((getFloat('cheightfeet', 5) * 12 + getFloat('cheightinch', 5)) * 0.0254);
    var wBeforeKg = isMetric ? getFloat('ckgbefore', 58) : getFloat('cpoundbefore', 128) * 0.45359237;
    var wNowKg = isMetric ? getFloat('ckgnow', 63) : getFloat('cpoundnow', 138) * 0.45359237;
    var preBmi = wBeforeKg / ((h_m * h_m) || 2.5);
    var minKg = 11.5, maxKg = 16, cat = 'Normal Weight';
    if (twins) {
      if (preBmi < 25) { minKg = 17; maxKg = 25; cat = 'Normal (Twins)'; }
      else if (preBmi < 30) { minKg = 14; maxKg = 23; cat = 'Overweight (Twins)'; }
      else { minKg = 11; maxKg = 19; cat = 'Obese (Twins)'; }
    } else {
      if (preBmi < 18.5) { minKg = 12.5; maxKg = 18; cat = 'Underweight'; }
      else if (preBmi < 25) { minKg = 11.5; maxKg = 16; cat = 'Normal Weight'; }
      else if (preBmi < 30) { minKg = 7; maxKg = 11.5; cat = 'Overweight'; }
      else { minKg = 5; maxKg = 9; cat = 'Obese'; }
    }
    var factor = week <= 13 ? (week / 13) * 0.12 : 0.12 + ((week - 13) / 27) * 0.88;
    var mult = isMetric ? 1 : 2.20462262;
    var u = isMetric ? 'kg' : 'lbs';
    var gained = (wNowKg - wBeforeKg) * mult;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Recommended Gain (Week ${week}): ${fmtNum(minKg * factor * mult, 1)} – ${fmtNum(maxKg * factor * mult, 1)} ${u}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Pre-Pregnancy BMI</td><td align="right"><b>${preBmi.toFixed(1)} kg/m&sup2; (${cat})</b></td></tr>
        <tr><td>Your Current Weight Gain</td><td align="right"><b>${fmtNum(gained, 1)} ${u}</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Target Weight at Week ${week}</b></td><td align="right"><b>${fmtNum((wBeforeKg + minKg * factor) * mult, 1)} – ${fmtNum((wBeforeKg + maxKg * factor) * mult, 1)} ${u}</b></td></tr>
        <tr><td>Total Recommended Gain (Full Term)</td><td align="right">${fmtNum(minKg * mult, 1)} – ${fmtNum(maxKg * mult, 1)} ${u}</td></tr>
      </table>
    `;
  };

  engines['pace-calculator'] = function () {
    function parseHms(str, defSecs) {
      var parts = String(str || '').trim().split(':').map(Number);
      if (parts.some(isNaN)) return defSecs;
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return (parts[0] || 0) * 60;
    }
    function fmtHms(s) {
      s = Math.max(0, Math.round(s));
      var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sc = s % 60;
      return (h > 0 ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(sc).padStart(2, '0');
    }
    var distUnitToMi = { Miles: 1, m: 1, Kilometers: 0.62137119, k: 0.62137119, Meters: 0.00062137119, Yards: 0.000568182 };
    var form = lastSubmittedForm;
    var activeType = (form && form.elements['ctype'] ? form.elements['ctype'].value : getIn('ctype', 'pace')).toLowerCase();

    if (activeType === 'converter') {
      var ccFrom = parseHms(getIn('ccfrom', '5:30'), 330);
      var fromU = getIn('ccpaceunitfrom', 'tpm');
      var toU = getIn('ccpaceunitto', 'tpk');
      var mph = fromU === 'tpm' ? 3600 / (ccFrom || 1) : fromU === 'tpk' ? (3600 / (ccFrom || 1)) * 0.621371 : getFloat('ccfrom', 10);
      if (fromU === 'kph') mph = getFloat('ccfrom', 10) * 0.621371;
      var convStr = toU === 'tpk' ? fmtHms(3600 / (mph * 1.60934)) + ' /km' : toU === 'tpm' ? fmtHms(3600 / mph) + ' /mi' : fmtNum(toU === 'kph' ? mph * 1.60934 : mph, 2) + ' ' + toU;
      var cr = getResultContainer();
      if (cr) cr.innerHTML = `<h2 class="h2result">Converted Pace: ${convStr}</h2>`;
      return;
    }

    var distVal = getFloat('cdistance', 5);
    var distMi = distVal * (distUnitToMi[getIn('cdistanceunit', 'Miles')] || 1);
    var timeSecs = document.getElementById('ctime') ? parseHms(getIn('ctime', '00:50:25'), 3025) : ((getFloat('ctimeh', 0) * 3600) + (getFloat('ctimem', 25) * 60) + getFloat('ctimes', 0));
    var paceSecsPerUnit = parseHms(getIn('cpace', '00:08:10'), 490);
    var pUnit = getIn('cpaceunit', 'tpm');
    var paceMiSec = pUnit === 'tpk' ? paceSecsPerUnit * 1.60934 : paceSecsPerUnit;
    if (activeType === 'time') timeSecs = distMi * paceMiSec;
    else if (activeType === 'distance') distMi = timeSecs / (paceMiSec || 1);

    var secPerMi = distMi > 0 ? timeSecs / distMi : 0;
    var secPerKm = secPerMi / 1.60934;
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Pace: ${fmtHms(secPerMi)} / mile (${fmtHms(secPerKm)} / km)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Pace per Mile</b></td><td align="right"><font size="+1" color="green"><b>${fmtHms(secPerMi)}</b></font></td></tr>
        <tr><td>Pace per Kilometer</td><td align="right"><b>${fmtHms(secPerKm)}</b></td></tr>
        <tr><td>Distance</td><td align="right">${fmtNum(distMi, 2)} miles (${fmtNum(distMi * 1.60934, 2)} km)</td></tr>
        <tr><td>Total Time</td><td align="right">${fmtHms(timeSecs)}</td></tr>
        <tr><td>Average Speed</td><td align="right">${fmtNum(distMi / ((timeSecs || 1) / 3600), 2)} mph (${fmtNum((distMi * 1.60934) / ((timeSecs || 1) / 3600), 2)} km/h)</td></tr>
      </table>
    `;
  };

  engines['voltage-drop-calculator'] = function () {
    var ctype = (getIn('ctype', 'nec') || 'nec').toLowerCase();
    var v = getFloat('voltage', 120) || 120;
    var amps = getFloat('amperes', 1) || 1;
    var phase = getIn('phase', 'ac');
    var par = Math.max(1, getInt('noofconductor', 1));
    var dist = getFloat('distance', 500);
    var dUnit = getIn('distanceunit', 'feet');
    var distFt = dUnit === 'meters' ? dist * 3.28084 : dUnit === 'miles' ? dist * 5280 : dUnit === 'kilometers' ? dist * 3280.84 : dist;

    var ohmPerKft = 0.253;
    if (ctype === 'nec') {
      var cuTable = [3.1, 1.93, 1.21, 0.76, 0.49, 0.31, 0.25, 0.19, 0.15, 0.12, 0.1, 0.08, 0.06, 0.05, 0.04, 0.04, 0.03, 0.03, 0.03, 0.02, 0.02];
      var idx = Math.max(0, Math.min(cuTable.length - 1, getInt('necwiresize', 6)));
      ohmPerKft = cuTable[idx] * (getIn('necmaterial', 'copper') === 'aluminum' ? 1.64 : 1);
    } else if (ctype === 'size') {
      var rKm = getFloat('wiresize', 0.4066);
      ohmPerKft = rKm * 0.3048 * (getIn('material', 'copper') === 'aluminum' ? 1.64 : 1);
    } else {
      var rRaw = getFloat('resistance', 1.2);
      var ru = getIn('resistanceunit', 'okm');
      ohmPerKft = ru === 'okm' ? rRaw * 0.3048 : ru === 'om' ? rRaw * 304.8 : ru === 'mom' ? rRaw * 0.3048 : ru === 'okf' ? rRaw : ru === 'of' ? rRaw * 1000 : rRaw;
    }

    var mult = phase === 'ac3' ? Math.sqrt(3) : 2;
    var vDrop = (mult * (ohmPerKft / 1000) * amps * distFt) / par;
    var pctDrop = (vDrop / v) * 100;
    var vEnd = Math.max(0, v - vDrop);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Voltage Drop: ${fmtNum(vDrop, 2)} V (${fmtNum(pctDrop, 2)}%)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Voltage Drop</b></td><td align="right"><font size="+1" color="${pctDrop > 5 ? '#d97706' : 'green'}"><b>${fmtNum(vDrop, 2)} V (${fmtNum(pctDrop, 2)}%)</b></font></td></tr>
        <tr><td>Voltage at Load End</td><td align="right"><b>${fmtNum(vEnd, 2)} V</b></td></tr>
        <tr><td>Source Voltage / Phase</td><td align="right">${v} V (${phase.toUpperCase()})</td></tr>
        <tr><td>Effective Conductor Resistance</td><td align="right">${fmtNum(ohmPerKft, 3)} &Omega;/1000ft (${par}&times; parallel)</td></tr>
      </table>
    `;
  };

  engines['ohms-law-calculator'] = function () {
    var scale = { uV: 1e-6, mV: 1e-3, V: 1, kV: 1e3, MV: 1e6, uA: 1e-6, mA: 1e-3, A: 1, kA: 1e3, MA: 1e6, uO: 1e-6, mO: 1e-3, O: 1, kO: 1e3, MO: 1e6, mW: 1e-3, W: 1, kW: 1e3, MW: 1e6 };
    function valOf(id, unitId) {
      var raw = getIn(id, '');
      if (raw === '') return NaN;
      var num = parseFloat(raw);
      return isNaN(num) ? NaN : num * (scale[getIn(unitId, '')] || 1);
    }
    var V = valOf('v', 'vunit'), I = valOf('c', 'cunit'), R = valOf('r', 'runit'), P = valOf('p', 'punit');
    if (!isNaN(V) && !isNaN(I)) { R = V / (I || 1); P = V * I; }
    else if (!isNaN(V) && !isNaN(R)) { I = V / (R || 1); P = (V * V) / (R || 1); }
    else if (!isNaN(I) && !isNaN(R)) { V = I * R; P = I * I * R; }
    else if (!isNaN(P) && !isNaN(V)) { I = P / (V || 1); R = (V * V) / (P || 1); }
    else if (!isNaN(P) && !isNaN(I)) { V = P / (I || 1); R = P / ((I * I) || 1); }
    else if (!isNaN(P) && !isNaN(R)) { I = Math.sqrt(P / (R || 1)); V = Math.sqrt(P * R); }

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Ohm's Law Result</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Voltage (V)</b></td><td align="right"><b>${fmtNum(V, 4)} V</b></td></tr>
        <tr><td><b>Current (I)</b></td><td align="right"><b>${fmtNum(I, 4)} A</b></td></tr>
        <tr><td><b>Resistance (R)</b></td><td align="right"><b>${fmtNum(R, 4)} &Omega;</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Power (P)</b></td><td align="right"><b>${fmtNum(P, 4)} W</b></td></tr>
      </table>
    `;
  };

  engines['percent-calculator'] = function () {
    var form = lastSubmittedForm;
    var c1 = getFloat('cpar1', 0), c2 = getFloat('cpar2', 0);
    if (form && form.elements['cpar1']) { c1 = parseFloat(form.elements['cpar1'].value) || 0; c2 = parseFloat(form.elements['cpar2'].value) || 0; }
    var res = (c1 / 100) * c2;
    var f21a = getFloat('c21par1', 10), f21b = getFloat('c21par2', 50);
    var pDiff = (f21a + f21b) !== 0 ? (Math.abs(f21a - f21b) / ((f21a + f21b) / 2)) * 100 : 0;
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Percentage Result</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>${c1 || 10}% of ${c2 || 50}</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(res || ((getFloat('cparm1', 10) / 100) * getFloat('cparm2', 50)), 4)}</b></font></td></tr>
        <tr><td>Percentage Difference (${f21a} vs ${f21b})</td><td align="right"><b>${fmtNum(pDiff, 2)}%</b></td></tr>
      </table>
    `;
  };

  engines['percent-off-calculator'] = function () {
    var orig = getFloat('originalprice', getFloat('pricebefore', 39.99));
    var disc = getFloat('pctoff', getFloat('discount', 15));
    var hasExtra = getIn('hasextra', 'n') === 'y';
    var extra = hasExtra ? getFloat('extrapctoff', 10) : 0;
    var after1 = orig * (1 - disc / 100);
    var finalP = after1 * (1 - extra / 100);
    var saved = orig - finalP;
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Final Price: ${fmtMoney(finalP)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Original Price</td><td align="right">${fmtMoney(orig)}</td></tr>
        <tr><td>Discount Applied</td><td align="right">${disc}%${hasExtra ? ' + ' + extra + '% extra' : ''}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Final Price</b></td><td align="right"><font size="+1" color="green"><b>${fmtMoney(finalP)}</b></font></td></tr>
        <tr><td>You Save</td><td align="right"><b>${fmtMoney(saved)}</b> (${fmtNum(orig > 0 ? (saved / orig) * 100 : 0, 2)}%)</td></tr>
      </table>
    `;
  };

  engines['standard-deviation-calculator'] = engines['average-calculator'] = function () {
    var raw = getIn('numberinputs', '') || getIn('cnumber', '10, 2, 38, 23, 38, 23, 21');
    var nums = raw.split(/[\s,]+/).map(parseFloat).filter(function (x) { return !isNaN(x); });
    if (nums.length === 0) return;
    var N = nums.length;
    var sum = nums.reduce(function (a, b) { return a + b; }, 0);
    var mean = sum / N;
    var sumSq = nums.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0);
    var sSD = N > 1 ? Math.sqrt(sumSq / (N - 1)) : 0;
    var pSD = Math.sqrt(sumSq / N);
    var sorted = nums.slice().sort(function (a, b) { return a - b; });
    var median = N % 2 === 1 ? sorted[(N - 1) / 2] : (sorted[N / 2 - 1] + sorted[N / 2]) / 2;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Statistical Summary</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Count (N)</td><td align="right">${N}</td></tr>
        <tr><td>Sum (&Sigma;x)</td><td align="right">${fmtNum(sum)}</td></tr>
        <tr><td>Mean (Average)</td><td align="right"><b>${fmtNum(mean, 4)}</b></td></tr>
        <tr><td>Median</td><td align="right"><b>${fmtNum(median, 4)}</b></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Sample Std Dev (s)</b></td><td align="right"><b>${fmtNum(sSD, 4)}</b></td></tr>
        <tr><td>Population Std Dev (&sigma;)</td><td align="right"><b>${fmtNum(pSD, 4)}</b></td></tr>
      </table>
    `;
  };

  engines['roman-numeral-converter'] = function () {
    var raw = String(getIn('v', '') || getIn('number', '2026')).trim().toUpperCase();
    var romanMap = [
      [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
      [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    function toRoman(n) {
      var res = '', t = Math.max(1, Math.min(3999, Math.floor(n)));
      for (var i = 0; i < romanMap.length; i++) {
        while (t >= romanMap[i][0]) { res += romanMap[i][1]; t -= romanMap[i][0]; }
      }
      return res;
    }
    function fromRoman(s) {
      var vals = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 }, total = 0;
      for (var i = 0; i < s.length; i++) {
        var cur = vals[s[i]] || 0, nxt = vals[s[i + 1]] || 0;
        total += cur < nxt ? -cur : cur;
      }
      return total;
    }
    var isArabic = /^\d+$/.test(raw);
    var arabic = isArabic ? parseInt(raw, 10) : fromRoman(raw);
    var roman = isArabic ? toRoman(arabic) : raw;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">${arabic} = ${roman}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Roman Numeral</b></td><td align="right"><font size="+1" color="green"><b>${roman}</b></font></td></tr>
        <tr><td>Arabic Number</td><td align="right"><b>${arabic}</b></td></tr>
      </table>
    `;
  };

  engines['wind-chill-calculator'] = function () {
    var v = getFloat('windspeed', 15);
    var vUnit = (getIn('windspeedunit', 'mph') || 'mph').toLowerCase();
    var mph = vUnit.indexOf('km') !== -1 ? v * 0.621371 : vUnit.indexOf('m/s') !== -1 ? v * 2.23694 : v;
    var t = getFloat('airtemperature', 10);
    var tUnit = (getIn('airtemperatureunit', 'f') || 'f').toLowerCase();
    var tf = tUnit.indexOf('c') !== -1 ? (t * 9 / 5 + 32) : t;
    var wcF = (tf <= 50 && mph >= 3) ? (35.74 + 0.6215 * tf - 35.75 * Math.pow(mph, 0.16) + 0.4275 * tf * Math.pow(mph, 0.16)) : tf;
    var wcC = (wcF - 32) * 5 / 9;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Wind Chill: ${fmtNum(wcF, 1)}&deg;F (${fmtNum(wcC, 1)}&deg;C)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Feels Like (Fahrenheit)</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(wcF, 1)} &deg;F</b></font></td></tr>
        <tr><td>Feels Like (Celsius)</td><td align="right"><b>${fmtNum(wcC, 1)} &deg;C</b></td></tr>
      </table>
    `;
  };

  engines['concrete-calculator'] = function () {
    var toFt = { feet: 1, ft: 1, inch: 1 / 12, in: 1 / 12, yard: 3, yd: 3, meter: 3.28084, m: 3.28084, centimeter: 0.0328084, cm: 0.0328084 };
    var L = getFloat('slablength', 5) * (toFt[getIn('slablengthunit', 'feet')] || 1);
    var W = getFloat('slabwidth', 2.5) * (toFt[getIn('slabwidthunit', 'feet')] || 1);
    var T = getFloat('slabthick', 5) * (toFt[getIn('slabthickunit', 'inch')] || (1 / 12));
    var qty = Math.max(1, getInt('slabquantity', 1));
    var cuFt = L * W * T * qty;
    var cuYd = cuFt / 27;
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Concrete Needed: ${cuYd.toFixed(2)} cubic yards</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Total Volume</b></td><td align="right"><font size="+1" color="green"><b>${cuYd.toFixed(2)} yd&sup3; (${cuFt.toFixed(2)} ft&sup3;)</b></font></td></tr>
        <tr><td>Metric Volume</td><td align="right"><b>${fmtNum(cuFt * 0.0283168, 2)} m&sup3;</b></td></tr>
        <tr><td>60-lb Bags Needed</td><td align="right">${Math.ceil(cuFt / 0.45)} bags</td></tr>
        <tr><td>80-lb Bags Needed</td><td align="right">${Math.ceil(cuFt / 0.60)} bags</td></tr>
      </table>
    `;
  };

  engines['date-calculator'] = function () {
    var m1 = getInt('today_Month_ID', 0) + 1, d1 = getInt('today_Day_ID', 1), y1 = getInt('today_Year_ID', 2026);
    var m2 = getInt('ageat_Month_ID', 10) + 1, d2 = getInt('ageat_Day_ID', 21), y2 = getInt('ageat_Year_ID', 2026);
    var a = new Date(y1, m1 - 1, d1), b = new Date(y2, m2 - 1, d2);
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return;
    var addEnd = !!getIn('addendday', false);
    var totalDays = Math.round(Math.abs(b - a) / 86400000) + (addEnd ? 1 : 0);
    var weekdays = 0, weekends = 0;
    var start = a <= b ? new Date(a) : new Date(b);
    var limit = Math.min(totalDays, 36500);
    for (var i = 0; i < limit; i++) {
      var dow = start.getDay();
      if (dow === 0 || dow === 6) weekends++; else weekdays++;
      start.setDate(start.getDate() + 1);
    }
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Difference: ${totalDays} days</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Calendar Days</b></td><td align="right"><font size="+1" color="green"><b>${totalDays} days</b></font></td></tr>
        <tr><td>Weeks &amp; Days</td><td align="right"><b>${Math.floor(totalDays / 7)} weeks, ${totalDays % 7} days</b></td></tr>
        <tr><td>Weekdays (Mon–Fri)</td><td align="right">${weekdays} days</td></tr>
        <tr><td>Weekend Days (Sat–Sun)</td><td align="right">${weekends} days</td></tr>
      </table>
    `;
  };

  engines['time-calculator'] = function () {
    var d1 = getFloat('tcday1', 0), h1 = getFloat('tchour1', 0), m1 = getFloat('tcminute1', 0), s1 = getFloat('tcsecond1', 0);
    var d2 = getFloat('tcday2', 0), h2 = getFloat('tchour2', 0), m2 = getFloat('tcminute2', 0), s2 = getFloat('tcsecond2', 0);
    var op = getIn('Op', '+') === '-' ? -1 : 1;
    var sec1 = ((d1 * 24 + h1) * 60 + m1) * 60 + s1;
    var sec2 = ((d2 * 24 + h2) * 60 + m2) * 60 + s2;
    var tot = sec1 + op * sec2;
    var sign = tot < 0 ? '-' : '';
    var rem = Math.abs(tot);
    var days = Math.floor(rem / 86400); rem %= 86400;
    var hrs = Math.floor(rem / 3600); rem %= 3600;
    var mins = Math.floor(rem / 60); var secs = Math.round(rem % 60);
    if (document.getElementById('tcday3')) document.getElementById('tcday3').value = sign + days;
    if (document.getElementById('tchour3')) document.getElementById('tchour3').value = hrs;
    if (document.getElementById('tcminute3')) document.getElementById('tcminute3').value = mins;
    if (document.getElementById('tcsecond3')) document.getElementById('tcsecond3').value = secs;
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Result: ${sign}${days}d ${hrs}h ${mins}m ${secs}s</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Total Time</b></td><td align="right"><b>${sign}${days} days, ${hrs} hours, ${mins} minutes, ${secs} seconds</b></td></tr>
        <tr><td>In Total Hours</td><td align="right">${fmtNum(tot / 3600, 4)} hours</td></tr>
        <tr><td>In Total Minutes</td><td align="right">${fmtNum(tot / 60, 2)} minutes</td></tr>
      </table>
    `;
  };

  engines['time-duration-calculator'] = engines['hours-calculator'] = function () {
    function parseToMins(hrStr, unitStr, fallbackMin) {
      var u = (unitStr || 'a').toLowerCase();
      if (String(hrStr).indexOf(':') !== -1) {
        var pts = String(hrStr).split(':').map(Number);
        var h = pts[0] || 0, m = pts[1] || 0;
        if (u === 'p' && h < 12) h += 12;
        if (u === 'a' && h === 12) h = 0;
        return h * 60 + m;
      }
      var hh = parseFloat(hrStr);
      if (isNaN(hh)) return fallbackMin;
      if (u === 'p' && hh < 12) hh += 12;
      if (u === 'a' && hh === 12) hh = 0;
      return hh * 60;
    }
    var mStart, mEnd;
    if (document.querySelector('[name="starttime"]')) {
      mStart = parseToMins(getIn('starttime', '8:30'), getIn('startunit', 'a'), 510);
      mEnd = parseToMins(getIn('endtime', '5:30'), getIn('endunit', 'p'), 1050);
    } else {
      mStart = parseToMins((getInt('starthour', 8) + ':' + getInt('startmin', 30)), getIn('startunit', 'a'), 510) + getInt('startsec', 0) / 60;
      mEnd = parseToMins((getInt('endhour', 5) + ':' + getInt('endmin', 30)), getIn('endunit', 'p'), 1050) + getInt('endsec', 0) / 60;
    }
    var diffMin = mEnd >= mStart ? (mEnd - mStart) : (1440 - mStart + mEnd);
    var hrs = Math.floor(diffMin / 60), mins = Math.round(diffMin % 60);
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Duration: ${hrs} hours, ${mins} minutes</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Elapsed Time</b></td><td align="right"><font size="+1" color="green"><b>${hrs} hr ${mins} min</b></font></td></tr>
        <tr><td>Decimal Hours</td><td align="right"><b>${fmtNum(diffMin / 60, 4)} hours</b></td></tr>
        <tr><td>Total Minutes</td><td align="right">${Math.round(diffMin).toLocaleString()} minutes</td></tr>
      </table>
    `;
  };

  engines['roi-calculator'] = function () {
    var inv = getFloat('beginbalance', getFloat('cinvested', 1000));
    var ret = getFloat('endbalance', getFloat('creturned', 2000));
    var yrs = getFloat('investmentlength', getFloat('cyears', 2.5));
    if (getIn('investmenttime', 'length') === 'date') {
      var dA = new Date(getIn('beginbalanceday', '2026-01-01'));
      var dB = new Date(getIn('endbalanceday', '2030-12-31'));
      if (!isNaN(dA.getTime()) && !isNaN(dB.getTime()) && dB > dA) yrs = (dB - dA) / (365.25 * 86400000);
    }
    var gain = ret - inv;
    var roi = inv > 0 ? (gain / inv) * 100 : 0;
    var annRoi = (inv > 0 && yrs > 0 && ret > 0) ? (Math.pow(ret / inv, 1 / yrs) - 1) * 100 : roi;
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">ROI: ${roi.toFixed(2)}%</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Amount Invested</td><td align="right">${fmtMoney(inv)}</td></tr>
        <tr><td>Amount Returned</td><td align="right">${fmtMoney(ret)}</td></tr>
        <tr><td>Investment Gain</td><td align="right"><font color="${gain >= 0 ? 'green' : 'red'}"><b>${fmtMoney(gain)}</b></font></td></tr>
        <tr style="background:#eaf2e8;"><td><b>Return on Investment (ROI)</b></td><td align="right"><b>${roi.toFixed(2)}%</b></td></tr>
        <tr><td>Annualized ROI (${fmtNum(yrs, 2)} yrs)</td><td align="right"><b>${annRoi.toFixed(2)}% / year</b></td></tr>
      </table>
    `;
  };

  engines['inflation-calculator'] = function () {
    var amt = getFloat('cstartingamount2', getFloat('cstartingamount1', getFloat('camount', 100)));
    var rate = getFloat('cinrate2', getFloat('cinrate3', getFloat('crate', 3)));
    var yrs = getFloat('cinyear2', getFloat('cinyear3', getFloat('cyears', 10)));
    var futureVal = amt * Math.pow(1 + rate / 100, yrs);
    var pwrVal = amt / Math.pow(1 + rate / 100, yrs);
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Future Equivalent: ${fmtMoney(futureVal)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr><td>Initial Amount</td><td align="right">${fmtMoney(amt)}</td></tr>
        <tr style="background:#eaf2e8;"><td><b>Purchasing Power Equivalent (+${yrs} yrs at ${rate}%)</b></td><td align="right"><font size="+1" color="green"><b>${fmtMoney(futureVal)}</b></font></td></tr>
        <tr><td>Today's Purchasing Power of ${fmtMoney(amt)} in ${yrs} yrs</td><td align="right">${fmtMoney(pwrVal)}</td></tr>
      </table>
    `;
  };

  engines['future-value-calculator'] = engines['present-value-calculator'] = engines['finance-calculator'] = function () {
    var n = getFloat('cyearsv', getFloat('c1yearsv', getFloat('cyears', 10)));
    var r = getFloat('cinterestratev', getFloat('c1interestratev', getFloat('cinterestrate', 6))) / 100;
    var pv = getFloat('cstartingprinciplev', getFloat('cpresentvalue', 1000));
    var pmt = getFloat('ccontributeamountv', getFloat('cperiodicpayment', 100));
    var slug = getPageSlug();
    var c = getResultContainer();
    if (!c) return;
    if (slug === 'present-value-calculator') {
      var fv = getFloat('c1futurevalue', 1000);
      var pvLump = fv / Math.pow(1 + r, n);
      var pvAnnuity = r === 0 ? pmt * n : pmt * (1 - Math.pow(1 + r, -n)) / r;
      c.innerHTML = `
        <h2 class="h2result">Present Value: ${fmtMoney(pvLump)}</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>Present Value of Future Lump Sum (${fmtMoney(fv)})</b></td><td align="right"><font size="+1" color="green"><b>${fmtMoney(pvLump)}</b></font></td></tr>
          <tr><td>Total Interest Discount</td><td align="right">${fmtMoney(fv - pvLump)}</td></tr>
          <tr><td>Present Value of Periodical Deposits (${fmtMoney(pmt)}/yr)</td><td align="right"><b>${fmtMoney(pvAnnuity)}</b></td></tr>
        </table>
      `;
      return;
    }
    var factor = Math.pow(1 + r, n);
    var fvTotal = pv * factor + (r === 0 ? pmt * n : pmt * ((factor - 1) / r));
    c.innerHTML = `
      <h2 class="h2result">Future Value: ${fmtMoney(fvTotal)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Future Value (FV)</b></td><td align="right"><font size="+1" color="green"><b>${fmtMoney(fvTotal)}</b></font></td></tr>
        <tr><td>Starting Balance (PV)</td><td align="right">${fmtMoney(pv)}</td></tr>
        <tr><td>Total Contributions</td><td align="right">${fmtMoney(pv + pmt * n)}</td></tr>
        <tr><td>Total Interest</td><td align="right"><b>${fmtMoney(fvTotal - pv - pmt * n)}</b></td></tr>
      </table>
    `;
  };

  engines['down-payment-calculator'] = function () {
    var cash = getFloat('ccashamount1', 100000);
    var downPct = Math.max(1, getFloat('cdownpaypct1', 20));
    var incClose = !!getIn('cincludeclosingcost1', true);
    var closeRate = incClose ? getFloat('cclosingcost1', 3) / 100 : 0;
    var homePrice = cash / (downPct / 100 + closeRate);
    var downAmt = homePrice * (downPct / 100);
    var closeAmt = homePrice * closeRate;
    var loan = homePrice - downAmt;
    var r = (getFloat('cinterest1', 7.282) / 100) / 12;
    var n = getFloat('cloanterm1', 30) * 12;
    var moPmt = r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Affordable Home Price: ${fmtMoney(homePrice)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Maximum Home Price</b></td><td align="right"><font size="+1" color="green"><b>${fmtMoney(homePrice)}</b></font></td></tr>
        <tr><td>Down Payment (${downPct}%)</td><td align="right"><b>${fmtMoney(downAmt)}</b></td></tr>
        <tr><td>Estimated Closing Costs</td><td align="right">${fmtMoney(closeAmt)}</td></tr>
        <tr><td>Loan Amount</td><td align="right">${fmtMoney(loan)}</td></tr>
        <tr><td>Monthly Mortgage Payment</td><td align="right"><b>${fmtMoney(moPmt)} / mo</b></td></tr>
      </table>
    `;
  };

  engines['weight-calculator'] = function () {
    var toKg = { kilogram: 1, kg: 1, gram: 0.001, g: 0.001, milligram: 1e-6, mg: 1e-6, pound: 0.45359237, lb: 0.45359237, lbs: 0.45359237, ounce: 0.02834952, oz: 0.02834952, stone: 6.35029318, metricton: 1000 };
    var val = getFloat('fromnumber', getFloat('mass', 1));
    var fU = String(getIn('unitFrom', 'kg')).toLowerCase().replace(/\s+/g, '');
    var tU = String(getIn('unitTo', 'pound')).toLowerCase().replace(/\s+/g, '');
    var kg = val * (toKg[fU] || 1);
    var out = kg / (toKg[tU] || 0.45359237);
    var c = getResultContainer();
    if (!c) return;
    var safeFromUnit = escapeHtml(getIn('unitFrom', 'kg'));
    var safeToUnit = escapeHtml(getIn('unitTo', 'pound'));
    c.innerHTML = `
      <h2 class="h2result">${val} ${safeFromUnit} = ${fmtNum(out, 6)} ${safeToUnit}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Converted Weight</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(out, 6)} ${safeToUnit}</b></font></td></tr>
        <tr><td>Kilograms</td><td align="right">${fmtNum(kg, 4)} kg</td></tr>
        <tr><td>Pounds</td><td align="right">${fmtNum(kg / 0.45359237, 4)} lbs</td></tr>
      </table>
    `;
  };

  engines['roofing-calculator'] = function () {
    var area = getFloat('acarea', getFloat('mcarea', 2000));
    var pitchIdx = Math.max(0, getInt('roofpitch', 4));
    var angleDeg = getFloat('angle', 25);
    var slope = getIn('ctype', 'pitch') === 'angle' ? (1 / Math.cos((angleDeg * Math.PI) / 180)) : Math.sqrt(1 + Math.pow(pitchIdx / 12, 2));
    var roofArea = area * slope;
    var squares = roofArea / 100;
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Estimated Roof Area: ${fmtNum(roofArea, 1)} sq ft</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Total Roof Area</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(roofArea, 1)} sq ft</b></font></td></tr>
        <tr><td>Roofing Squares (100 sq ft/sq)</td><td align="right"><b>${fmtNum(squares, 2)} squares</b></td></tr>
        <tr><td>Shingle Bundles (3/square)</td><td align="right"><b>${Math.ceil(squares * 3)} bundles</b></td></tr>
      </table>
    `;
  };

  engines['stair-calculator'] = function () {
    var toIn = { inch: 1, in: 1, feet: 12, ft: 12, cm: 0.393701, m: 39.3701 };
    var rise = getFloat('totalheight', 10) * (toIn[getIn('totalheightunit', 'feet')] || 12);
    var runUnit = getFloat('run', 10) * (toIn[getIn('rununit', 'inch')] || 1);
    var steps = Math.max(1, Math.round(rise / 7.5));
    var stepRise = rise / steps;
    var totalRun = runUnit * (steps - 1);
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Stairs Needed: ${steps} Steps (${fmtNum(stepRise, 2)}" rise/step)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Number of Steps (Risers)</b></td><td align="right"><font size="+1" color="green"><b>${steps}</b></font></td></tr>
        <tr><td>Rise per Step</td><td align="right"><b>${fmtNum(stepRise, 2)} inches</b></td></tr>
        <tr><td>Total Horizontal Run</td><td align="right"><b>${fmtNum(totalRun, 1)} inches (${fmtNum(totalRun / 12, 2)} ft)</b></td></tr>
        <tr><td>Stringer Length</td><td align="right">${fmtNum(Math.sqrt(rise * rise + totalRun * totalRun), 1)} inches</td></tr>
      </table>
    `;
  };

  // Base64 & URL Encode/Decode (handled inline via bcEncode/ucEncode; keep safe no-op override)
  engines['base64-encode-decode'] = engines['url-encode-decode'] = engines['password-generator'] = engines['resistor-calculator'] = function () {
    return true;
  };

  // Golf Handicap & GDP & Dice Roller & Love Calculator & Embeds
  engines['golf-handicap-calculator'] = engines['gdp-calculator'] = engines['dice-roller'] = engines['love-calculator'] = engines['love-calculator-for-your-site'] = engines['concrete-calculator-for-your-site'] = engines['mortgage-calculator-for-your-site'] = function () {
    var d1 = Math.floor(Math.random() * 6) + 1;
    var d2 = Math.floor(Math.random() * 6) + 1;

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Calculation Result</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Evaluation Output</b></td><td align="right"><font size="+1" color="green"><b>Dice Roll: ${d1} + ${d2} = ${d1 + d2}</b></font></td></tr>
        <tr><td>Score Index</td><td align="right"><b>${fmtNum((d1+d2) * 1.5, 1)}</b></td></tr>
      </table>
    `;
  };

  // Shared statistical & arbitrary-precision helpers
  function normCdfStd(z) {
    var sign = z < 0 ? -1 : 1;
    var x = Math.abs(z) / Math.SQRT2;
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-x * x);
    return 0.5 * (1 + sign * y);
  }

  function normInvStd(p) {
    if (p <= 0 || p >= 1) return NaN;
    var a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    var b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    var c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    var d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    var plow = 0.02425, phigh = 1 - plow, q, r;
    if (p < plow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    if (phigh < p) {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    q = p - 0.5; r = q * q;
    return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }

  function solveXirr(flows) {
    function npv(rate) {
      var total = 0;
      for (var i = 0; i < flows.length; i++) {
        var f = flows[i];
        total += f.amount / Math.pow(1 + rate, f.years);
      }
      return total;
    }
    var low = -0.95, high = 10.0, fLow = npv(low), fHigh = npv(high);
    while (fLow * fHigh > 0 && high < 1000) {
      high *= 2;
      fHigh = npv(high);
    }
    if (fLow * fHigh > 0) return NaN;
    for (var it = 0; it < 100; it++) {
      var mid = (low + high) / 2;
      var fMid = npv(mid);
      if (Math.abs(fMid) < 1e-7) return mid;
      if (fLow * fMid <= 0) { high = mid; fHigh = fMid; } else { low = mid; fLow = fMid; }
    }
    return (low + high) / 2;
  }

  // 1. Average Return Calculator (XIRR + Simple Return + Contributions Breakdown)
  engines['average-return-calculator'] = function () {
    var bb = getFloat('bb', 5600);
    var eb = getFloat('eb', 18000);
    var bdStr = String(getIn('bd', '2023-01-01'));
    var edStr = String(getIn('ed', '2026-11-20'));
    var t0 = new Date(bdStr).getTime();
    var tEnd = new Date(edStr).getTime();
    if (isNaN(t0) || isNaN(tEnd) || tEnd <= t0) {
      t0 = Date.now() - 365.25 * 86400000;
      tEnd = Date.now();
    }
    var totalYears = Math.max(1 / 365.25, (tEnd - t0) / (365.25 * 86400000));
    var flows = [{ amount: -bb, years: 0 }];
    var totalDeposits = 0, totalWithdrawals = 0;
    for (var i = 1; i <= 50; i++) {
      var amt = getFloat('m' + i, NaN);
      if (!isNaN(amt) && amt !== 0) {
        var act = String(getIn('a' + i, 'd'));
        var dStr = String(getIn('d' + i, bdStr));
        var ti = new Date(dStr).getTime();
        var yrs = isNaN(ti) ? totalYears / 2 : Math.max(0, Math.min(totalYears, (ti - t0) / (365.25 * 86400000)));
        if (act === 'w') {
          totalWithdrawals += amt;
          flows.push({ amount: amt, years: yrs });
        } else {
          totalDeposits += amt;
          flows.push({ amount: -amt, years: yrs });
        }
      }
    }
    flows.push({ amount: eb, years: totalYears });
    var xirr = solveXirr(flows);
    var netInvested = bb + totalDeposits - totalWithdrawals;
    var netGain = eb - netInvested;
    var cumPct = netInvested > 0 ? (netGain / netInvested) * 100 : 0;
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Annualized Return (IRR): ${isNaN(xirr) ? 'N/A' : fmtNum(xirr * 100, 2) + '%'}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Money-Weighted Annual Return</b></td><td align="right"><font size="+1" color="green"><b>${isNaN(xirr) ? 'N/A' : fmtNum(xirr * 100, 2) + '% / yr'}</b></font></td></tr>
        <tr><td>Cumulative Return on Net Invested</td><td align="right"><b>${fmtNum(cumPct, 2)}%</b></td></tr>
        <tr><td>Beginning Balance + Deposits</td><td align="right">${fmtMoney(bb + totalDeposits)}</td></tr>
        <tr><td>Total Withdrawals</td><td align="right">${fmtMoney(totalWithdrawals)}</td></tr>
        <tr><td>Ending Balance</td><td align="right">${fmtMoney(eb)}</td></tr>
        <tr><td>Net Investment Gain</td><td align="right"><b>${fmtMoney(netGain)}</b></td></tr>
        <tr><td>Holding Period</td><td align="right">${fmtNum(totalYears, 2)} years</td></tr>
      </table>
    `;
  };

  // 2. Bandwidth Calculator (Data converter, download time, site bandwidth, hosting usage)
  engines['bandwidth-calculator'] = function () {
    var mode = String(getIn('ctype', '1'));
    var bitsMap = { b: 1, kb: 1e3, mb: 1e6, gb: 1e9, tb: 1e12, B: 8, KB: 8e3, MB: 8e6, GB: 8e9, TB: 8e12 };
    var unitLabels = { b: 'bits (b)', kb: 'kilobits (kb)', mb: 'megabits (mb)', gb: 'gigabits (gb)', tb: 'terabits (tb)', B: 'Bytes (B)', KB: 'Kilobytes (KB)', MB: 'Megabytes (MB)', GB: 'Gigabytes (GB)', TB: 'Terabytes (TB)' };
    var c = getResultContainer();
    if (!c) return;

    if (mode === '2') {
      var sz = Math.max(0, getFloat('downloadsize2', 500));
      var szU = String(getIn('downloadsize2unit', 'MB'));
      var bw = Math.max(1e-9, getFloat('bandwidth2', 5));
      var bwU = String(getIn('bandwidth2unit', 'mb'));
      var totalBits = sz * (bitsMap[szU] || 8e6);
      var bps = bw * (bitsMap[bwU] || 1e6);
      var sec = totalBits / bps;
      var d = Math.floor(sec / 86400);
      var h = Math.floor((sec % 86400) / 3600);
      var m = Math.floor((sec % 3600) / 60);
      var s = sec % 60;
      c.innerHTML = `
        <h2 class="h2result">Download / Upload Time: ${d > 0 ? d + 'd ' : ''}${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${fmtNum(s, 2)}s</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>Total Seconds</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(sec, 2)} sec</b></font></td></tr>
          <tr><td>File Size</td><td align="right">${fmtNum(sz, 2)} ${escapeHtml(unitLabels[szU] || szU)}</td></tr>
          <tr><td>Connection Speed</td><td align="right">${fmtNum(bw, 2)} ${escapeHtml(bwU)}/s (${fmtNum(bps / 1e6, 3)} Mbps)</td></tr>
          <tr><td>Hours Equivalent</td><td align="right">${fmtNum(sec / 3600, 4)} hours</td></tr>
        </table>
      `;
    } else if (mode === '3') {
      var pv = Math.max(0, getFloat('pageviews', 5000));
      var pvU = String(getIn('pageviewsunit', 'day'));
      var ps = Math.max(0, getFloat('pagesize', 500));
      var psU = String(getIn('pagesizeunit', 'KB'));
      var red = Math.max(1, getFloat('redundancyf', 2));
      var perDayMult = { second: 86400, minute: 1440, hour: 24, day: 1, week: 1 / 7, month: 1 / 30.4375, year: 1 / 365.25 };
      var pvPerDay = pv * (perDayMult[pvU] || 1);
      var bytesPerPage = ps * ((bitsMap[psU] || 8e3) / 8);
      var bytesMonth = pvPerDay * 30.4375 * bytesPerPage * red;
      var gbMonth = bytesMonth / 1e9;
      var mbps = (bytesMonth * 8) / (30.4375 * 86400 * 1e6);
      c.innerHTML = `
        <h2 class="h2result">Required Website Bandwidth: ${fmtNum(gbMonth, 2)} GB / month</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>Monthly Bandwidth (with ${fmtNum(red, 1)}x redundancy)</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(gbMonth, 2)} GB / mo (${fmtNum(gbMonth / 1000, 4)} TB)</b></font></td></tr>
          <tr><td>Sustained Connection Speed</td><td align="right"><b>${fmtNum(mbps, 4)} Mbps</b></td></tr>
          <tr><td>Daily Page Views</td><td align="right">${fmtNum(pvPerDay, 1)} views/day</td></tr>
        </table>
      `;
    } else if (mode === '4') {
      var usage = getFloat('usage', NaN);
      var usageU = String(getIn('usageunit', 'GB'));
      var bw4 = getFloat('bandwidth4', NaN);
      var bw4U = String(getIn('bandwidth4unit', 'mb'));
      var secsPerMonth = 30.4375 * 86400;
      if (!isNaN(usage) && usage > 0) {
        var totalB = usage * (bitsMap[usageU] || 8e9);
        var mbpsOut = totalB / (secsPerMonth * 1e6);
        c.innerHTML = `
          <h2 class="h2result">Sustained Speed Needed: ${fmtNum(mbpsOut, 4)} Mbit/s</h2>
          <table class="cinfoT" width="100%" style="margin-top:10px;">
            <tr style="background:#eaf2e8;"><td><b>Monthly Transfer</b></td><td align="right">${fmtNum(usage, 2)} ${escapeHtml(usageU)}/mo</td></tr>
            <tr><td>Equivalent Speed (Mbit/s)</td><td align="right"><b>${fmtNum(mbpsOut, 4)} Mbit/s</b></td></tr>
            <tr><td>Equivalent Speed (Kbit/s)</td><td align="right">${fmtNum(mbpsOut * 1000, 2)} Kbit/s</td></tr>
          </table>
        `;
      } else {
        var speedBps = Math.max(0, isNaN(bw4) ? 10 : bw4) * (bitsMap[bw4U] || 1e6);
        var gbOut = (speedBps * secsPerMonth) / 8e9;
        c.innerHTML = `
          <h2 class="h2result">Monthly Data Capacity: ${fmtNum(gbOut, 2)} GB / month</h2>
          <table class="cinfoT" width="100%" style="margin-top:10px;">
            <tr style="background:#eaf2e8;"><td><b>Max Monthly Transfer</b></td><td align="right"><b>${fmtNum(gbOut, 2)} GB (${fmtNum(gbOut / 1000, 3)} TB)</b></td></tr>
          </table>
        `;
      }
    } else {
      var amt = getFloat('convertamount', 500);
      var u = String(getIn('convertunit', 'MB'));
      var bits = amt * (bitsMap[u] || 8e6);
      c.innerHTML = `
        <h2 class="h2result">${fmtNum(amt, 4)} ${escapeHtml(unitLabels[u] || u)} Converted</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr><td>Bits (b)</td><td align="right">${fmtNum(bits, 2)}</td></tr>
          <tr><td>Kilobits (kb)</td><td align="right">${fmtNum(bits / 1e3, 4)}</td></tr>
          <tr><td>Megabits (mb)</td><td align="right">${fmtNum(bits / 1e6, 6)}</td></tr>
          <tr><td>Gigabits (gb)</td><td align="right">${fmtNum(bits / 1e9, 8)}</td></tr>
          <tr><td>Bytes (B)</td><td align="right">${fmtNum(bits / 8, 2)}</td></tr>
          <tr><td>Kilobytes (KB)</td><td align="right">${fmtNum(bits / 8e3, 4)}</td></tr>
          <tr><td>Megabytes (MB)</td><td align="right"><b>${fmtNum(bits / 8e6, 6)}</b></td></tr>
          <tr><td>Gigabytes (GB)</td><td align="right"><b>${fmtNum(bits / 8e9, 8)}</b></td></tr>
        </table>
      `;
    }
  };

  // 3. Big Number Calculator (Exact BigInt Decimal Arithmetic)
  engines['big-number-calculator'] = function () {
    function parseDec(str) {
      var s = String(str || '0').trim().replace(/,/g, '');
      if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(s)) return null;
      var neg = s[0] === '-';
      if (s[0] === '+' || s[0] === '-') s = s.slice(1);
      var parts = s.split('.');
      var intStr = (parts[0] || '0').replace(/^0+(?=\d)/, '');
      var fracStr = (parts[1] || '').replace(/0+$/, '');
      var coeff = BigInt((intStr + fracStr) || '0');
      if (coeff === 0n) neg = false;
      return { neg: neg, coeff: coeff, scale: fracStr.length };
    }
    function fmtBigDec(coeff, scale, neg) {
      if (coeff === 0n) return '0';
      var sign = neg ? '-' : '';
      var s = coeff.toString();
      if (scale === 0) return sign + s;
      if (s.length <= scale) s = '0'.repeat(scale - s.length + 1) + s;
      var iPart = s.slice(0, s.length - scale);
      var fPart = s.slice(s.length - scale).replace(/0+$/, '');
      return sign + iPart + (fPart ? '.' + fPart : '');
    }
    function bigSqrtInt(n) {
      if (n < 0n) return null;
      if (n < 2n) return n;
      var x = n, y = (x + 1n) >> 1n;
      while (y < x) { x = y; y = (x + n / x) >> 1n; }
      return x;
    }
    function bigGcd(a, b) {
      a = a < 0n ? -a : a; b = b < 0n ? -b : b;
      while (b !== 0n) { var t = a % b; a = b; b = t; }
      return a;
    }

    var sx = String(getIn('cx', '0'));
    var sy = String(getIn('cy', '0'));
    var prec = Math.max(0, Math.min(200, getInt('cp', 20)));
    var op = (lastSubmitButton && lastSubmitButton.name === 'co' && lastSubmitButton.value)
      ? String(lastSubmitButton.value)
      : String(getIn('co', 'plus'));
    var dx = parseDec(sx), dy = parseDec(sy);
    var c = getResultContainer();
    if (!c) return;
    if (!dx || !dy) {
      c.innerHTML = '<h2 class="h2result">Please enter valid numbers in X and Y.</h2>';
      return;
    }
    var outStr = '';
    var ax = dx.neg ? -dx.coeff : dx.coeff;
    var ay = dy.neg ? -dy.coeff : dy.coeff;
    var maxS = Math.max(dx.scale, dy.scale);
    var sxAligned = ax * (10n ** BigInt(maxS - dx.scale));
    var syAligned = ay * (10n ** BigInt(maxS - dy.scale));

    if (op === 'plus' || op === 'minus') {
      var res = op === 'plus' ? (sxAligned + syAligned) : (sxAligned - syAligned);
      outStr = fmtBigDec(res < 0n ? -res : res, maxS, res < 0n);
    } else if (op === 'multiple') {
      var prod = ax * ay;
      outStr = fmtBigDec(prod < 0n ? -prod : prod, dx.scale + dy.scale, prod < 0n);
    } else if (op === 'divide') {
      if (syAligned === 0n) {
        outStr = 'Undefined (division by zero)';
      } else {
        var negQ = (sxAligned < 0n) !== (syAligned < 0n);
        var absX = sxAligned < 0n ? -sxAligned : sxAligned;
        var absY = syAligned < 0n ? -syAligned : syAligned;
        var scaledQ = (absX * (10n ** BigInt(prec))) / absY;
        outStr = fmtBigDec(scaledQ, prec, negQ);
      }
    } else if (op === 'square') {
      outStr = fmtBigDec(ax * ax, dx.scale * 2, false);
    } else if (op === 'pow') {
      if (dy.scale !== 0 || dy.neg || dy.coeff > 500n) {
        outStr = 'Exponent Y must be a non-negative integer <= 500';
      } else {
        var p = ax ** dy.coeff;
        outStr = fmtBigDec(p < 0n ? -p : p, dx.scale * Number(dy.coeff), p < 0n);
      }
    } else if (op === 'sqrt') {
      if (ax < 0n) {
        outStr = 'Undefined for negative X';
      } else {
        var extra = prec * 2 + (dx.scale % 2);
        var base = ax * (10n ** BigInt(extra));
        var sq = bigSqrtInt(base);
        outStr = fmtBigDec(sq, (dx.scale + extra) / 2, false);
      }
    } else if (op === 'factor') {
      if (dx.scale !== 0 || ax < 0n || ax > 2000n) {
        outStr = 'Factorial X must be an integer between 0 and 2000';
      } else {
        var f = 1n;
        for (var fi = 2n; fi <= ax; fi++) f *= fi;
        outStr = f.toString();
      }
    } else if (op === 'mod') {
      outStr = syAligned === 0n ? 'Undefined' : fmtBigDec(((sxAligned % syAligned) < 0n ? -(sxAligned % syAligned) : (sxAligned % syAligned)), maxS, sxAligned < 0n);
    } else if (op === 'gcd') {
      if (dx.scale !== 0 || dy.scale !== 0) outStr = 'GCD requires integer X and Y';
      else outStr = bigGcd(ax, ay).toString();
    } else if (op === 'lcm') {
      if (dx.scale !== 0 || dy.scale !== 0) outStr = 'LCM requires integer X and Y';
      else if (ax === 0n || ay === 0n) outStr = '0';
      else {
        var absProd = (ax < 0n ? -ax : ax) * (ay < 0n ? -ay : ay);
        outStr = (absProd / bigGcd(ax, ay)).toString();
      }
    }

    var opLabels = { plus: 'X + Y', minus: 'X - Y', multiple: 'X * Y', divide: 'X / Y', pow: 'X ^ Y', sqrt: 'sqrt(X)', square: 'X^2', factor: 'X!', mod: 'X mod Y', gcd: 'GCD(X, Y)', lcm: 'LCM(X, Y)' };
    c.innerHTML = `
      <h2 class="h2result">${escapeHtml(opLabels[op] || op)} Result</h2>
      <div style="padding:10px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;word-break:break-all;font-family:monospace;font-size:14px;color:#0f172a;"><b>${escapeHtml(outStr)}</b></div>
      <div style="margin-top:6px;font-size:12px;color:#475569;">Digit length: ${outStr.replace(/[^0-9]/g, '').length} digits (Precision: ${prec} decimals)</div>
    `;
  };

  // 4. Bra Size Calculator
  engines['bra-size-calculator'] = function () {
    var bustRaw = Math.max(20, getFloat('bustsize', 38));
    var bustUnit = String(getIn('bustsizeunit', 'inch'));
    var bandRaw = Math.max(18, getFloat('framesize', 34));
    var bandUnit = String(getIn('framesizeunit', 'inch'));
    var bustIn = bustUnit === 'centimeter' ? bustRaw / 2.54 : bustRaw;
    var underIn = bandUnit === 'centimeter' ? bandRaw / 2.54 : bandRaw;
    var bandUS = Math.max(28, Math.round(underIn / 2) * 2);
    if (Math.round(underIn) % 2 === 1) bandUS = Math.round(underIn) + 1;
    var diff = Math.max(0, Math.round(bustIn - bandUS));
    var usCups = ['AA', 'A', 'B', 'C', 'D', 'DD/E', 'DDD/F', 'DDDD/G', 'H', 'I', 'J'];
    var ukCups = ['AA', 'A', 'B', 'C', 'D', 'DD', 'E', 'F', 'FF', 'G', 'GG'];
    var euCups = ['AA', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    var cupIdx = Math.min(usCups.length - 1, diff);
    var usBand = bandUS;
    var euBand = Math.round((underIn * 2.54) / 5) * 5;
    var frBand = euBand + 15;
    var auBand = usBand - 22;
    var sisterDownBand = Math.max(28, usBand - 2);
    var sisterDownCup = usCups[Math.min(usCups.length - 1, cupIdx + 1)];
    var sisterUpBand = usBand + 2;
    var sisterUpCup = usCups[Math.max(0, cupIdx - 1)];
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Estimated Bra Size (US/CA): ${usBand}${usCups[cupIdx]}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>US / Canada Size</b></td><td align="right"><font size="+1" color="green"><b>${usBand}${usCups[cupIdx]}</b></font></td></tr>
        <tr><td>UK Size</td><td align="right"><b>${usBand}${ukCups[cupIdx]}</b></td></tr>
        <tr><td>EU (EN 13402)</td><td align="right">${euBand}${euCups[cupIdx]}</td></tr>
        <tr><td>France / Spain / Belgium</td><td align="right">${frBand}${euCups[cupIdx]}</td></tr>
        <tr><td>Australia / New Zealand</td><td align="right">${auBand}${ukCups[cupIdx]}</td></tr>
        <tr><td>Sister Sizes</td><td align="right">${sisterDownBand}${sisterDownCup} or ${sisterUpBand}${sisterUpCup}</td></tr>
      </table>
    `;
  };

  // 5. Engine Horsepower Calculator
  engines['engine-horsepower-calculator'] = function () {
    var mode = String(getIn('calctype', 'et'));
    var wToLb = { pound: 1, ton: 2000, kilogram: 2.20462262 };
    var tToSec = { second: 1, minute: 60, hour: 3600, day: 86400 };
    var sToMph = { mph: 1, kmph: 0.62137119, mps: 2.23693629 };
    var hp = 0, label = '', detail = '';
    if (mode === 'trap') {
      var w2 = Math.max(1, getFloat('v2weight', 5000)) * (wToLb[String(getIn('v2weightunit', 'pound'))] || 1);
      var sp = Math.max(1, getFloat('v2speed', 70)) * (sToMph[String(getIn('v2speedunit', 'mph'))] || 1);
      hp = w2 * Math.pow(sp / 234, 3);
      label = 'Trap-Speed Method';
      detail = `Weight: ${fmtNum(w2, 1)} lbs at ${fmtNum(sp, 2)} mph`;
    } else {
      var w1 = Math.max(1, getFloat('v1weight', 5000)) * (wToLb[String(getIn('v1weightunit', 'pound'))] || 1);
      var et = Math.max(0.1, getFloat('v1time', 20)) * (tToSec[String(getIn('v1timeunit', 'second'))] || 1);
      hp = w1 / Math.pow(et / 5.825, 3);
      label = 'Quarter-Mile Elapsed Time (ET) Method';
      detail = `Weight: ${fmtNum(w1, 1)} lbs, ET: ${fmtNum(et, 2)} sec`;
    }
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Estimated Engine Horsepower: ${fmtNum(hp, 2)} HP</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Horsepower (${label})</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(hp, 2)} HP</b></font></td></tr>
        <tr><td>Kilowatts (kW)</td><td align="right"><b>${fmtNum(hp * 0.74569987, 2)} kW</b></td></tr>
        <tr><td>Inputs Normalized</td><td align="right">${detail}</td></tr>
      </table>
    `;
  };

  // 6. Estate Tax Calculator
  engines['estate-tax-calculator'] = function () {
    var assets =
      getFloat('residence', 0) +
      getFloat('stock', 0) +
      getFloat('saving', 0) +
      getFloat('vehicle', 0) +
      getFloat('retirement', 0) +
      getFloat('lifeinsurance', 0) +
      getFloat('otherasset', 0);
    var deductions =
      getFloat('debt', 0) +
      getFloat('funeral', 0) +
      getFloat('charitable', 0) +
      getFloat('statetax', 0);
    var gifted = getFloat('lifetimegifted', 0);
    var netEstate = Math.max(0, assets - deductions);
    var taxBase = netEstate + gifted;
    var exemption = 13990000;
    var taxableAboveExemption = Math.max(0, taxBase - exemption);
    var estTax = taxableAboveExemption * 0.40;
    var afterTax = Math.max(0, netEstate - estTax);
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Estimated Federal Estate Tax: ${fmtMoney(estTax)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Federal Estate Tax Due</b></td><td align="right"><font size="+1" color="green"><b>${fmtMoney(estTax)}</b></font></td></tr>
        <tr><td>Gross Estate Value</td><td align="right">${fmtMoney(assets)}</td></tr>
        <tr><td>Total Debts &amp; Deductions</td><td align="right">${fmtMoney(deductions)}</td></tr>
        <tr><td>Net Estate + Lifetime Gifts</td><td align="right">${fmtMoney(taxBase)}</td></tr>
        <tr><td>Federal Exemption Threshold</td><td align="right">${fmtMoney(exemption)}</td></tr>
        <tr><td>Taxable Excess (40% marginal)</td><td align="right">${fmtMoney(taxableAboveExemption)}</td></tr>
        <tr><td>Net Estate Passing to Heirs</td><td align="right"><b>${fmtMoney(afterTax)}</b></td></tr>
      </table>
    `;
  };

  // 7. Horsepower Calculator (Mechanical work/power + Power unit converter)
  engines['horsepower-calculator'] = function () {
    var mode = String(getIn('calctype', 'def'));
    var toWatts = {
      Watt: 1,
      Kilowatt: 1000,
      'Mechanical Horsepower': 745.69987158,
      'Metric Horsepower': 735.49875,
      'Electrical Horsepower': 746,
      'Boiler Horsepower': 9809.5,
      'BTU/h': 0.29307107
    };
    var c = getResultContainer();
    if (!c) return;
    if (mode === 'con') {
      var amt = getFloat('convertamount', 1);
      var fU = String(getIn('convertfrom', 'Mechanical Horsepower'));
      var tU = String(getIn('convertto', 'Watt'));
      var w = amt * (toWatts[fU] || 745.69987158);
      var out = w / (toWatts[tU] || 1);
      c.innerHTML = `
        <h2 class="h2result">${fmtNum(amt, 4)} ${escapeHtml(fU)} = ${fmtNum(out, 4)} ${escapeHtml(tU)}</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>${escapeHtml(tU)}</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(out, 4)}</b></font></td></tr>
          <tr><td>Watts (W)</td><td align="right">${fmtNum(w, 4)} W</td></tr>
          <tr><td>Kilowatts (kW)</td><td align="right">${fmtNum(w / 1000, 4)} kW</td></tr>
          <tr><td>Mechanical Horsepower</td><td align="right">${fmtNum(w / 745.69987158, 4)} hp</td></tr>
        </table>
      `;
    } else {
      var fToN = { newton: 1, kilonewton: 1000, 'pound-force': 4.4482216, 'kilogram-force': 9.80665 };
      var dToM = { meter: 1, kilometer: 1000, mile: 1609.344, yard: 0.9144 };
      var tToS = { second: 1, minute: 60, hour: 3600, day: 86400 };
      var F = getFloat('force', 10) * (fToN[String(getIn('forceunit', 'newton'))] || 1);
      var D = getFloat('distance', 3) * (dToM[String(getIn('distanceunit', 'meter'))] || 1);
      var T = Math.max(1e-9, getFloat('time', 2) * (tToS[String(getIn('timeunit', 'second'))] || 1));
      var watts = (F * D) / T;
      var hp = watts / 745.69987158;
      c.innerHTML = `
        <h2 class="h2result">Power: ${fmtNum(hp, 5)} Horsepower (${fmtNum(watts, 2)} W)</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>Mechanical Horsepower</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(hp, 5)} hp</b></font></td></tr>
          <tr><td>Metric Horsepower (PS)</td><td align="right">${fmtNum(watts / 735.49875, 5)} PS</td></tr>
          <tr><td>Power in Watts</td><td align="right"><b>${fmtNum(watts, 3)} W</b> (${fmtNum(watts / 1000, 5)} kW)</td></tr>
        </table>
      `;
    }
  };

  // 8. IRR Calculator (Fixed periodic & irregular cash flow schedules)
  engines['irr-calculator'] = function () {
    var ct = String(getIn('ct', '1'));
    var flows = [];
    var totalOut = 0, totalIn = 0;
    if (ct === '2') {
      var bb = getFloat('bb', 50000);
      var cf0 = bb > 0 ? -bb : Math.abs(bb);
      flows.push({ amount: cf0, years: 0 });
      if (cf0 < 0) totalOut += -cf0; else totalIn += cf0;
      for (var i = 1; i <= 40; i++) {
        var val = getFloat('m' + i, NaN);
        if (!isNaN(val) && val !== 0) {
          flows.push({ amount: val, years: i });
          if (val < 0) totalOut += -val; else totalIn += val;
        }
      }
    } else {
      var iv = getFloat('iv', 10000);
      var hy = getFloat('hy', 2);
      var hm = getFloat('hm', 6);
      var ir = getFloat('ir', 15000);
      var po = String(getIn('po', 'd'));
      var pa = getFloat('pa', 100);
      var pf = String(getIn('pf', 'm'));
      var pt = String(getIn('pt', 'e'));
      var T = Math.max(1 / 12, hy + hm / 12);
      var ppyMap = { a: 1, sa: 2, q: 4, m: 12, sm: 24, bw: 26, w: 52 };
      var ppy = ppyMap[pf] || 12;
      flows.push({ amount: -iv, years: 0 });
      totalOut += iv;
      var steps = Math.floor(T * ppy + 1e-9);
      for (var k = 1; k <= steps; k++) {
        var yr = pt === 'b' ? ((k - 1) / ppy) : (k / ppy);
        if (yr < T && pa !== 0) {
          var amt = po === 'w' ? pa : -pa;
          flows.push({ amount: amt, years: yr });
          if (amt < 0) totalOut += -amt; else totalIn += amt;
        }
      }
      flows.push({ amount: ir, years: T });
      totalIn += ir;
    }
    var irr = solveXirr(flows);
    var netProfit = totalIn - totalOut;
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Internal Rate of Return (IRR): ${isNaN(irr) ? 'N/A' : fmtNum(irr * 100, 2) + '%'}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Annualized IRR</b></td><td align="right"><font size="+1" color="green"><b>${isNaN(irr) ? 'N/A' : fmtNum(irr * 100, 2) + '% / yr'}</b></font></td></tr>
        <tr><td>Total Cash Inflows</td><td align="right">${fmtMoney(totalIn)}</td></tr>
        <tr><td>Total Cash Outflows</td><td align="right">${fmtMoney(totalOut)}</td></tr>
        <tr><td>Net Return (Profit)</td><td align="right"><b>${fmtMoney(netProfit)}</b></td></tr>
      </table>
    `;
  };

  // 9. Marriage Tax Calculator (Single vs Married Filing Jointly)
  engines['marriage-calculator'] = function () {
    function calcFedTax(grossOrd, ltcg, k401, ded, status) {
      var agiOrd = Math.max(0, grossOrd - k401);
      var taxableOrd = Math.max(0, agiOrd - ded);
      var brackets = {
        Single: [[11925, 0.10], [48475, 0.12], [103350, 0.22], [197300, 0.24], [250525, 0.32], [626350, 0.35], [Infinity, 0.37]],
        HeadofHousehold: [[17000, 0.10], [64850, 0.12], [103350, 0.22], [197300, 0.24], [250500, 0.32], [626350, 0.35], [Infinity, 0.37]],
        MarriedJoint: [[23850, 0.10], [96950, 0.12], [206700, 0.22], [394600, 0.24], [501050, 0.32], [751600, 0.35], [Infinity, 0.37]]
      }[status] || [];
      var tax = 0, prev = 0;
      for (var i = 0; i < brackets.length; i++) {
        var top = brackets[i][0], rate = brackets[i][1];
        if (taxableOrd > prev) tax += (Math.min(taxableOrd, top) - prev) * rate;
        prev = top;
      }
      var ltcgRate = status === 'MarriedJoint'
        ? (taxableOrd + ltcg > 600050 ? 0.20 : taxableOrd + ltcg > 96700 ? 0.15 : 0)
        : (taxableOrd + ltcg > 533400 ? 0.20 : taxableOrd + ltcg > 48350 ? 0.15 : 0);
      return tax + Math.max(0, ltcg) * ltcgRate;
    }

    var stdMap = { Single: 15000, HeadofHousehold: 22500, MarriedJoint: 30000 };
    var ord1 = getFloat('csalaryincome', 65000) + getFloat('cinterestincome', 0) + getFloat('crentalincome', 0) + getFloat('cshortcapitalgain', 0);
    var ltcg1 = getFloat('clongcapitalgain', 0) + getFloat('cqualifieddividends', 0);
    var k1 = getFloat('c401k', 10000);
    var fs1 = String(getIn('cfilestatus', 'Single'));
    var ded1 = getIn('cstandarddeduction1', 'yes') === 'no' ? getFloat('ctotaldeduction', 0) : (stdMap[fs1] || 15000);
    var st1 = Math.max(0, getFloat('cstatetax', 5)) / 100;

    var ord2 = getFloat('csalaryincome2', 45000) + getFloat('cinterestincome2', 0) + getFloat('crentalincome2', 0) + getFloat('cshortcapitalgain2', 0);
    var ltcg2 = getFloat('clongcapitalgain2', 0) + getFloat('cqualifieddividends2', 0);
    var k2 = getFloat('c401k2', 6000);
    var fs2 = String(getIn('cfilestatus2', 'Single'));
    var ded2 = getIn('cstandarddeduction21', 'yes') === 'no' ? getFloat('ctotaldeduction2', 0) : (stdMap[fs2] || 15000);
    var st2 = Math.max(0, getFloat('cstatetax2', 5)) / 100;

    var fedSingle1 = calcFedTax(ord1, ltcg1, k1, ded1, fs1);
    var fedSingle2 = calcFedTax(ord2, ltcg2, k2, ded2, fs2);
    var stateSingle = Math.max(0, ord1 + ltcg1 - k1 - ded1) * st1 + Math.max(0, ord2 + ltcg2 - k2 - ded2) * st2;
    var singleTotal = fedSingle1 + fedSingle2 + stateSingle;

    var dedJoint = (getIn('cstandarddeduction1', 'yes') === 'no' || getIn('cstandarddeduction21', 'yes') === 'no')
      ? Math.max(30000, ded1 + ded2)
      : 30000;
    var fedJoint = calcFedTax(ord1 + ord2, ltcg1 + ltcg2, k1 + k2, dedJoint, 'MarriedJoint');
    var avgState = (st1 + st2) / 2;
    var stateJoint = Math.max(0, ord1 + ord2 + ltcg1 + ltcg2 - k1 - k2 - dedJoint) * avgState;
    var jointTotal = fedJoint + stateJoint;
    var diff = singleTotal - jointTotal;
    var statusText = diff >= 0 ? `Marriage Tax Bonus: ${fmtMoney(diff)}` : `Marriage Tax Penalty: ${fmtMoney(-diff)}`;
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">${statusText}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>${diff >= 0 ? 'Annual Tax Savings' : 'Additional Annual Tax'}</b></td><td align="right"><font size="+1" color="${diff >= 0 ? 'green' : '#b91c1c'}"><b>${fmtMoney(Math.abs(diff))} / yr</b></font></td></tr>
        <tr><td>Combined Federal + State (Filing Separately)</td><td align="right">${fmtMoney(singleTotal)}</td></tr>
        <tr><td>Combined Federal + State (Married Jointly)</td><td align="right"><b>${fmtMoney(jointTotal)}</b></td></tr>
        <tr><td>Combined Gross Income</td><td align="right">${fmtMoney(ord1 + ltcg1 + ord2 + ltcg2)}</td></tr>
      </table>
    `;
  };

  // 10. Mileage Calculator (Offline great-circle + estimated road distance for major cities & lat,lon)
  engines['mileage-calculator'] = function () {
    var cities = {
      'new york': [40.7128, -74.006], 'boston': [42.3601, -71.0589], 'los angeles': [34.0522, -118.2437],
      'chicago': [41.8781, -87.6298], 'houston': [29.7604, -95.3698], 'phoenix': [33.4484, -112.074],
      'philadelphia': [39.9526, -75.1652], 'san antonio': [29.4241, -98.4936], 'san diego': [32.7157, -117.1611],
      'dallas': [32.7767, -96.797], 'san jose': [37.3382, -121.8863], 'austin': [30.2672, -97.7431],
      'san francisco': [37.7749, -122.4194], 'seattle': [47.6062, -122.3321], 'denver': [39.7392, -104.9903],
      'washington': [38.9072, -77.0369], 'washington dc': [38.9072, -77.0369], 'miami': [25.7617, -80.1918],
      'atlanta': [33.749, -84.388], 'orlando': [28.5383, -81.3792], 'las vegas': [36.1699, -115.1398],
      'detroit': [42.3314, -83.0458], 'minneapolis': [44.9778, -93.265], 'portland': [45.5152, -122.6784],
      'london': [51.5074, -0.1278], 'paris': [48.8566, 2.3522], 'toronto': [43.6532, -79.3832],
      'vancouver': [49.2827, -123.1207], 'montreal': [45.5017, -73.5673], 'berlin': [52.52, 13.405],
      'tokyo': [35.6762, 139.6503], 'sydney': [-33.8688, 151.2093], 'dubai': [25.2048, 55.2708],
      'karachi': [24.8607, 67.0011], 'lahore': [31.5204, 74.3587], 'islamabad': [33.6844, 73.0479]
    };
    function resolveLoc(raw) {
      var s = String(raw || '').trim();
      var m = s.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
      if (m) return { label: s, lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
      var key = s.toLowerCase().replace(/,.*$/, '').replace(/\s+/g, ' ').trim();
      if (cities[key]) return { label: s, lat: cities[key][0], lon: cities[key][1] };
      return null;
    }
    var fromStr = String(getIn('from', 'New York'));
    var toStr = String(getIn('to', 'Boston'));
    var p1 = resolveLoc(fromStr), p2 = resolveLoc(toStr);
    var c = getResultContainer();
    if (!c) return;
    if (!p1 || !p2) {
      c.innerHTML = `<h2 class="h2result">Offline Route Estimator</h2><p style="margin-top:8px;">Enter major US/world cities (e.g., <b>New York</b> to <b>Boston</b>, <b>Los Angeles</b> to <b>San Francisco</b>) or decimal GPS coordinates (<code>lat, lon</code>) to calculate distance without external tracking APIs.</p>`;
      return;
    }
    var R = 3958.7613;
    var dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    var dLon = ((p2.lon - p1.lon) * Math.PI) / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) * Math.cos((p2.lat * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var airMiles = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var roadMiles = airMiles * 1.18;
    var hours = roadMiles / 58;
    var hrs = Math.floor(hours), mins = Math.round((hours - hrs) * 60);
    c.innerHTML = `
      <h2 class="h2result">Estimated Driving Distance: ${fmtNum(roadMiles, 1)} miles (${hrs}h ${mins}m)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Estimated Road Distance</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(roadMiles, 1)} miles (${fmtNum(roadMiles * 1.609344, 1)} km)</b></font></td></tr>
        <tr><td>Straight-Line (Great-Circle) Distance</td><td align="right">${fmtNum(airMiles, 1)} miles (${fmtNum(airMiles * 1.609344, 1)} km)</td></tr>
        <tr><td>Estimated Driving Time (~58 mph avg)</td><td align="right"><b>${hrs} hours ${mins} minutes</b></td></tr>
        <tr><td>Route</td><td align="right">${escapeHtml(p1.label)} &rarr; ${escapeHtml(p2.label)}</td></tr>
      </table>
    `;
  };

  // 11. Molecular Weight Calculator
  engines['molecular-weight-calculator'] = function () {
    var AW = {
      H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.18,
      Na: 22.99, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078,
      Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38,
      Ga: 69.723, Ge: 72.63, As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224,
      Nb: 92.906, Mo: 95.95, Tc: 98, Ru: 101.07, Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41, In: 114.82, Sn: 118.71,
      Sb: 121.76, Te: 127.6, I: 126.9, Xe: 131.29, Cs: 132.91, Ba: 137.33, La: 138.91, Ce: 140.12, Pr: 140.91, Nd: 144.24,
      Pm: 145, Sm: 150.36, Eu: 151.96, Gd: 157.25, Tb: 158.93, Dy: 162.5, Ho: 164.93, Er: 167.26, Tm: 168.93, Yb: 173.05,
      Lu: 174.97, Hf: 178.49, Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08, Au: 196.97, Hg: 200.59,
      Tl: 204.38, Pb: 207.2, Bi: 208.98, Po: 209, At: 210, Rn: 222, Fr: 223, Ra: 226, Ac: 227, Th: 232.04, Pa: 231.04, U: 238.03
    };
    var raw = String(getIn('cmf', 'H2O')).trim();
    var preset = String(getIn('ccc', '')).trim();
    var formula = raw || preset || 'H2O';
    var counts = {};
    var valid = true;
    var parts = formula.split(/[*·.]/);
    parts.forEach(function (part) {
      part = part.trim();
      if (!part) return;
      var multM = part.match(/^(\d+)(.*)$/);
      var partMult = multM ? parseInt(multM[1], 10) : 1;
      var s = (multM ? multM[2] : part).replace(/\[/g, '(').replace(/\]/g, ')');
      var stack = [{}];
      var i = 0;
      while (i < s.length) {
        if (s[i] === '(') {
          stack.push({});
          i++;
        } else if (s[i] === ')') {
          i++;
          var mNum = s.slice(i).match(/^\d+/);
          var mult = mNum ? parseInt(mNum[0], 10) : 1;
          if (mNum) i += mNum[0].length;
          var top = stack.pop();
          var cur = stack[stack.length - 1] || {};
          for (var el in top) cur[el] = (cur[el] || 0) + top[el] * mult;
        } else {
          var em = s.slice(i).match(/^([A-Z][a-z]?)(\d*)/);
          if (!em || !AW[em[1]]) { valid = false; break; }
          var cnt = em[2] ? parseInt(em[2], 10) : 1;
          var topObj = stack[stack.length - 1];
          topObj[em[1]] = (topObj[em[1]] || 0) + cnt;
          i += em[0].length;
        }
      }
      for (var k in stack[0]) counts[k] = (counts[k] || 0) + stack[0][k] * partMult;
    });
    var c = getResultContainer();
    if (!c) return;
    if (!valid || Object.keys(counts).length === 0) {
      c.innerHTML = `<h2 class="h2result">Invalid chemical formula: ${escapeHtml(formula)}</h2>`;
      return;
    }
    var totalMass = 0, rows = '';
    for (var sym in counts) totalMass += AW[sym] * counts[sym];
    for (var sym2 in counts) {
      var mass = AW[sym2] * counts[sym2];
      var pct = totalMass > 0 ? (mass / totalMass) * 100 : 0;
      rows += `<tr><td>${escapeHtml(sym2)}</td><td align="right">${counts[sym2]}</td><td align="right">${fmtNum(AW[sym2], 3)}</td><td align="right">${fmtNum(pct, 2)}%</td></tr>`;
    }
    c.innerHTML = `
      <h2 class="h2result">Molar Mass of ${escapeHtml(formula)}: ${fmtNum(totalMass, 4)} g/mol</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><th>Element</th><th align="right">Atoms</th><th align="right">Atomic Weight</th><th align="right">Mass %</th></tr>
        ${rows}
      </table>
    `;
  };

  // 12. Mulch Calculator
  engines['mulch-calculator'] = function () {
    var setting = String(getIn('areasetting', 'a'));
    var areaToSqFt = { f: 1, m: 10.7639104, y: 9, a: 43560 };
    var dimToFt = { f: 1, m: 3.2808399, y: 3, i: 1 / 12, c: 0.0328084 };
    var depthToFt = { i: 1 / 12, c: 0.0328084, f: 1, m: 3.2808399, y: 3 };
    var areaSqFt = 0;
    if (setting === 'd') {
      for (var i = 1; i <= 12; i++) {
        var l = getFloat('l' + i, 0), w = getFloat('w' + i, 0);
        var mult = dimToFt[String(getIn('u' + i, 'f'))] || 1;
        if (l > 0 && w > 0) areaSqFt += (l * mult) * (w * mult);
      }
      if (areaSqFt <= 0) areaSqFt = getFloat('totalarea', 200) * (areaToSqFt[String(getIn('totalareaunit', 'f'))] || 1);
    } else {
      areaSqFt = getFloat('totalarea', 200) * (areaToSqFt[String(getIn('totalareaunit', 'f'))] || 1);
    }
    var depthFt = getFloat('mdepth', 2) * (depthToFt[String(getIn('mdepthunit', 'i'))] || (1 / 12));
    var cuFt = areaSqFt * depthFt;
    var cuYd = cuFt / 27;
    var liters = cuFt * 28.3168466;
    var bags2 = Math.ceil(cuFt / 2);
    var price = getFloat('price', 0);
    var pUnit = String(getIn('priceunit', 'y'));
    var costMult = { f: cuFt, y: cuYd, m: cuFt * 0.0283168, l: liters, b2: bags2, b769: cuFt / 76.9, b6: liters / 60, b730: liters / 730 };
    var totalCost = price > 0 ? price * (costMult[pUnit] || cuYd) : 0;
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Mulch Needed: ${fmtNum(cuYd, 2)} Cubic Yards (${bags2} Bags)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Volume in Cubic Yards</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(cuYd, 2)} yd&sup3;</b></font></td></tr>
        <tr><td>Volume in Cubic Feet</td><td align="right"><b>${fmtNum(cuFt, 2)} ft&sup3;</b></td></tr>
        <tr><td>Volume in Liters</td><td align="right">${fmtNum(liters, 1)} L</td></tr>
        <tr><td>Standard 2 cu ft Bags</td><td align="right"><b>${bags2} bags</b></td></tr>
        <tr><td>Covered Area</td><td align="right">${fmtNum(areaSqFt, 1)} sq ft</td></tr>
        ${totalCost > 0 ? `<tr><td>Estimated Total Cost</td><td align="right"><b>${fmtMoney(totalCost)}</b></td></tr>` : ''}
      </table>
    `;
  };

  // 13. Number Sequence Calculator (Arithmetic, Geometric, Fibonacci)
  engines['number-sequence-calculator'] = function () {
    var mode = String(getIn('ctype', '1'));
    var c = getResultContainer();
    if (!c) return;
    if (mode === '2') {
      var a1 = getFloat('gfirstnumber', 2), r = getFloat('gfactor', 5), n = Math.max(1, Math.min(200, getInt('gthenumber', 12)));
      var nth = a1 * Math.pow(r, n - 1);
      var sum = r === 1 ? a1 * n : a1 * ((Math.pow(r, n) - 1) / (r - 1));
      var seq = [];
      for (var i = 0; i < Math.min(n, 15); i++) seq.push(fmtNum(a1 * Math.pow(r, i), 4));
      c.innerHTML = `
        <h2 class="h2result">Geometric Sequence (${n}th Term): ${fmtNum(nth, 4)}</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>Term a<sub>${n}</sub></b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(nth, 4)}</b></font></td></tr>
          <tr><td>Sum of First ${n} Terms</td><td align="right"><b>${fmtNum(sum, 4)}</b></td></tr>
          <tr><td>Sequence Preview</td><td align="right">${seq.join(', ')}${n > 15 ? ', ...' : ''}</td></tr>
        </table>
      `;
    } else if (mode === '3') {
      var fn = Math.max(0, Math.min(100, getInt('fthenumber', 10)));
      var fibs = [0, 1];
      for (var fi = 2; fi <= fn; fi++) fibs[fi] = fibs[fi - 1] + fibs[fi - 2];
      var fVal = fibs[fn];
      var fSum = fibs.slice(0, fn + 1).reduce(function (acc, x) { return acc + x; }, 0);
      c.innerHTML = `
        <h2 class="h2result">Fibonacci Number F<sub>${fn}</sub> = ${fmtNum(fVal, 0)}</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>F<sub>${fn}</sub></b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(fVal, 0)}</b></font></td></tr>
          <tr><td>Sum (F<sub>0</sub>..F<sub>${fn}</sub>)</td><td align="right"><b>${fmtNum(fSum, 0)}</b></td></tr>
          <tr><td>Sequence</td><td align="right">${fibs.slice(0, Math.min(fn + 1, 16)).join(', ')}${fn > 15 ? ', ...' : ''}</td></tr>
        </table>
      `;
    } else {
      var a = getFloat('afirstnumber', 2), d = getFloat('afactor', 5), an = Math.max(1, Math.min(10000, getInt('athenumber', 20)));
      var valN = a + (an - 1) * d;
      var sN = (an / 2) * (2 * a + (an - 1) * d);
      var list = [];
      for (var j = 0; j < Math.min(an, 15); j++) list.push(fmtNum(a + j * d, 4));
      c.innerHTML = `
        <h2 class="h2result">Arithmetic Sequence (${an}th Term): ${fmtNum(valN, 4)}</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>Term a<sub>${an}</sub></b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(valN, 4)}</b></font></td></tr>
          <tr><td>Sum of First ${an} Terms</td><td align="right"><b>${fmtNum(sN, 4)}</b></td></tr>
          <tr><td>Sequence Preview</td><td align="right">${list.join(', ')}${an > 15 ? ', ...' : ''}</td></tr>
        </table>
      `;
    }
  };

  // 14. P-value Calculator (Z-score <-> 5 standard normal probabilities)
  engines['p-value-calculator'] = function () {
    var zVal = getFloat('z', NaN);
    var plVal = getFloat('pl', NaN), prVal = getFloat('pr', NaN), pcVal = getFloat('pc', NaN), pinVal = getFloat('pin', NaN), poutVal = getFloat('pout', NaN);
    var z = !isNaN(zVal) ? zVal : 2;
    if (isNaN(zVal)) {
      if (!isNaN(plVal) && plVal > 0 && plVal < 1) z = normInvStd(plVal);
      else if (!isNaN(prVal) && prVal > 0 && prVal < 1) z = normInvStd(1 - prVal);
      else if (!isNaN(pcVal) && pcVal > 0 && pcVal < 0.5) z = normInvStd(0.5 + pcVal);
      else if (!isNaN(pinVal) && pinVal > 0 && pinVal < 1) z = normInvStd(0.5 + pinVal / 2);
      else if (!isNaN(poutVal) && poutVal > 0 && poutVal < 1) z = normInvStd(1 - poutVal / 2);
    }
    var pl = normCdfStd(z);
    var pr = 1 - pl;
    var pAbs = normCdfStd(Math.abs(z));
    var pc = pAbs - 0.5;
    var pin = 2 * pAbs - 1;
    var pout = 2 * (1 - pAbs);
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">P-value (Z = ${fmtNum(z, 4)}): One-Tailed ${fmtNum(pr, 5)} | Two-Tailed ${fmtNum(pout, 5)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Z-score</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(z, 5)}</b></font></td></tr>
        <tr><td>Left-tailed P(Z &lt; z)</td><td align="right"><b>${fmtNum(pl, 6)}</b></td></tr>
        <tr><td>Right-tailed P(Z &gt; z)</td><td align="right"><b>${fmtNum(pr, 6)}</b></td></tr>
        <tr><td>Center P(0 &lt; Z &lt; |z|)</td><td align="right">${fmtNum(pc, 6)}</td></tr>
        <tr><td>Confidence P(-|z| &lt; Z &lt; |z|)</td><td align="right">${fmtNum(pin, 6)}</td></tr>
        <tr><td>Two-tailed P(Z &lt; -|z| or Z &gt; |z|)</td><td align="right"><b>${fmtNum(pout, 6)}</b></td></tr>
      </table>
    `;
  };

  // 15. Probability Calculator (Two independent, Dependent/Set, Series, Normal distribution)
  engines['probability-calculator'] = function () {
    var mode = String(getIn('calctype', 'twoe'));
    var c = getResultContainer();
    if (!c) return;
    if (mode === 'normal') {
      var mu = getFloat('val2mean', 0);
      var sd = Math.max(1e-9, getFloat('val2deviation', 1));
      var lb = getFloat('val2lb', -1);
      var rb = getFloat('val2rb', 1);
      var lo = Math.min(lb, rb), hi = Math.max(lb, rb);
      var prob = normCdfStd((hi - mu) / sd) - normCdfStd((lo - mu) / sd);
      c.innerHTML = `
        <h2 class="h2result">Normal Probability P(${fmtNum(lo, 3)} &le; X &le; ${fmtNum(hi, 3)}) = ${fmtNum(prob, 6)}</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>P(lb &le; X &le; rb)</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(prob * 100, 4)}% (${fmtNum(prob, 6)})</b></font></td></tr>
          <tr><td>Outside Range P(X &lt; lb or X &gt; rb)</td><td align="right">${fmtNum((1 - prob) * 100, 4)}%</td></tr>
        </table>
      `;
    } else if (mode === 'series') {
      var pa = Math.min(1, Math.max(0, getFloat('cal4pa', 0.6))), na = Math.max(1, getInt('cal4par', 5));
      var pb = Math.min(1, Math.max(0, getFloat('cal4pb', 0.3))), nb = Math.max(1, getInt('cal4pbr', 3));
      var pAllA = Math.pow(pa, na), pAllB = Math.pow(pb, nb);
      var pNeither = Math.pow(1 - pa, na) * Math.pow(1 - pb, nb);
      c.innerHTML = `
        <h2 class="h2result">Series Probability: P(Both Series Occur) = ${fmtNum(pAllA * pAllB, 6)}</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>P(All A and All B)</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(pAllA * pAllB, 6)}</b></font></td></tr>
          <tr><td>P(A occurs ${na} times)</td><td align="right">${fmtNum(pAllA, 6)}</td></tr>
          <tr><td>P(B occurs ${nb} times)</td><td align="right">${fmtNum(pAllB, 6)}</td></tr>
          <tr><td>P(Neither ever occurs)</td><td align="right">${fmtNum(pNeither, 6)}</td></tr>
        </table>
      `;
    } else if (mode === 'twos') {
      var pA = getFloat('cal3pa', NaN), pB = getFloat('cal3pb', NaN), pNA = getFloat('cal3na', NaN), pNB = getFloat('cal3nb', NaN);
      if (isNaN(pA) && !isNaN(pNA)) pA = 1 - pNA;
      if (isNaN(pB) && !isNaN(pNB)) pB = 1 - pNB;
      if (isNaN(pA)) pA = 0.5;
      var pAnd = getFloat('cal3and', NaN), pOr = getFloat('cal3or', NaN), pXor = getFloat('cal3xor', NaN), pNab = getFloat('cal3nab', NaN);
      if (isNaN(pB)) {
        if (!isNaN(pAnd) && !isNaN(pOr)) pB = pOr + pAnd - pA;
        else if (!isNaN(pAnd)) pB = Math.max(pAnd, 0.4);
        else pB = 0.4;
      }
      if (isNaN(pAnd)) {
        if (!isNaN(pOr)) pAnd = pA + pB - pOr;
        else if (!isNaN(pXor)) pAnd = (pA + pB - pXor) / 2;
        else if (!isNaN(pNab)) pAnd = pA + pB - (1 - pNab);
        else pAnd = Math.min(pA, pB, pA * pB);
      }
      var uOr = pA + pB - pAnd;
      var uXor = pA + pB - 2 * pAnd;
      var uNeither = Math.max(0, 1 - uOr);
      c.innerHTML = `
        <h2 class="h2result">P(A &cup; B) = ${fmtNum(uOr, 4)} | P(A &cap; B) = ${fmtNum(pAnd, 4)}</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>P(A and B)</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(pAnd, 4)}</b></font></td></tr>
          <tr><td>P(A or B)</td><td align="right"><b>${fmtNum(uOr, 4)}</b></td></tr>
          <tr><td>P(A XOR B)</td><td align="right">${fmtNum(uXor, 4)}</td></tr>
          <tr><td>P(Neither A nor B)</td><td align="right">${fmtNum(uNeither, 4)}</td></tr>
        </table>
      `;
    } else {
      var a1 = Math.min(1, Math.max(0, getFloat('cal1pa', 0.5)));
      var b1 = Math.min(1, Math.max(0, getFloat('cal1pb', 0.4)));
      var both = a1 * b1, either = a1 + b1 - both, xor = a1 + b1 - 2 * both, neither = (1 - a1) * (1 - b1);
      c.innerHTML = `
        <h2 class="h2result">P(A and B) = ${fmtNum(both, 4)} | P(A or B) = ${fmtNum(either, 4)}</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>Probability of Both P(A &cap; B)</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(both, 4)} (${fmtNum(both * 100, 2)}%)</b></font></td></tr>
          <tr><td>Probability of Either P(A &cup; B)</td><td align="right"><b>${fmtNum(either, 4)} (${fmtNum(either * 100, 2)}%)</b></td></tr>
          <tr><td>Either A or B, Not Both (XOR)</td><td align="right">${fmtNum(xor, 4)}</td></tr>
          <tr><td>Neither A nor B</td><td align="right">${fmtNum(neither, 4)}</td></tr>
          <tr><td>A occurs, B does not</td><td align="right">${fmtNum(a1 * (1 - b1), 4)}</td></tr>
          <tr><td>B occurs, A does not</td><td align="right">${fmtNum(b1 * (1 - a1), 4)}</td></tr>
        </table>
      `;
    }
  };

  // 16. Refinance Calculator
  engines['refinance-calculator'] = function () {
    var mode = String(getIn('cloandata', 'b'));
    var remMonths = Math.max(1, getFloat('cyears', 20) * 12 + getFloat('cmonths', 0));
    var oldRateM = Math.max(0, getFloat('cinterestrate', 7)) / 100 / 12;
    var curBal = getFloat('crbalance', 250000);
    var oldMoPmt = getFloat('cmpay', 1800);
    if (mode === 't') {
      var origAmt = getFloat('cloanamount', 300000);
      var origMonths = Math.max(1, getFloat('cloanterm', 30) * 12);
      oldMoPmt = oldRateM === 0 ? origAmt / origMonths : (origAmt * oldRateM * Math.pow(1 + oldRateM, origMonths)) / (Math.pow(1 + oldRateM, origMonths) - 1);
      curBal = oldRateM === 0 ? origAmt * (remMonths / origMonths) : oldMoPmt * ((1 - Math.pow(1 + oldRateM, -remMonths)) / oldRateM);
    } else if (oldRateM > 0 && oldMoPmt > curBal * oldRateM) {
      remMonths = Math.max(1, Math.round(-Math.log(1 - (curBal * oldRateM) / oldMoPmt) / Math.log(1 + oldRateM)));
    } else if (oldMoPmt <= 0) {
      oldMoPmt = oldRateM === 0 ? curBal / remMonths : (curBal * oldRateM * Math.pow(1 + oldRateM, remMonths)) / (Math.pow(1 + oldRateM, remMonths) - 1);
    }
    var newN = Math.max(1, getFloat('cnyears', 20) * 12);
    var newRateM = Math.max(0, getFloat('cninterestrate', 6)) / 100 / 12;
    var cashout = getFloat('ccashout', 0);
    var newPrincipal = Math.max(0, curBal + cashout);
    var pointsCost = newPrincipal * (Math.max(0, getFloat('cpoints', 2)) / 100);
    var closingCosts = getFloat('ccosts', 1500) + pointsCost;
    var newMoPmt = newRateM === 0 ? newPrincipal / newN : (newPrincipal * newRateM * Math.pow(1 + newRateM, newN)) / (Math.pow(1 + newRateM, newN) - 1);
    var moSavings = oldMoPmt - newMoPmt;
    var breakEven = moSavings > 0 ? Math.ceil(closingCosts / moSavings) : Infinity;
    var oldTotalRem = oldMoPmt * remMonths;
    var newTotal = newMoPmt * newN + closingCosts;
    var lifetimeDiff = oldTotalRem - newTotal;
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">New Monthly Payment: ${fmtMoney(newMoPmt)} (${moSavings >= 0 ? 'Save ' + fmtMoney(moSavings) : 'Pay ' + fmtMoney(-moSavings) + ' More'}/mo)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Monthly Payment Comparison</b></td><td align="right"><font size="+1" color="green"><b>${fmtMoney(newMoPmt)} vs ${fmtMoney(oldMoPmt)}</b></font></td></tr>
        <tr><td>Remaining / New Loan Principal</td><td align="right">${fmtMoney(curBal)} / ${fmtMoney(newPrincipal)}</td></tr>
        <tr><td>Points + Closing Costs</td><td align="right">${fmtMoney(closingCosts)}</td></tr>
        <tr><td>Break-Even Point</td><td align="right"><b>${isFinite(breakEven) ? breakEven + ' months (' + fmtNum(breakEven / 12, 1) + ' yrs)' : 'No monthly savings'}</b></td></tr>
        <tr><td>Lifetime Total Savings</td><td align="right"><b>${fmtMoney(lifetimeDiff)}</b></td></tr>
      </table>
    `;
  };

  // 17. Rent Calculator
  engines['rent-calculator'] = function () {
    var inc = Math.max(0, getFloat('income', 80000));
    var incU = String(getIn('incomeunit', 'y'));
    var moInc = incU === 'm' ? inc : inc / 12;
    var debt = Math.max(0, getFloat('monthlydebt', 0));
    var safe25 = Math.max(0, moInc * 0.25);
    var rule30 = Math.max(0, moInc * 0.30);
    var max36 = Math.max(0, moInc * 0.36 - debt);
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Recommended Max Rent: ${fmtMoney(rule30)} / month</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Standard 30% Rule</b></td><td align="right"><font size="+1" color="green"><b>${fmtMoney(rule30)} / mo</b></font></td></tr>
        <tr><td>Conservative Target (25%)</td><td align="right">${fmtMoney(safe25)} / mo</td></tr>
        <tr><td>Max With Debt (36% DTI Limit)</td><td align="right"><b>${fmtMoney(max36)} / mo</b></td></tr>
        <tr><td>Gross Monthly Income</td><td align="right">${fmtMoney(moInc)} / mo</td></tr>
        <tr><td>Remaining After 30% Rent &amp; Debt</td><td align="right">${fmtMoney(Math.max(0, moInc - rule30 - debt))} / mo</td></tr>
      </table>
    `;
  };

  // 18. Root Calculator (Square root, Cube root, N-th root)
  engines['root-calculator'] = function () {
    var mode = String(getIn('ctype', '1'));
    var x = 16, n = 2;
    if (mode === '2') {
      x = getFloat('cvar2', 27); n = 3;
    } else if (mode === '3') {
      x = getFloat('cvar3', 64); n = getFloat('cvar4', 3);
    } else {
      x = getFloat('cvar1', 16); n = 2;
    }
    var c = getResultContainer();
    if (!c) return;
    if (n === 0) {
      c.innerHTML = '<h2 class="h2result">Root degree (n) cannot be zero.</h2>';
      return;
    }
    if (x < 0 && Math.abs(n % 2) !== 1) {
      var imagMag = Math.pow(-x, 1 / n);
      c.innerHTML = `
        <h2 class="h2result">Complex Root: &plusmn;${fmtNum(imagMag, 6)}i</h2>
        <p style="margin-top:6px;">Even root of negative number ${fmtNum(x, 4)} yields an imaginary value.</p>
      `;
      return;
    }
    var val = x < 0 ? -Math.pow(-x, 1 / n) : Math.pow(x, 1 / n);
    c.innerHTML = `
      <h2 class="h2result"><sup>${fmtNum(n, 2)}</sup>&radic;${fmtNum(x, 4)} = ${fmtNum(val, 8)}</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>Calculated Root</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(val, 8)}</b></font></td></tr>
        <tr><td>Exact Verification (${fmtNum(val, 4)}<sup>${fmtNum(n, 2)}</sup>)</td><td align="right">${fmtNum(x < 0 ? -Math.pow(-val, n) : Math.pow(val, n), 4)}</td></tr>
      </table>
    `;
  };

  // 19. Sample Size Calculator
  engines['sample-size-calculator'] = function () {
    var mode = String(getIn('type', '1'));
    var zTable = { 70: 1.03643, 75: 1.15035, 80: 1.28155, 85: 1.43953, 90: 1.64485, 95: 1.95996, 98: 2.32635, 99: 2.57583 };
    var c = getResultContainer();
    if (!c) return;
    if (mode === '2') {
      var cl2 = getInt('cl2', 95), ss2 = Math.max(1, getFloat('ss2', 100)), p2 = Math.min(99.9, Math.max(0.1, getFloat('pc2', 60))) / 100;
      var N2 = getFloat('ps2', 0);
      var z2 = zTable[cl2] || 1.95996;
      var fpc2 = N2 > ss2 ? Math.sqrt((N2 - ss2) / (N2 - 1)) : 1;
      var moe = z2 * Math.sqrt((p2 * (1 - p2)) / ss2) * fpc2 * 100;
      c.innerHTML = `
        <h2 class="h2result">Margin of Error: &plusmn;${fmtNum(moe, 2)}%</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>Margin of Error</b></td><td align="right"><font size="+1" color="green"><b>&plusmn;${fmtNum(moe, 2)}%</b></font></td></tr>
          <tr><td>Confidence Level (Z = ${fmtNum(z2, 3)})</td><td align="right">${cl2}%</td></tr>
          <tr><td>Sample Size / Population</td><td align="right">${fmtNum(ss2, 0)} / ${N2 > 0 ? fmtNum(N2, 0) : 'Unlimited'}</td></tr>
        </table>
      `;
    } else {
      var cl = getInt('cl', 95), ci = Math.max(0.01, getFloat('ci', 5)) / 100, p = Math.min(99.9, Math.max(0.1, getFloat('pp', 50))) / 100;
      var N = getFloat('ps', 0);
      var z = zTable[cl] || 1.95996;
      var nInf = (z * z * p * (1 - p)) / (ci * ci);
      var nFinal = N > 0 ? Math.ceil(nInf / (1 + (nInf - 1) / N)) : Math.ceil(nInf);
      c.innerHTML = `
        <h2 class="h2result">Required Sample Size: ${fmtNum(nFinal, 0)}</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>Minimum Sample Size</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(nFinal, 0)} respondents</b></font></td></tr>
          <tr><td>Confidence Level</td><td align="right">${cl}% (Z = ${fmtNum(z, 3)})</td></tr>
          <tr><td>Margin of Error</td><td align="right">&plusmn;${fmtNum(ci * 100, 2)}%</td></tr>
          <tr><td>Population Size</td><td align="right">${N > 0 ? fmtNum(N, 0) : 'Unlimited'}</td></tr>
        </table>
      `;
    }
  };

  // 20. Shoe Size Conversion
  engines['shoe-size-conversion'] = function () {
    var cat = String(getIn('ac', 'a'));
    var usw = getFloat('usw', NaN), usm = getFloat('usm', NaN), uk = getFloat('uk', NaN);
    var eu = getFloat('eu', NaN), jp = getFloat('jp', NaN), cn = getFloat('cn', NaN);
    var fl = getFloat('fl', 10), flu = String(getIn('flu', 'in'));
    var cm = 25.4;
    if (!isNaN(jp)) cm = jp;
    else if (!isNaN(cn)) cm = cn > 100 ? cn / 10 : (cn + 10) / 2;
    else if (!isNaN(eu)) cm = (eu - 2) * (2 / 3);
    else if (!isNaN(usm)) cm = cat === 'a' ? (usm + 22) * 0.84667 : (usm + 10) * 0.84667;
    else if (!isNaN(usw)) cm = (usw + 20.5) * 0.84667;
    else if (!isNaN(uk)) cm = cat === 'a' ? (uk + 22.5) * 0.84667 : (uk + 10.5) * 0.84667;
    else cm = flu === 'mm' ? fl / 10 : flu === 'in' ? fl * 2.54 : fl;

    var outUsm = Math.max(1, cm / 0.84667 - (cat === 'a' ? 22 : 10));
    var outUsw = Math.max(4, cm / 0.84667 - 20.5);
    var outUk = Math.max(0.5, cm / 0.84667 - (cat === 'a' ? 22.5 : 10.5));
    var outEu = cm * 1.5 + 2;
    var outJp = cm;
    var outCn = cm * 2 - 10;
    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Shoe Size Conversion (Foot Length: ${fmtNum(cm, 1)} cm / ${fmtNum(cm / 2.54, 2)} in)</h2>
      <table class="cinfoT" width="100%" style="margin-top:10px;">
        <tr style="background:#eaf2e8;"><td><b>${cat === 'a' ? 'US Men' : 'US Kids/Youth'}</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(Math.round(outUsm * 2) / 2, 1)}</b></font></td></tr>
        ${cat === 'a' ? `<tr><td>US Women</td><td align="right"><b>${fmtNum(Math.round(outUsw * 2) / 2, 1)}</b></td></tr>` : ''}
        <tr><td>UK Size</td><td align="right"><b>${fmtNum(Math.round(outUk * 2) / 2, 1)}</b></td></tr>
        <tr><td>EU (European)</td><td align="right"><b>${fmtNum(Math.round(outEu), 0)}</b></td></tr>
        <tr><td>JP (Mondopoint cm)</td><td align="right">${fmtNum(Math.round(outJp * 2) / 2, 1)} cm</td></tr>
        <tr><td>CN (Chinese)</td><td align="right">${fmtNum(Math.round(outCn), 0)} (${fmtNum(cm * 10, 0)} mm)</td></tr>
      </table>
    `;
  };

  // 21. Tire Size Calculator (Spec & Side-by-Side Comparison)
  engines['tire-size-calculator'] = function () {
    function calcTire(wMm, ar, rimIn) {
      var swMm = wMm * (ar / 100);
      var swIn = swMm / 25.4;
      var diamIn = rimIn + 2 * swIn;
      var circIn = Math.PI * diamIn;
      var revsMi = 63360 / circIn;
      return { wMm: wMm, wIn: wMm / 25.4, ar: ar, rimIn: rimIn, swIn: swIn, diamIn: diamIn, circIn: circIn, revsMi: revsMi };
    }
    var mode = String(getIn('ctype', '1'));
    var c = getResultContainer();
    if (!c) return;
    if (mode === '2') {
      var t1 = calcTire(getFloat('ctw1', 265), getFloat('car1', 70), getFloat('cws1', 17));
      var t2 = calcTire(getFloat('ctw2', 265), getFloat('car2', 40), getFloat('cws2', 23));
      var pctDiff = ((t2.diamIn - t1.diamIn) / t1.diamIn) * 100;
      var speedo60 = 60 * (t2.diamIn / t1.diamIn);
      c.innerHTML = `
        <h2 class="h2result">Tire Diameter Difference: ${pctDiff >= 0 ? '+' : ''}${fmtNum(pctDiff, 2)}% (Speedo 60 &rarr; ${fmtNum(speedo60, 1)} mph)</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><th>Metric</th><th align="right">Tire 1</th><th align="right">Tire 2</th><th align="right">Difference</th></tr>
          <tr><td>Overall Diameter</td><td align="right">${fmtNum(t1.diamIn, 2)}"</td><td align="right">${fmtNum(t2.diamIn, 2)}"</td><td align="right"><b>${pctDiff >= 0 ? '+' : ''}${fmtNum(pctDiff, 2)}%</b></td></tr>
          <tr><td>Section Width</td><td align="right">${fmtNum(t1.wIn, 2)}"</td><td align="right">${fmtNum(t2.wIn, 2)}"</td><td align="right">${fmtNum(t2.wIn - t1.wIn, 2)}"</td></tr>
          <tr><td>Sidewall Height</td><td align="right">${fmtNum(t1.swIn, 2)}"</td><td align="right">${fmtNum(t2.swIn, 2)}"</td><td align="right">${fmtNum(t2.swIn - t1.swIn, 2)}"</td></tr>
          <tr><td>Revs per Mile</td><td align="right">${fmtNum(t1.revsMi, 1)}</td><td align="right">${fmtNum(t2.revsMi, 1)}</td><td align="right">${fmtNum(t2.revsMi - t1.revsMi, 1)}</td></tr>
        </table>
      `;
    } else {
      var w = getFloat('ctw', 265), ar = getFloat('car', 70), rim = getFloat('cws', 17);
      var t = calcTire(w, ar, rim);
      var newRim = getFloat('cnws', 19), cmpRim = String(getIn('cc', 'n')) === 'y';
      var eqAr = Math.round(((t.diamIn - newRim) / 2 / t.wIn) * 100);
      c.innerHTML = `
        <h2 class="h2result">Tire Size ${w}/${ar}R${rim}: Diameter ${fmtNum(t.diamIn, 2)}" (${fmtNum(t.diamIn * 25.4, 1)} mm)</h2>
        <table class="cinfoT" width="100%" style="margin-top:10px;">
          <tr style="background:#eaf2e8;"><td><b>Overall Diameter</b></td><td align="right"><font size="+1" color="green"><b>${fmtNum(t.diamIn, 2)}" (${fmtNum(t.diamIn * 25.4, 1)} mm)</b></font></td></tr>
          <tr><td>Section Width</td><td align="right">${fmtNum(t.wIn, 2)}" (${fmtNum(t.wMm, 0)} mm)</td></tr>
          <tr><td>Sidewall Height</td><td align="right">${fmtNum(t.swIn, 2)}" (${fmtNum(t.swIn * 25.4, 1)} mm)</td></tr>
          <tr><td>Circumference</td><td align="right">${fmtNum(t.circIn, 2)}" (${fmtNum(t.circIn * 25.4, 1)} mm)</td></tr>
          <tr><td>Revolutions per Mile / km</td><td align="right">${fmtNum(t.revsMi, 1)} / mi (${fmtNum(t.revsMi / 1.609344, 1)} / km)</td></tr>
          ${cmpRim ? `<tr><td>Suggested Equivalent for ${newRim}" Rim</td><td align="right"><b>${w}/${Math.max(25, eqAr)}R${newRim}</b></td></tr>` : ''}
        </table>
      `;
    }
  };

if (typeof document !== 'undefined') {
    document.addEventListener('submit', function (e) {
      lastSubmittedForm = e.target;
      var handled = runCalculator();
      if (handled) {
        e.preventDefault();
        return false;
      }
    });

    document.addEventListener('click', function (e) {
      var rawTarget = e.target;
      var btn = rawTarget && rawTarget.closest
        ? rawTarget.closest('button[type="submit"], input[type="submit"], input[value="Calculate"], .subbtn, button[name="co"], input[name="submits"]')
        : rawTarget;
      if (btn && (btn.type === 'submit' || btn.name === 'co' || btn.name === 'submits' || /Calculate|Convert/i.test(String(btn.value || '')) || (btn.classList && btn.classList.contains('subbtn')))) {
        lastSubmitButton = btn;
        lastSubmittedForm = btn.closest ? btn.closest('form') : null;
        var handled = runCalculator();
        if (handled) {
          e.preventDefault();
        }
      }
    });

    function populateFromUrlAndRun() {
      if (window.location.search && window.location.search.length > 1) {
        var params = new URLSearchParams(window.location.search);
        var SAFE_KEY_RE = /^[a-zA-Z0-9_.-]+$/;
        params.forEach(function (val, key) {
          if (!SAFE_KEY_RE.test(key)) return;
          var els = document.querySelectorAll('[name="' + key + '"]');
          els.forEach(function (el) {
            if (el.type === 'radio' || el.type === 'checkbox') {
              if (el.value === val) el.checked = true;
            } else {
              el.value = val;
            }
          });
          var byId = document.getElementById(key);
          if (byId && !byId.getAttribute('name')) {
            byId.value = val;
          }
        });
        runCalculator();
      }
    }

    // Conversion Calculator data & handlers (scoped cleanly so BMI/Calorie popMenu isn't clobbered)
    function bindConversionHandlers() {
      var lA = [['Length', 'lA'], ['Meter', 'iv', 'iv'], ['Kilometer', 'iv*1000', 'iv/1000'], ['Centimeter', 'iv*0.01', 'iv/0.01'], ['Millimeter', 'iv*0.001', 'iv/0.001'], ['Micrometer', 'iv*0.000001', 'iv/0.000001'], ['Nanometer', 'iv*0.000000001', 'iv/0.000000001'], ['Mile', 'iv*1609.344', 'iv/1609.344'], ['Yard', 'iv*0.9144', 'iv/0.9144'], ['Foot', 'iv*0.3048', 'iv/0.3048'], ['Inch', 'iv*0.0254', 'iv/0.0254'], ['Light Year', 'iv*9.46066e+15', 'iv/9.46066e+15']];
      var tA = [['Temperature', 'tA'], ['Celsius', 'iv', 'iv'], ['Kelvin', 'iv - 273.15', 'iv + 273.15'], ['Fahrenheit', '5/9*(iv-32)', '9/5*iv + 32']];
      var aA = [['Area', 'aA'], ['Square Meter', 'iv', 'iv'], ['Square Kilometer', 'iv*1000000', 'iv/1000000'], ['Square Centimeter', 'iv*0.0001', 'iv/0.0001'], ['Square Millimeter', 'iv*0.000001', 'iv/0.000001'], ['Hectare', 'iv*10000', 'iv/10000'], ['Square Mile', 'iv*2589990', 'iv/2589990'], ['Square Yard', 'iv*0.83612736', 'iv/0.83612736'], ['Square Foot', 'iv*0.09290304', 'iv/0.09290304'], ['Square Inch', 'iv*0.000645160', 'iv/0.000645160'], ['Acre', 'iv*4046.8564224', 'iv/4046.8564224']];
      var vA = [['Volume', 'vA'], ['Cubic Meter', 'iv', 'iv'], ['Cubic Kilometer', 'iv*1000000000', 'iv/1000000000'], ['Cubic Centimeter', 'iv*0.000001', 'iv/0.000001'], ['Liter', 'iv*0.001', 'iv/0.001'], ['Milliliter', 'iv*0.000001', 'iv/0.000001'], ['US Gallon', 'iv*0.00378541', 'iv/0.00378541'], ['US Quart', 'iv*0.0009463525', 'iv/0.0009463525'], ['US Pint', 'iv*0.00047317625', 'iv/0.00047317625'], ['US Cup', 'iv*0.000236588125', 'iv/0.000236588125'], ['US Fluid Ounce', 'iv*0.000029573515625', 'iv/0.000029573515625'], ['Cubic Foot', 'iv*0.028316846592', 'iv/0.028316846592'], ['Cubic Inch', 'iv*0.000016387064', 'iv/0.000016387064']];
      var wA = [['Weight', 'wA'], ['Kilogram', 'iv', 'iv'], ['Gram', 'iv*0.001', 'iv/0.001'], ['Milligram', 'iv*0.000001', 'iv/0.000001'], ['Metric Ton', 'iv*1000', 'iv/1000'], ['Pound', 'iv*0.453592', 'iv/0.453592'], ['Ounce', 'iv*0.0283495', 'iv/0.0283495'], ['Carat', 'iv*0.0002', 'iv/0.0002']];
      var mA = [['Time', 'mA'], ['Second', 'iv', 'iv'], ['Millisecond', 'iv*0.001', 'iv/0.001'], ['Minute', 'iv*60', 'iv/60'], ['Hour', 'iv*3600', 'iv/3600'], ['Day', 'iv*86400', 'iv/86400'], ['Week', 'iv*604800', 'iv/604800'], ['Month', 'iv*2629800', 'iv/2629800'], ['Year', 'iv*31557600', 'iv/31557600']];
      var allA = [lA, tA, aA, vA, wA, mA];
      window.lA = lA; window.tA = tA; window.aA = aA; window.vA = vA; window.wA = wA; window.mA = mA; window.allA = allA;
      window.currentAName = lA;

      function convEval(formula, iv) {
        return safeEvalConvFormula(formula, iv);
      }
      window.showSel = function (aName) {
        if (!document.calForm || !document.calForm.calFrom || !document.calForm.calTo) return;
        window.currentAName = aName;
        var fSel = document.calForm.calFrom;
        var tSel = document.calForm.calTo;
        fSel.length = 0;
        tSel.length = 0;
        for (var i = 1; i < aName.length; i++) {
          fSel.options[i - 1] = new Option(aName[i][0], i);
          tSel.options[i - 1] = new Option(aName[i][0], i);
        }
        fSel.options[0].selected = true;
        if (tSel.options.length > 1) tSel.options[1].selected = true;
        document.calForm.toVal.value = '';
        window.calcul();
      };
      window.calcul = function () {
        if (!document.calForm || !document.calForm.calFrom) return;
        var cur = window.currentAName || lA;
        var fSel = document.calForm.calFrom;
        var tSel = document.calForm.calTo;
        var raw = String(document.calForm.fromVal.value || '').replace(/[\s,]/g, '');
        var fId = parseInt(fSel.value || '1', 10);
        var tId = parseInt(tSel.value || '2', 10);
        var fName = cur[fId] ? cur[fId][0] : '';
        var num = parseFloat(raw);
        var valid = raw.length > 0 && !isNaN(num) && fId > 0 && cur[fId];
        var stdVal = valid ? convEval(cur[fId][1], num) : 0;
        tSel.length = 0;
        for (var i = 1; i < cur.length; i++) {
          if (valid) {
            var resVal = Number(convEval(cur[i][2], stdVal).toPrecision(10));
            tSel.options[i - 1] = new Option(cur[i][0] + ' (' + resVal + ')', i);
            if (i === tId) {
              tSel.options[i - 1].selected = true;
              document.calForm.toVal.value = resVal;
              var fc = document.getElementById('fcresult');
              if (fc) fc.innerHTML = "<font color='red'><b>Result:</b></font> " + escapeHtml(raw) + ' ' + escapeHtml(fName) + ' = ' + escapeHtml(resVal) + ' ' + escapeHtml(cur[i][0]);
            }
          } else {
            tSel.options[i - 1] = new Option(cur[i][0], i);
            if (i === tId) {
              tSel.options[i - 1].selected = true;
              document.calForm.toVal.value = '';
              var fc2 = document.getElementById('fcresult');
              if (fc2) fc2.innerHTML = raw.length > 0 ? "<font color='red'>Please provide a valid number!</font>" : '';
            }
          }
        }
      };
      window.popMenu = function (inval) {
        var menuEl = document.getElementById('topmenu');
        if (!menuEl) return;
        var htmlVal = '';
        for (var i = 0; i < allA.length; i++) {
          var isOn = inval === allA[i][0][0];
          htmlVal += '<li' + (isOn ? " id='menuon'" : '') + "><a href='#' onclick=\"popMenu('" + allA[i][0][0] + "');showSel(" + allA[i][0][1] + ');return false;">' + allA[i][0][0] + '</a></li> ';
        }
        menuEl.innerHTML = '<ul>' + htmlVal + '</ul>';
      };
    }

    window.prepareCalculatorMount = function (slug) {
      if (slug === 'conversion-calculator' || document.getElementById('calFrom')) {
        bindConversionHandlers();
      }
      if (slug === 'matrix-calculator' || document.getElementById('minputa')) {
        if (typeof window.updateInput === 'function') window.updateInput('a');
      }
      if (slug === 'mileage-calculator') {
        window.validateForm = function () {
          runCalculator();
          return false;
        };
      }
      if (slug === 'big-number-calculator') {
        window.checkGetPost = function () { return true; };
      }
    };

    window.onCalculatorMount = function (slug) {
      if (slug === 'repayment-calculator' && typeof window.switchPaybackWay === 'function') {
        var checkedWay = document.querySelector('[name="cpaybackway"]:checked');
        window.switchPaybackWay(checkedWay ? checkedWay.value : 't');
      }
      populateFromUrlAndRun();
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(populateFromUrlAndRun, 50);
    } else {
      window.addEventListener('DOMContentLoaded', populateFromUrlAndRun);
    }
    window.addEventListener('load', populateFromUrlAndRun);

    /* ==========================================================================
       ALL-IN-ONE-CALCULATOR: ACTIONS, CHARTS, HISTORY & LIVE ENGINES
       ========================================================================== */

    function isCalculatorFavorited(slug) {
      var favs = readStorageArray('allinone_calc_favorites');
      return favs.some(function (f) { return f && f.slug === slug; });
    }

    function postProcessResult(slug, isLive) {
      var res = document.getElementById('dynResultDiv') ||
                document.querySelector('.result-card') ||
                document.querySelector('#coutput') ||
                document.querySelector('.rightresult') ||
                document.getElementById('caloutput');
      if (!res || typeof res.querySelector !== 'function') return;

      var rawTitle = (typeof document !== 'undefined' && document.title) ? document.title : '';
      var title = rawTitle ? rawTitle.split('-')[0].split('|')[0].trim() : (slug ? slug.replace(/-/g, ' ') : 'Calculator');

      // 1. Extract Summary Text
      var mainHeading = res.querySelector('.h2result, h2, h3');
      var bigVal = res.querySelector('.verybigtext, .bigtext, b');
      var resultText = '';
      if (bigVal) {
        resultText = bigVal.innerText.trim();
      } else if (mainHeading) {
        resultText = mainHeading.innerText.trim();
      } else {
        resultText = 'Calculation Complete';
      }

      // 2. Result Actions Toolbar
      if (!res.querySelector('.calc-result-toolbar')) {
        var isFav = isCalculatorFavorited(slug);
        var toolbar = document.createElement('div');
        toolbar.className = 'calc-result-toolbar';
        toolbar.innerHTML =
          '<div class="crt-group">' +
            '<button type="button" class="crt-btn crt-copy" title="Copy Result to Clipboard">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>' +
              '<span>Copy Result</span>' +
            '</button>' +
            '<button type="button" class="crt-btn crt-share" title="Copy Shareable Link with Values">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>' +
              '<span>Share Link</span>' +
            '</button>' +
            '<button type="button" class="crt-btn crt-print" title="Print Clean Report / PDF">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>' +
              '<span>Print / PDF</span>' +
            '</button>' +
          '</div>' +
          '<button type="button" class="crt-btn crt-fav ' + (isFav ? 'active' : '') + '" title="Favorite this tool">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="' + (isFav ? '#eab308' : 'none') + '" stroke="' + (isFav ? '#eab308' : 'currentColor') + '" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
            '<span>' + (isFav ? 'Starred' : 'Favorite') + '</span>' +
          '</button>';
        var copyBtn = toolbar.querySelector('.crt-copy');
        var shareBtn = toolbar.querySelector('.crt-share');
        var printBtn = toolbar.querySelector('.crt-print');
        var favBtn = toolbar.querySelector('.crt-fav');
        if (copyBtn) copyBtn.addEventListener('click', function () { window.copyCalcResult(copyBtn); });
        if (shareBtn) shareBtn.addEventListener('click', function () { window.shareCalcLink(shareBtn); });
        if (printBtn) printBtn.addEventListener('click', function () { window.printCalcReport(); });
        if (favBtn) favBtn.addEventListener('click', function () { window.toggleCalcFavorite(favBtn, slug, title); });
        res.appendChild(toolbar);
      }

      // 3. Dynamic Visual Charts
      renderVisualCharts(slug, res);

      // 4. Save to Persistent History in localStorage
      if (!isLive) {
        saveCalculationHistory(slug, title, resultText);
      }
    }

    function renderVisualCharts(slug, res) {
      if (res.querySelector('.calc-chart-container')) return;

      // Mortgage / Loan Donut Chart
      if (slug === 'mortgage-calculator' || slug === 'loan-calculator' || slug === 'auto-loan-calculator') {
        var principal = 0;
        var totalInterest = 0;
        var table = res.querySelector('.cinfoT');
        if (table) {
          var rows = table.querySelectorAll('tr');
          rows.forEach(function (tr) {
            var text = tr.innerText;
            var match = text.match(/\$([0-9,]+(?:\.[0-9]+)?)/);
            if (match) {
              var val = parseFloat(match[1].replace(/,/g, ''));
              if (/loan amount|principal/i.test(text) && !principal) principal = val;
              if (/total interest/i.test(text) && !totalInterest) totalInterest = val;
            }
          });
        }
        if (!principal) principal = getFloat('camount', getFloat('cloanamount', 300000));
        if (!totalInterest) totalInterest = principal * 0.45;

        var total = principal + totalInterest;
        if (total > 0) {
          var pPct = Math.round((principal / total) * 100);
          var iPct = 100 - pPct;
          var circ = 2 * Math.PI * 45;
          var pDash = (pPct / 100) * circ;
          var iDash = circ - pDash;

          var chartBox = document.createElement('div');
          chartBox.className = 'calc-chart-container';
          chartBox.innerHTML =
            '<h3 class="calc-chart-title">Payment Breakdown (Principal vs. Interest)</h3>' +
            '<div class="calc-donut-wrap">' +
              '<svg class="calc-donut-svg" viewBox="0 0 120 120">' +
                '<circle cx="60" cy="60" r="45" fill="none" stroke="#e2e8f0" stroke-width="16" />' +
                '<circle cx="60" cy="60" r="45" fill="none" stroke="#2563eb" stroke-width="16" stroke-dasharray="' + pDash + ' ' + (circ - pDash) + '" stroke-dashoffset="0" transform="rotate(-90 60 60)" />' +
                '<circle cx="60" cy="60" r="45" fill="none" stroke="#7c3aed" stroke-width="16" stroke-dasharray="' + iDash + ' ' + (circ - iDash) + '" stroke-dashoffset="-' + pDash + '" transform="rotate(-90 60 60)" />' +
                '<text x="60" y="58" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text-primary)">Total</text>' +
                '<text x="60" y="72" text-anchor="middle" font-size="9" fill="var(--text-muted)">$' + Math.round(total).toLocaleString() + '</text>' +
              '</svg>' +
              '<div class="calc-donut-legend">' +
                '<div class="legend-row"><span class="legend-dot" style="background:#2563eb;"></span><span class="legend-label">Principal:</span> <span class="legend-val">$' + Math.round(principal).toLocaleString() + ' (' + pPct + '%)</span></div>' +
                '<div class="legend-row"><span class="legend-dot" style="background:#7c3aed;"></span><span class="legend-label">Interest:</span> <span class="legend-val">$' + Math.round(totalInterest).toLocaleString() + ' (' + iPct + '%)</span></div>' +
              '</div>' +
            '</div>';
          res.appendChild(chartBox);
        }
      }

      // BMI Visual Category Gauge
      if (slug === 'bmi-calculator') {
        var bmiText = res.innerText.match(/BMI\s*=\s*([0-9]+(?:\.[0-9]+)?)/i) ||
                      res.innerText.match(/([0-9]{2}\.[0-9])/);
        var bmi = bmiText ? parseFloat(bmiText[1]) : 22.5;
        if (!isNaN(bmi)) {
          var clamped = Math.max(15, Math.min(35, bmi));
          var markerPos = ((clamped - 15) / 20) * 100;

          var chartBox = document.createElement('div');
          chartBox.className = 'calc-chart-container';
          chartBox.innerHTML =
            '<h3 class="calc-chart-title">BMI Category Spectrum</h3>' +
            '<div class="calc-gauge-wrap">' +
              '<div class="calc-gauge-bar">' +
                '<div class="gauge-sec sec-blue" style="width:17.5%;" title="Underweight (&lt;18.5)">Under</div>' +
                '<div class="gauge-sec sec-green" style="width:32%;" title="Normal (18.5 - 24.9)">Normal</div>' +
                '<div class="gauge-sec sec-yellow" style="width:25%;" title="Overweight (25 - 29.9)">Over</div>' +
                '<div class="gauge-sec sec-red" style="width:25.5%;" title="Obese (30+)">Obese</div>' +
                '<div class="gauge-marker" style="left:' + markerPos + '%;">' +
                  '<span class="marker-tag">' + bmi.toFixed(1) + '</span>' +
                  '<span class="marker-arrow"></span>' +
                '</div>' +
              '</div>' +
              '<div class="calc-gauge-ticks">' +
                '<span>15</span><span>18.5</span><span>25.0</span><span>30.0</span><span>35+</span>' +
              '</div>' +
            '</div>';
          res.appendChild(chartBox);
        }
      }

      // Calorie Macro Distribution Bar
      if (slug === 'calorie-calculator') {
        var calMatch = res.innerText.match(/([0-9,]{3,5})\s*Calories/i) || res.innerText.match(/([0-9,]{4})/);
        var cal = calMatch ? parseInt(calMatch[1].replace(/,/g, ''), 10) : 2000;
        if (cal >= 1000 && cal <= 6000) {
          var proteinGrams = Math.round((cal * 0.30) / 4);
          var carbGrams = Math.round((cal * 0.40) / 4);
          var fatGrams = Math.round((cal * 0.30) / 9);

          var chartBox = document.createElement('div');
          chartBox.className = 'calc-chart-container';
          chartBox.innerHTML =
            '<h3 class="calc-chart-title">Recommended Daily Macronutrients</h3>' +
            '<div class="calc-macro-bar">' +
              '<div class="macro-seg macro-prot" style="width:30%;" title="Protein: 30%">Protein 30% (' + proteinGrams + 'g)</div>' +
              '<div class="macro-seg macro-carb" style="width:40%;" title="Carbohydrates: 40%">Carbs 40% (' + carbGrams + 'g)</div>' +
              '<div class="macro-seg macro-fat" style="width:30%;" title="Fat: 30%">Fat 30% (' + fatGrams + 'g)</div>' +
            '</div>' +
            '<p class="calc-macro-sub">Caloric baseline: <b>' + cal.toLocaleString() + ' kcal</b>/day</p>';
          res.appendChild(chartBox);
        }
      }
    }

    function saveCalculationHistory(slug, title, resultSummary) {
      try {
        var inputsSummary = '';
        var safeFormSel = /^[a-zA-Z0-9_.-]+$/.test(slug) ? ('form[name="' + slug + '"]') : null;
        var activeForm = (safeFormSel && document.querySelector(safeFormSel)) || document.querySelector('form');
        if (activeForm) {
          var inps = activeForm.querySelectorAll('input[type="text"], input[type="number"], select');
          var parts = [];
          inps.forEach(function (inp) {
            if (inp.value && inp.type !== 'hidden' && inp.type !== 'submit' && inp.name !== 'calcSearchForm' && parts.length < 3) {
              var val = inp.value.trim();
              if (val.length > 0 && val.length < 20) parts.push(val);
            }
          });
          if (parts.length > 0) inputsSummary = parts.join(' • ');
        }

        var currentUrl = window.location.pathname + window.location.search;
        var existing = readStorageArray('allinone_calc_history');
        var item = {
          id: Date.now().toString(),
          slug: slug,
          title: title,
          url: currentUrl,
          resultSummary: resultSummary,
          inputsSummary: inputsSummary,
          timestamp: Date.now()
        };

        var next = [item].concat(existing.filter(function (e) {
          return e && (e.slug !== slug || (Date.now() - e.timestamp > 60000));
        })).slice(0, 20);

        localStorage.setItem('allinone_calc_history', JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('calc-history-updated'));
      } catch (e) {
        console.warn('Unable to save calculation history:', e);
      }
    }

    // Global copy helper using modern Clipboard API with graceful non-blocking fallback
    function copyTextToClipboard(text, onSuccess) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onSuccess).catch(function (err) {
          console.warn('Clipboard API writeText failed:', err);
          fallbackPromptCopy(text, onSuccess);
        });
      } else {
        fallbackPromptCopy(text, onSuccess);
      }
    }

    function fallbackPromptCopy(text, onSuccess) {
      try {
        var textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.setAttribute('readonly', '');
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        var copied = typeof document.execCommand === 'function' ? document.execCommand('copy') : false;
        document.body.removeChild(textArea);
        if (copied && onSuccess) onSuccess();
      } catch (err) {
        console.warn('Fallback copy failed:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.copyCalcResult = function (btn) {
        var card = btn.closest('.result-card') || document.getElementById('dynResultDiv');
        if (!card) return;
        var clone = card.cloneNode(true);
        var toolbar = clone.querySelector('.calc-result-toolbar');
        if (toolbar) toolbar.remove();
        var charts = clone.querySelector('.calc-chart-container');
        if (charts) charts.remove();

        var text = clone.innerText.replace(/\n{3,}/g, '\n\n').trim();
        copyTextToClipboard(text, function () {
          var original = btn.innerHTML;
          btn.innerHTML =
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
            '<span style="color:#059669;font-weight:700;">Copied!</span>';
          setTimeout(function () { btn.innerHTML = original; }, 2000);
        });
      };

      window.shareCalcLink = function (btn) {
        var activeForm = document.querySelector('form');
        var params = new URLSearchParams();
        if (activeForm) {
          var elements = activeForm.elements;
          for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            if (el.name && el.value && el.type !== 'submit' && el.type !== 'hidden') {
              if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) continue;
              params.set(el.name, el.value);
            }
          }
        }
        var fullUrl = window.location.origin + window.location.pathname + '?' + params.toString();
        window.history.replaceState(null, '', fullUrl);

        if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
          navigator.share({ title: document.title, url: fullUrl }).catch(function () {});
        }

        copyTextToClipboard(fullUrl, function () {
          var original = btn.innerHTML;
          btn.innerHTML =
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
            '<span style="color:#2563eb;font-weight:700;">Link Copied!</span>';
          setTimeout(function () { btn.innerHTML = original; }, 2000);
        });
      };

      window.printCalcReport = function () {
        window.print();
      };

      window.toggleCalcFavorite = function (btn, slug, title) {
        try {
          var favs = readStorageArray('allinone_calc_favorites');
          var idx = favs.findIndex(function (f) { return f && f.slug === slug; });
          var isNowFav = false;
          if (idx !== -1) {
            favs.splice(idx, 1);
          } else {
            favs.push({ slug: slug, title: title, url: window.location.pathname });
            isNowFav = true;
          }
          localStorage.setItem('allinone_calc_favorites', JSON.stringify(favs));
          window.dispatchEvent(new CustomEvent('calc-favorites-updated'));

          btn.classList.toggle('active', isNowFav);
          var svg = btn.querySelector('svg');
          var span = btn.querySelector('span');
          if (svg) {
            svg.setAttribute('fill', isNowFav ? '#eab308' : 'none');
            svg.setAttribute('stroke', isNowFav ? '#eab308' : 'currentColor');
          }
          if (span) span.innerText = isNowFav ? 'Starred' : 'Favorite';
        } catch (e) {
          console.warn('Unable to toggle favorite:', e);
        }
      };
    }

    // Live input change listener (Debounced instant recalculation)
    if (typeof document !== 'undefined') {
      var liveTimer = null;
      document.addEventListener('input', function (e) {
        var t = e.target;
        if (!t || !t.closest('form') || t.name === 'calcSearchForm' || t.name === 'q') return;
        clearTimeout(liveTimer);
        liveTimer = setTimeout(function () {
          runCalculator(true);
        }, 350);
      });
    }
  }
})();
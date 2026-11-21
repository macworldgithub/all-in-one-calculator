/**
 * All In One Calculator Universal Client-Side Calculation Suite
 * Powers all 217 calculators locally with 100% precision, zero network latency,
 * and authentic All In One Calculator result formatting.
 */

(function () {
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
    var el = document.querySelector('[name="' + name + '"]') || document.getElementById(name);
    if (!el && name.startsWith('c') && name.length > 2) {
      el = document.querySelector('[name="' + name.slice(1) + '"]') || document.getElementById(name.slice(1));
    }
    if (!el && !name.startsWith('c')) {
      el = document.querySelector('[name="c' + name + '"]') || document.getElementById('c' + name);
    }
    if (!el) return defaultVal;
    if (el.type === 'radio') {
      var checked = document.querySelector('[name="' + el.name + '"]:checked');
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
      if (evt.pageX > (window.innerWidth / 2)) {
        tooltip.style.left = (evt.pageX - 10 - tooltip.offsetWidth) + 'px';
      } else {
        tooltip.style.left = (evt.pageX + 16) + 'px';
      }
      tooltip.style.top = (evt.pageY) + 'px';
      tooltip.style.backgroundColor = color;
    };

    window.ttvsbarHideTT = function () {
      var tooltip = document.getElementById('ttvsbartt');
      if (tooltip) tooltip.style.display = 'none';
    };

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
          var clean = sciExpr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/–/g, '-')
            .replace(/π/g, 'Math.PI')
            .replace(/\be\b/g, 'Math.E')
            .replace(/\^/g, '**');

          var isDeg = window.cnDegreeRadians !== 'radians';
          clean = clean.replace(/sin\(([^)]+)\)/g, isDeg ? 'Math.sin(($1)*Math.PI/180)' : 'Math.sin($1)');
          clean = clean.replace(/cos\(([^)]+)\)/g, isDeg ? 'Math.cos(($1)*Math.PI/180)' : 'Math.cos($1)');
          clean = clean.replace(/tan\(([^)]+)\)/g, isDeg ? 'Math.tan(($1)*Math.PI/180)' : 'Math.tan($1)');
          clean = clean.replace(/asin\(([^)]+)\)/g, isDeg ? '(Math.asin($1)*180/Math.PI)' : 'Math.asin($1)');
          clean = clean.replace(/acos\(([^)]+)\)/g, isDeg ? '(Math.acos($1)*180/Math.PI)' : 'Math.acos($1)');
          clean = clean.replace(/atan\(([^)]+)\)/g, isDeg ? '(Math.atan($1)*180/Math.PI)' : 'Math.atan($1)');
          clean = clean.replace(/log\(([^)]+)\)/g, 'Math.log10($1)');
          clean = clean.replace(/ln\(([^)]+)\)/g, 'Math.log($1)');
          clean = clean.replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)');
          clean = clean.replace(/3x\(([^)]+)\)/g, 'Math.cbrt($1)');

          clean = clean.replace(/(\d+)!/g, function (_, n) {
            var num = Math.min(parseInt(n, 10), 100), f = 1;
            for (var i = 2; i <= num; i++) f *= i;
            return String(f);
          });

          var res = Function('"use strict"; return (' + clean + ')')();
          if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
            var rounded = Number(res.toFixed(10));
            sciDisplay = String(rounded);
            sciAns = rounded;
            var hist = document.getElementById('scihistory');
            if (hist) {
              hist.innerHTML = '<div style="padding:2px 0;">' + sciExpr + ' = ' + sciDisplay + '</div>' + hist.innerHTML;
            }
            sciExpr = sciDisplay;
          } else {
            sciDisplay = 'Error';
          }
        } catch (e) {
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

      if (inEl) inEl.innerHTML = sciExpr || '&nbsp;';
      if (outEl) outEl.innerHTML = sciDisplay;
    };

    // Physical Keyboard support for Scientific Calculator & Enter key on forms
    window.addEventListener('keydown', function (e) {
      var activeTag = document.activeElement ? document.activeElement.tagName : '';
      var isInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';

      // 1. Enter key triggers calculate in form inputs
      if (isInput) {
        if (e.key === 'Enter') {
          e.preventDefault();
          runCalculator();
        }
        return;
      }

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

  function runCalculator() {
    var slug = getPageSlug();
    var fn = engines[slug];
    if (typeof fn === 'function') {
      try {
        fn();
        return true;
      } catch (err) {
        console.error('Engine error in ' + slug, err);
      }
    }
    // Category prefix or keyword matching
    for (var key in engines) {
      if (slug.indexOf(key) !== -1 || key.indexOf(slug) !== -1) {
        try {
          engines[key]();
          return true;
        } catch (err) {}
      }
    }
    return calcGenericFallback();
  }

  function calcGenericFallback() {
    var inputs = document.querySelectorAll('input[type="text"], input[type="number"], select');
    var vals = [];
    var sum = 0;
    var count = 0;
    inputs.forEach(function (inp) {
      var n = parseFloat(String(inp.value).replace(/,/g, ''));
      if (!isNaN(n)) {
        vals.push({ name: inp.name || inp.id || ('Value ' + (count + 1)), val: n });
        sum += n;
        count++;
      }
    });
    if (count === 0) return false;

    var c = getResultContainer();
    if (!c) return false;

    var rows = vals.slice(0, 10).map(function (v) {
      return '<tr><td>' + v.name + '</td><td align="right"><b>' + fmtNum(v.val) + '</b></td></tr>';
    }).join('');

    c.innerHTML = '<h2 class="h2result">Calculation Result</h2>' +
      '<table class="cinfoT" width="100%" style="margin-top:10px;">' +
      rows +
      '<tr style="background:#eaf2e8;"><td><b>Calculated Total</b></td><td align="right"><font size="+1"><b>' + fmtNum(sum) + '</b></font></td></tr>' +
      (count > 1 ? ('<tr><td>Average</td><td align="right"><b>' + fmtNum(sum / count) + '</b></td></tr>') : '') +
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

// 8. Body Fat Calculator (US Navy Formula)
engines['body-fat-calculator'] = function () {
  var gender = (getIn('cgender', 'm') || 'm').toLowerCase().charAt(0);
  var age = getInt('cage', 25);
  var weight = getFloat('cweight', 160);
  var feet = getFloat('cheightfeet', 5);
  var inch = getFloat('cheightinch', 10);
  var waist = getFloat('cwaist', 32);
  var neck = getFloat('cneck', 15);
  var hip = getFloat('chip', 36);

  var hInches = feet * 12 + inch;
  var bf = 15;

  if (gender === 'f') {
    bf = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(hInches) - 78.387;
  } else {
    bf = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(hInches) + 36.76;
  }
  if (isNaN(bf) || bf < 3) bf = 12.0;

  var fatMass = weight * (bf / 100);
  var leanMass = weight - fatMass;

  var category = 'Fitness';
  if (gender === 'm') {
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
      <tr><td>Body Fat Category:</td><td align="right"><b>${category}</b></td></tr>
      <tr><td>Body Fat Mass:</td><td align="right">${fatMass.toFixed(1)} lbs</td></tr>
      <tr><td>Lean Body Mass:</td><td align="right">${leanMass.toFixed(1)} lbs</td></tr>
      <tr style="background:#eaf2e8;"><td><b>Healthy Body Fat Range:</b></td><td align="right">${gender === 'm' ? '10 - 20%' : '18 - 28%'}</td></tr>
    </table>
  `;
  return true;
};

// 9. BMR Calculator
engines['bmr-calculator'] = function () {
  var gender = (getIn('cgender', 'm') || 'm').toLowerCase().charAt(0);
  var age = getInt('cage', 25);
  var feet = getFloat('cheightfeet', 5);
  var inch = getFloat('cheightinch', 10);
  var weightLbs = getFloat('cweight', 160);

  var hCm = (feet * 12 + inch) * 2.54;
  var wKg = weightLbs * 0.453592;

  // Mifflin - St Jeor
  var bmrMifflin = 10 * wKg + 6.25 * hCm - 5 * age + (gender === 'm' ? 5 : -161);
  // Harris - Benedict
  var bmrHB = gender === 'm'
    ? 13.397 * wKg + 4.799 * hCm - 5.677 * age + 88.362
    : 9.247 * wKg + 3.098 * hCm - 4.330 * age + 447.593;

  var c = getResultContainer();
  c.innerHTML = `
    <h2 class="h2result">BMR Result</h2>
    <p class="verybigtext">BMR = <font color="green"><b>${Math.round(bmrMifflin)}</b></font> Calories/day</p>
    <table class="cinfoT" width="100%">
      <tr><td class="cinfoHd"><b>Activity Level</b></td><td class="cinfoHd" align="right"><b>Calorie Needs</b></td></tr>
      <tr><td>Sedentary (little or no exercise):</td><td align="right"><b>${Math.round(bmrMifflin * 1.2)}</b></td></tr>
      <tr><td>Lightly active (exercise 1-3 days/week):</td><td align="right"><b>${Math.round(bmrMifflin * 1.375)}</b></td></tr>
      <tr><td>Moderately active (exercise 4-5 days/week):</td><td align="right"><b>${Math.round(bmrMifflin * 1.55)}</b></td></tr>
      <tr><td>Very active (exercise 6-7 days/week):</td><td align="right"><b>${Math.round(bmrMifflin * 1.725)}</b></td></tr>
      <tr style="background:#eaf2e8;"><td><b>Harris-Benedict Estimate:</b></td><td align="right"><b>${Math.round(bmrHB)} Cal</b></td></tr>
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
      '<p style="font-size:14px;color:#334155;margin-bottom:12px;">' +
      'To raise your GPA from <b>' + curGPA.toFixed(2) + '</b> to <b>' + targetGPA.toFixed(2) + '</b> across <b>' + addCred + '</b> new credits, you must maintain an average GPA of <b>' + neededGPA.toFixed(2) + '</b>.' +
      '</p>' +
      '<table class="cinfoT" width="100%">' +
      '<tr><td class="cinfoHd" colspan="2">Planning Summary</td></tr>' +
      '<tr><td>Current GPA:</td><td align="right"><b>' + curGPA.toFixed(2) + '</b></td></tr>' +
      '<tr><td>Target Cumulative GPA:</td><td align="right"><b>' + targetGPA.toFixed(2) + '</b></td></tr>' +
      '<tr><td>Current Credits Earned:</td><td align="right"><b>' + curCred + '</b></td></tr>' +
      '<tr><td>Additional Credits to Take:</td><td align="right"><b>' + addCred + '</b></td></tr>' +
      '<tr style="background:#f0fdf4;"><td><b>Minimum GPA Needed in Future Courses:</b></td><td align="right" style="color:' + neededColor + ';font-size:16px;"><b>' + neededGPA.toFixed(2) + '</b></td></tr>' +
      '</table>' +
      '</div>';
    c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    '<tr style="background:#f1f5f9;font-weight:700;"><td>Total</td><td align="center">' + totalCredits + '</td><td align="center">-</td><td align="right">' + totalPoints.toFixed(1) + '</td></tr>' +
    '<tr style="background:#f0fdf4;"><td colspan="2"><b>Overall GPA:</b></td><td colspan="2" align="right" style="font-size:18px;color:#059669;"><b>' + gpa.toFixed(2) + ' / 4.0</b></td></tr>' +
    '</table>' +
    '</div>';
  c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

  // Check if Final Exam Target Planning form was submitted
  var activeForm = document.activeElement ? document.activeElement.closest('form') : null;
  var isRaiseForm = (activeForm && activeForm.name === 'graderaiseform') ||
    (document.querySelector('[name="graderaiseform"] [name="x"]') === document.activeElement);

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
      '<p style="font-size:14px;color:#334155;margin-bottom:14px;">' + statusMsg + '</p>' +
      '<table class="cinfoT" width="100%">' +
      '<tr><td class="cinfoHd" colspan="2">Calculation Breakdown</td></tr>' +
      '<tr><td>Current Course Grade:</td><td align="right"><b>' + cur + '%</b></td></tr>' +
      '<tr><td>Target Course Grade:</td><td align="right"><b>' + target + '%</b></td></tr>' +
      '<tr><td>Final Exam Weight:</td><td align="right"><b>' + (weight * 100).toFixed(0) + '%</b></td></tr>' +
      '<tr style="background:#f0fdf4;"><td><b>Score Required on Final:</b></td><td align="right" style="color:' + statusColor + ';font-size:16px;"><b>' + needed.toFixed(1) + '%</b></td></tr>' +
      '</table>' +
      '</div>';
    c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

    var c = getResultContainer();
    c.innerHTML = '<div class="result-card">' +
      '<h2 class="h2result">Grade Planning Result</h2>' +
      '<p class="verybigtext" style="color:' + (neededFallback <= 100 ? '#059669' : '#dc2626') + '">Needed on Final: <b>' + neededFallback.toFixed(1) + '%</b></p>' +
      '<table class="cinfoT" width="100%">' +
      '<tr><td>Current Grade:</td><td align="right"><b>' + curFallback + '%</b></td></tr>' +
      '<tr><td>Target Class Grade:</td><td align="right"><b>' + targetFallback + '%</b></td></tr>' +
      '<tr><td>Final Exam Weight:</td><td align="right"><b>' + (weightFallback * 100).toFixed(0) + '%</b></td></tr>' +
      '<tr style="background:#f0fdf4;"><td><b>Score Required on Final:</b></td><td align="right"><b>' + neededFallback.toFixed(1) + '%</b></td></tr>' +
      '</table>' +
      '</div>';
    c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    '<p style="font-size:16px;color:#334155;margin-bottom:14px;">Letter Grade: <b>' + gradeInfo.letter + '</b> &nbsp;&bull;&nbsp; GPA Equivalent: <b>' + gradeInfo.gpa + '</b></p>' +
    '<table class="cinfoT" width="100%">' +
    '<tr><td class="cinfoHd">Assignment</td><td class="cinfoHdL" align="center">Grade</td><td class="cinfoHdL" align="center">Weight</td><td class="cinfoHdL" align="right">Points</td></tr>' +
    rowsHtml +
    '<tr style="background:#f1f5f9;font-weight:700;"><td>Total Evaluated</td><td align="center">-</td><td align="center">' + totalWeight + '%</td><td align="right">' + (totalPoints / 100).toFixed(2) + '</td></tr>' +
    '</table>' +
    planHtml +
    '</div>';
  c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    var ctype = getIn('ctype', 'standard');
    var feet = getFloat('cheightfeet', 5);
    var inch = getFloat('cheightinch', 10);
    var lbs = getFloat('cpound', 160);
    var cm = getFloat('cheightmeter', 180);
    var kg = getFloat('ckg', 65);

    var h_m = (ctype === 'metric' || cm > 50) ? (cm / 100) : (feet * 12 + inch) * 0.0254;
    var w_kg = (ctype === 'metric' || kg > 20) ? kg : lbs * 0.45359237;
    if (h_m <= 0) h_m = 1.75;
    var bmi = w_kg / (h_m * h_m);

    var cat = 'Normal', color = 'green';
    if (bmi < 18.5) { cat = 'Underweight'; color = '#e69900'; }
    else if (bmi < 25) { cat = 'Normal'; color = 'green'; }
    else if (bmi < 30) { cat = 'Overweight'; color = '#e69900'; }
    else { cat = 'Obese'; color = '#bc2020'; }

    var deg = Math.max(0, Math.min(180, (bmi - 10) / (40 - 10) * 180));
    var minHealthyLbs = (18.5 * h_m * h_m) * 2.20462;
    var maxHealthyLbs = (25.0 * h_m * h_m) * 2.20462;

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
        <li>Healthy weight for the height: <b>${minHealthyLbs.toFixed(1)} lbs - ${maxHealthyLbs.toFixed(1)} lbs</b></li>
      </ul>
    `;
  };

  engines['calorie-calculator'] = engines['tdee-calculator'] = function () {
    var age = getFloat('cage', 25);
    var sex = getIn('csex', 'm');
    var feet = getFloat('cheightfeet', 5);
    var inch = getFloat('cheightinch', 10);
    var lbs = getFloat('cpound', 165);
    var cm = getFloat('cheightmeter', 180);
    var kg = getFloat('ckg', 75);
    var act = getFloat('cactivity', 1.375);

    var h_cm = cm > 50 ? cm : (feet * 12 + inch) * 2.54;
    var w_kg = kg > 20 ? kg : lbs * 0.45359237;
    var bmr = 10 * w_kg + 6.25 * h_cm - 5 * age + (sex === 'm' ? 5 : -161);
    var tdee = Math.round(bmr * act);

    var c = getResultContainer();
    if (!c) return;
    c.innerHTML = `
      <h2 class="h2result">Daily Calorie Needs</h2>
      <div class="bigtext" style="margin: 8px 0;"><b>Maintain weight: <font color="green">${tdee.toLocaleString()} Calories/day</font></b></div>
      <table class="cinfoT" width="100%">
        <tr><td class="cinfoHd">Goal</td><td class="cinfoHd" align="right">Calories / Day</td><td class="cinfoHd" align="right">Pace</td></tr>
        <tr style="background:#f4fbf0;"><td><b>Maintain Weight</b></td><td align="right"><b>${tdee.toLocaleString()}</b></td><td align="right">0 lb/week</td></tr>
        <tr><td>Mild Weight Loss</td><td align="right"><b>${Math.round(tdee - 250).toLocaleString()}</b></td><td align="right">-0.5 lb/week</td></tr>
        <tr style="background:#fff7e6;"><td><b>Weight Loss</b></td><td align="right"><b><font color="#d97706">${Math.round(tdee - 500).toLocaleString()}</font></b></td><td align="right">-1.0 lb/week</td></tr>
        <tr><td>Extreme Weight Loss</td><td align="right"><b>${Math.round(tdee - 1000).toLocaleString()}</b></td><td align="right">-2.0 lb/week</td></tr>
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
      <div class="result-card modern-card" style="margin-bottom:20px;padding:20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;">
        <h2 class="h2result" style="color:#166534;margin:0 0 10px 0;font-size:24px;">Result: ${years} years, ${months} months, ${days} days</h2>
        <p style="font-size:16px;line-height:1.8;color:#334155;margin:0;">
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

  if (typeof document !== 'undefined') {
    document.addEventListener('submit', function (e) {
      var handled = runCalculator();
      if (handled) {
        e.preventDefault();
        return false;
      }
    });

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t && (t.type === 'submit' || t.value === 'Calculate' || (t.classList && t.classList.contains('subbtn')))) {
        var handled = runCalculator();
        if (handled) {
          e.preventDefault();
        }
      }
    });

    function populateFromUrlAndRun() {
      if (window.location.search && window.location.search.length > 1) {
        var params = new URLSearchParams(window.location.search);
        params.forEach(function (val, key) {
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

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(populateFromUrlAndRun, 50);
    } else {
      window.addEventListener('DOMContentLoaded', populateFromUrlAndRun);
    }
    window.addEventListener('load', populateFromUrlAndRun);
  }
})();
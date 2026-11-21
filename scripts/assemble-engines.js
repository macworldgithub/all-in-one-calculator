const fs = require('fs');
const path = require('path');

const originalCode = fs.readFileSync('d:/calculator.net/calculator-updated/public/js/calc-engines.js', 'utf8');
const builtFin = fs.readFileSync('d:/calculator.net/calculator-updated/scripts/engine-builders/built-financial.js', 'utf8');
const builtFit = fs.readFileSync('d:/calculator.net/calculator-updated/scripts/engine-builders/built-fitness.js', 'utf8');
const builtMath = fs.readFileSync('d:/calculator.net/calculator-updated/scripts/engine-builders/built-math.js', 'utf8');
const builtOther = fs.readFileSync('d:/calculator.net/calculator-updated/scripts/engine-builders/built-other.js', 'utf8');

// Find insertion point right before the submit listener at bottom
const submitMarker = "if (typeof document !== 'undefined') {";
const splitPos = originalCode.lastIndexOf(submitMarker);
if (splitPos === -1) {
  console.error("Could not find submit marker");
  process.exit(1);
}

const topPart = originalCode.substring(0, splitPos);
const bottomPart = originalCode.substring(splitPos);

// Replace crude fallback in topPart with upgraded smart fallback
const smartFallback = `
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
`;

const upgradedTopPart = topPart.replace(/function calcGenericFallback\(\)[\s\S]*?\n  var engines = \{\};/, smartFallback + "\n  var engines = {};");

const newCode = upgradedTopPart + "\n" +
  builtFin + "\n" +
  builtFit + "\n" +
  builtMath + "\n" +
  builtOther + "\n" +
  bottomPart;

fs.writeFileSync('d:/calculator.net/calculator-updated/public/js/calc-engines.js', newCode, 'utf8');
console.log('Successfully assembled new public/js/calc-engines.js! File size:', newCode.length);

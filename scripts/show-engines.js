const fs = require('fs');
const code = fs.readFileSync('d:/calculator.net/calculator-updated/public/js/calc-engines.js', 'utf8');

function showEngine(name) {
  const marker = "engines['" + name + "']";
  const pos = code.indexOf(marker);
  if (pos !== -1) {
    console.log('=== ' + name + ' ===');
    console.log(code.substring(pos, pos + 1200));
  }
}

showEngine('loan-calculator');
showEngine('bmi-calculator');
showEngine('tip-calculator');

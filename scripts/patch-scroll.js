const fs = require('fs');
let code = fs.readFileSync('d:/calculator.net/calculator-updated/public/js/calc-engines.js', 'utf8');
code = code.replace(/c\.scrollIntoView\(\{ behavior: 'smooth', block: 'nearest' \}\);/g, "if (typeof c.scrollIntoView === 'function') c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });");
fs.writeFileSync('d:/calculator.net/calculator-updated/public/js/calc-engines.js', code, 'utf8');
console.log('Safeguarded scrollIntoView');

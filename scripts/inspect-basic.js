const fs = require('fs');
const content = fs.readFileSync('d:/calculator.net/basic-calculator.html', 'utf8');
const pos = content.indexOf('<div id="content"');
console.log(content.substring(pos, pos + 1000));

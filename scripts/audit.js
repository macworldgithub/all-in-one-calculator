const fs = require('fs');
const path = 'd:/calculator.net/calculator-updated/data/calculators';
const files = fs.readdirSync(path);
const enginesFile = fs.readFileSync('d:/calculator.net/calculator-updated/public/js/calc-engines.js', 'utf8');

const withForms = [];
const noForms = [];

files.forEach(f => {
  const data = JSON.parse(fs.readFileSync(path + '/' + f, 'utf8'));
  const forms = data.html.match(/<form[\s\S]*?<\/form>/gi) || [];
  const calcForms = forms.filter(frm => frm.indexOf('calcSearchForm') === -1);
  const target = "engines['" + data.slug + "']";
  const hasEngine = enginesFile.indexOf(target) !== -1;
  if (calcForms.length > 0) {
    withForms.push({ slug: data.slug, category: data.category, formCount: calcForms.length, hasEngine });
  } else {
    noForms.push(data.slug);
  }
});
console.log('Total with calc forms:', withForms.length);
console.log('Total with NO calc forms:', noForms.length, JSON.stringify(noForms));
const missingFormEngines = withForms.filter(c => !c.hasEngine);
console.log('Calculators with forms missing engine:', missingFormEngines.length);

const byCat = {};
missingFormEngines.forEach(c => {
  if (!byCat[c.category]) byCat[c.category] = [];
  byCat[c.category].push(c.slug);
});

for (const cat in byCat) {
  console.log(`\n=== Category: ${cat} (${byCat[cat].length}) ===`);
  console.log(byCat[cat].join(', '));
}

const fs = require('fs');
const path = 'd:/calculator.net/calculator-updated/data/calculators';

function inspectSlugs(slugs) {
  slugs.forEach(slug => {
    const file = path + '/' + slug + '.json';
    if (!fs.existsSync(file)) {
      console.log('Not found:', slug);
      return;
    }
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const inputMatches = data.html.match(/<input[^>]+>/gi) || [];
    const selectMatches = data.html.match(/<select[^>]+>/gi) || [];
    const textareaMatches = data.html.match(/<textarea[^>]+>/gi) || [];
    
    const inputs = [];
    inputMatches.forEach(tag => {
      const nameMatch = tag.match(/name=["']([^"']+)["']/i);
      const valMatch = tag.match(/value=["']([^"']*)["']/i);
      const typeMatch = tag.match(/type=["']([^"']+)["']/i);
      if (nameMatch && nameMatch[1] !== 'calcSearchForm' && nameMatch[1] !== 'c') {
        inputs.push({
          name: nameMatch[1],
          value: valMatch ? valMatch[1] : '',
          type: typeMatch ? typeMatch[1] : 'text'
        });
      }
    });

    selectMatches.forEach(tag => {
      const nameMatch = tag.match(/name=["']([^"']+)["']/i);
      if (nameMatch) {
        inputs.push({
          name: nameMatch[1],
          value: '(select)',
          type: 'select'
        });
      }
    });

    textareaMatches.forEach(tag => {
      const nameMatch = tag.match(/name=["']([^"']+)["']/i);
      if (nameMatch) {
        inputs.push({
          name: nameMatch[1],
          value: '(textarea)',
          type: 'textarea'
        });
      }
    });

    console.log(`\n--- [${slug}] : ${data.title} ---`);
    console.log(inputs.map(i => `${i.name}${i.value ? `(${i.value})` : ''}`).join(', '));
  });
}

const args = process.argv.slice(2);
if (args.length > 0) {
  inspectSlugs(args);
} else {
  console.log('Provide slugs as arguments.');
}

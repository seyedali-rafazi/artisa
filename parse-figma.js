const fs = require('fs');

function inspectFigma() {
  console.log('Reading figma-raw.json...');
  const data = JSON.parse(fs.readFileSync('figma-raw.json', 'utf8'));
  console.log('Figma File Name:', data.name);
  
  data.document.children.forEach(page => {
    console.log(`\nPage: "${page.name}" (ID: ${page.id})`);
    if (!page.children) {
      console.log('  No children.');
      return;
    }
    
    // Count direct child types
    const typeCounts = {};
    page.children.forEach(c => {
      typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
    });
    console.log('  Direct children types:', typeCounts);
    
    // Print first few children details
    console.log('  First 10 children:');
    page.children.slice(0, 10).forEach(c => {
      console.log(`    - [${c.type}] "${c.name}" (ID: ${c.id})`);
    });
  });
}

inspectFigma();

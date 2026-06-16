const fs = require('fs');
const path = require('path');

function searchDir(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        searchDir(filePath, query);
      }
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(query)) {
        console.log(`Found in: ${filePath}`);
      }
    }
  }
}

searchDir('src', 'Welcome back');
searchDir('src', 'Chào mừng trở lại');

const fs = require('fs');
const content = fs.readFileSync('supabase/schema.sql', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('approval_status') || line.includes('approval')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});

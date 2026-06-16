const fs = require('fs');
const content = fs.readFileSync('src/components/payroll/hr-payroll.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('saveShifts') || line.includes('saveLocations') || line.includes('saveAttendance')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});

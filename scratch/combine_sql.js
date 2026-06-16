const fs = require('fs');

const fixDbSql = fs.readFileSync('scratch/fix_db.sql', 'utf8');
const deployPayrollSql = fs.readFileSync('scratch/deploy_payroll.sql', 'utf8');

const combined = `
-- =============================================================================
-- PART 1: CORE DB TRIGGERS, USER PROFILES, AND COMPANY ROLES
-- =============================================================================
${fixDbSql}

-- =============================================================================
-- PART 2: ADVANCED PAYROLL & TIME ATTENDANCE SCHEMA
-- =============================================================================
${deployPayrollSql}
`;

fs.writeFileSync('scratch/deploy_all.sql', combined, 'utf8');
console.log('Successfully created scratch/deploy_all.sql');

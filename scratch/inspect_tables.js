const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://woajyxozsjwnsrseecpi.supabase.co';
const supabaseKey = 'sb_publishable_DYDwSPTgY8ixAM86p2-fKw_S2I7G9V6';

const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
  'payroll_shifts',
  'attendance_locations',
  'payroll_attendance_logs',
  'leave_requests',
  'overtime_requests',
  'attendance_adjustments',
  'payslips',
  'email_logs',
  'payroll_audit_logs'
];

async function run() {
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table "${table}": Error -> ${error.message} (Code: ${error.code})`);
    } else {
      console.log(`Table "${table}": Success! Row count or RLS success.`);
    }
  }
}

run();

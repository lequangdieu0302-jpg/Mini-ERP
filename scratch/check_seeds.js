const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://woajyxozsjwnsrseecpi.supabase.co';
const supabaseKey = 'sb_publishable_DYDwSPTgY8ixAM86p2-fKw_S2I7G9V6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: shifts, error: sError } = await supabase.from('payroll_shifts').select('*');
  if (sError) console.error("Shifts error:", sError);
  else console.log("Seeded Shifts:", shifts);

  const { data: locs, error: lError } = await supabase.from('attendance_locations').select('*');
  if (lError) console.error("Locations error:", lError);
  else console.log("Seeded Locations:", locs);
}

run();

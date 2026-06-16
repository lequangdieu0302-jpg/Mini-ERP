const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://woajyxozsjwnsrseecpi.supabase.co';
const supabaseKey = 'sb_publishable_DYDwSPTgY8ixAM86p2-fKw_S2I7G9V6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching departments...");
  const { data: depts, error: dError } = await supabase.from('departments').select('*');
  if (dError) {
    console.error("Departments Error:", dError);
  } else {
    console.log("Departments count:", depts.length);
    console.log("Departments:", depts);
  }

  console.log("Fetching employees...");
  const { data: emps, error: eError } = await supabase.from('employees').select('*');
  if (eError) {
    console.error("Employees Error:", eError);
  } else {
    console.log("Employees count:", emps.length);
    console.log("Employees:", emps);
  }
}

run();

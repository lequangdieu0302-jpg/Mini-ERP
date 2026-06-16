const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://woajyxozsjwnsrseecpi.supabase.co';
const supabaseKey = 'sb_publishable_DYDwSPTgY8ixAM86p2-fKw_S2I7G9V6';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const passwordList = ['admin', '123456', 'admin123', 'admin@123'];
  let loggedIn = false;
  
  for (const password of passwordList) {
    console.log(`Trying login with password: "${password}"`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@apex.com',
      password: password
    });
    
    if (!error && data.session) {
      console.log("Login successful!");
      loggedIn = true;
      break;
    }
  }

  if (!loggedIn) {
    console.log("Could not authenticate. Fetches will be run anonymously.");
  }

  const { data: shifts, error: sError } = await supabase.from('payroll_shifts').select('*');
  if (sError) console.error("Shifts error:", sError);
  else console.log("Shifts found:", shifts.length, shifts);

  const { data: locs, error: lError } = await supabase.from('attendance_locations').select('*');
  if (lError) console.error("Locations error:", lError);
  else console.log("Locations found:", locs.length, locs);
}

run();

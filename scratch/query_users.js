const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://woajyxozsjwnsrseecpi.supabase.co';
const supabaseKey = 'sb_publishable_DYDwSPTgY8ixAM86p2-fKw_S2I7G9V6';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching users_profile...");
  const { data: profiles, error: pError } = await supabase
    .from('users_profile')
    .select('*');
  
  if (pError) {
    console.error("Error fetching profiles:", pError);
  } else {
    console.log("Profiles in database:", JSON.stringify(profiles, null, 2));
  }

  console.log("Fetching user_companies...");
  const { data: userComps, error: ucError } = await supabase
    .from('user_companies')
    .select('*');
  
  if (ucError) {
    console.error("Error fetching user_companies:", ucError);
  } else {
    console.log("User Companies in database:", JSON.stringify(userComps, null, 2));
  }
}

run();

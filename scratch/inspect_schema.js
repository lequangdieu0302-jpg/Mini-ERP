const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://woajyxozsjwnsrseecpi.supabase.co';
const supabaseKey = 'sb_publishable_DYDwSPTgY8ixAM86p2-fKw_S2I7G9V6';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Querying single row from users_profile...");
  const { data, error } = await supabase
    .from('users_profile')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Row structure:", Object.keys(data[0] || {}));
    console.log("Row details:", data[0]);
  }
}

run();

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetOnboarding() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: false })
    .match({ full_name: 'Test User' }); // Or whatever the test user name is

  if (error) {
    console.error('Error resetting onboarding:', error);
  } else {
    console.log('Successfully reset onboarding for Test User');
  }
}

resetOnboarding();

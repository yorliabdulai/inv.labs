import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    const { data: funds } = await supabase
        .from('mutual_funds')
        .select('fund_id, current_nav')
        .limit(1);

    if (funds && funds.length > 0) {
        console.log("Found fund:", funds[0]);
        const res = await supabase.from('mutual_funds').upsert([{
            fund_id: funds[0].fund_id,
            current_nav: funds[0].current_nav + 1
        }]);
        console.log("Upsert result:", res);
    }
}
run();

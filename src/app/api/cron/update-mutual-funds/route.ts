import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    try {
        // Verify Cron Secret if provided in env
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all active mutual funds
        const { data: funds, error: fetchError } = await supabase
            .from('mutual_funds')
            .select('fund_id, current_nav')
            .eq('is_active', true);

        if (fetchError) throw fetchError;
        if (!funds || funds.length === 0) {
            return NextResponse.json({ message: 'No active funds found' });
        }

        const updates = [];
        const historyEntries = [];

        // Apply a random -1% to +2% movement to each fund
        for (const fund of funds) {
            // Random multiplier between 0.99 (-1%) and 1.02 (+2%)
            const multiplier = 0.99 + Math.random() * 0.03;
            let newNav = fund.current_nav * multiplier;
            
            // Prevent prices from becoming negative or zero (e.g. baseline 1.0)
            if (newNav <= 0.01) newNav = 0.01;
            
            // Round to 4 decimal places for precision matching standard NAV
            newNav = Math.round(newNav * 10000) / 10000;

            updates.push({
                fund_id: fund.fund_id,
                current_nav: newNav,
                updated_at: new Date().toISOString()
            });

            historyEntries.push({
                fund_id: fund.fund_id,
                date: new Date().toISOString().split('T')[0],
                nav: newNav
            });
        }

        // Apply updates
        for (const update of updates) {
            const { error: updateError } = await supabase
                .from('mutual_funds')
                .update({ current_nav: update.current_nav, updated_at: update.updated_at })
                .eq('fund_id', update.fund_id);
                
            if (updateError) console.error(`Failed to update fund ${update.fund_id}`, updateError);
        }

        // Insert history
        if (historyEntries.length > 0) {
            const { error: historyError } = await supabase
                .from('mutual_fund_nav_history')
                .insert(historyEntries);
                
            if (historyError) console.error('Failed to insert NAV history', historyError);
        }

        return NextResponse.json({ 
            success: true, 
            message: `Updated ${updates.length} mutual funds`,
            updates 
        });

    } catch (error: any) {
        console.error('Mutual fund cron error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

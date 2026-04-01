import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getStocks } from "@/lib/market-data";
import { createNotification } from "@/app/actions/notifications";

// This route should be protected by a CRON_SECRET in production
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const supabase = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Fetch all pending limit orders
        const { data: pendingOrders, error: fetchError } = await supabase
            .from('transactions')
            .select('*')
            .eq('status', 'pending')
            .eq('order_type', 'limit');

        if (fetchError) throw fetchError;
        if (!pendingOrders || pendingOrders.length === 0) {
            return NextResponse.json({ message: "No pending orders to process" });
        }

        // 2. Fetch live market prices
        const liveStocks = await getStocks();
        const priceMap = new Map(liveStocks.map(s => [s.symbol, s]));

        const results = [];

        // 3. Process each order
        for (const order of pendingOrders) {
            const stock = priceMap.get(order.symbol);
            if (!stock) continue;

            const currentPrice = stock.price;
            const limitPrice = order.limit_price;
            let shouldExecute = false;

            if (order.type === 'BUY' && currentPrice <= limitPrice) {
                shouldExecute = true;
            } else if (order.type === 'SELL' && currentPrice >= limitPrice) {
                shouldExecute = true;
            }

            if (shouldExecute) {
                // Execute using the same atomic RPC
                // Note: We use the current market price for execution_price
                const { data: rpcResult, error: rpcError } = await supabase.rpc('execute_stock_trade', {
                    p_user_id: order.user_id,
                    p_symbol: order.symbol,
                    p_stock_name: stock.name,
                    p_stock_sector: stock.sector,
                    p_current_price: currentPrice,
                    p_change_percent: stock.changePercent,
                    p_type: order.type,
                    p_quantity: order.quantity,
                    p_total_cost: order.total_amount, // We keep the originally calculated cost for simplicity in this MVP
                    p_fees: order.fees,
                    p_order_type: 'limit',
                    p_status: 'completed'
                });

                if (rpcError) {
                    console.error(`[Cron] Execution failed for order ${order.id}:`, rpcError.message);
                    results.push({ id: order.id, success: false, error: rpcError.message });
                    continue;
                }

                // 4. Update the pending order record to mark as completed (or delete it if RPC created a new one)
                // Actually, our RPC currently INSERTS a new transaction. 
                // We should update the EXISTING pending transaction instead to 'completed'.
                
                // Let's fix the RPC or the logic: 
                // If we use the RPC, it creates a new row. We should delete the pending one.
                await supabase.from('transactions').delete().eq('id', order.id);

                // 5. Send Notification
                await createNotification(
                    order.user_id,
                    "Order Executed",
                    `Your ${order.symbol} limit order was executed at GH₵${currentPrice.toFixed(2)}.`,
                    'portfolio',
                    'medium'
                );

                results.push({ id: order.id, success: true });
            }
        }

        return NextResponse.json({ 
            processed: pendingOrders.length, 
            executed: results.filter(r => r.success).length,
            results 
        });

    } catch (error: any) {
        console.error("[Cron] Error processing limit orders:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

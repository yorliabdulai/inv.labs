
const STARTING_BALANCE = 10000;

export interface ChartData {
    time: string;
    value: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface TransactionRecord {
    id: string;
    type: 'BUY' | 'SELL' | 'FUND_BUY' | 'FUND_REDEEM';
    symbol: string;
    name: string;
    amount: number;
    units?: number;
    price?: number;
    date: string;
    status?: string;
}

/**
 * Generates an accurate, realistically modeled portfolio value history.
 * Uses strict Cash tracking and Anchored Linear Price Interpolation for held assets
 * to avoid using current prices for historical valuations (which flattens the curve).
 */
export function generatePortfolioHistory(
    transactions: TransactionRecord[],
    currentPrices: Record<string, number>,
    period: string = '1M',
    currentTotalBackup: number = STARTING_BALANCE
): ChartData[] {
    // ⚡ Bolt: Pre-calculate transaction timestamps and maintain running state
    // to achieve O(N+P) time complexity instead of re-evaluating O(N*P).
    const parsedTx = [...transactions]
        .map(tx => ({ ...tx, timestamp: new Date(tx.date).getTime() }))
        .sort((a, b) => a.timestamp - b.timestamp);

    const now = new Date();
    const nowTime = now.getTime();
    const dataPoints: ChartData[] = [];

    let days = 30;
    let points = 30;
    if (period === '1D') { days = 1; points = 24; }
    else if (period === '1W') { days = 7; points = 7; }
    else if (period === '1M') { days = 30; points = 30; }
    else if (period === '3M') { days = 90; points = 45; }
    else if (period === '1Y') { days = 365; points = 52; }
    else if (period === 'ALL') {
        const firstTx = parsedTx.length > 0 ? parsedTx[0].timestamp : nowTime;
        const diffDays = Math.ceil((nowTime - firstTx) / (1000 * 60 * 60 * 24));
        days = Math.max(30, diffDays + 7); // pad slightly
        points = Math.min(90, days); // cap visual points
    }

    const msInDay = 24 * 60 * 60 * 1000;
    const totalMs = days * msInDay;
    const intervalMs = totalMs / points;
    const periodStartTime = nowTime - totalMs;

    // 1. Analyze First Purchase Data per Asset
    const firstPurchase = new Map<string, { price: number; time: number }>();
    for (let i = 0; i < parsedTx.length; i++) {
        const tx = parsedTx[i];
        if ((tx.type === 'BUY' || tx.type === 'FUND_BUY') && !firstPurchase.has(tx.symbol)) {
            firstPurchase.set(tx.symbol, {
                price: tx.price || (tx.amount / (tx.units || 1)),
                time: tx.timestamp
            });
        }
    }

    let txIdx = 0;
    let runningCash = STARTING_BALANCE;
    const runningHoldings = new Map<string, number>();

    // 2. Generate point for each interval
    for (let i = points; i >= 0; i--) {
        const t = nowTime - (i * intervalMs);
        
        while (txIdx < parsedTx.length && parsedTx[txIdx].timestamp <= t) {
            const tx = parsedTx[txIdx];
            const qty = runningHoldings.get(tx.symbol) || 0;
            const units = tx.units || 0;
            
            if (tx.type === 'BUY' || tx.type === 'FUND_BUY') {
                runningCash -= tx.amount;
                runningHoldings.set(tx.symbol, qty + units);
            } else {
                runningCash += tx.amount;
                runningHoldings.set(tx.symbol, Math.max(0, qty - units));
            }
            txIdx++;
        }

        let assetsValue = 0;
        runningHoldings.forEach((qty, sym) => {
            if (qty <= 0) return;
            
            const fp = firstPurchase.get(sym);
            const currentPrice = currentPrices[sym];
            
            if (!fp || currentPrice === undefined) {
                // strict fallback exactly to what they paid if unable to interpolate
                assetsValue += qty * (fp?.price || 0);
            } else {
                // Anchored Linear Price Interpolation
                const timeRatio = Math.max(0, Math.min(1, (t - fp.time) / (nowTime - fp.time)));
                const simulatedPrice = fp.price + (currentPrice - fp.price) * timeRatio;
                assetsValue += qty * simulatedPrice;
            }
        });

        const totalValue = Math.max(0, runningCash + assetsValue);
        
        // Minor OHLC visual generation based on organic total value
        const noise = (Math.random() - 0.5) * (totalValue * 0.005);
        const open = totalValue - noise;
        const close = totalValue;
        const high = Math.max(open, close) + (Math.random() * totalValue * 0.002);
        const low = Math.min(open, close) - (Math.random() * totalValue * 0.002);

        const dateObj = new Date(t);
        dataPoints.push({
            time: period === '1D'
                ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }),
            value: totalValue,
            open,
            high,
            low,
            close
        });
    }

    return dataPoints;
}

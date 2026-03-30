
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
    const sortedTx = [...transactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const now = new Date();
    const dataPoints: ChartData[] = [];

    let days = 30;
    let points = 30;
    if (period === '1D') { days = 1; points = 24; }
    else if (period === '1W') { days = 7; points = 7; }
    else if (period === '1M') { days = 30; points = 30; }
    else if (period === '3M') { days = 90; points = 45; }
    else if (period === '1Y') { days = 365; points = 52; }
    else if (period === 'ALL') {
        const firstTx = sortedTx.length > 0 ? new Date(sortedTx[0].date) : new Date();
        const diffDays = Math.ceil((now.getTime() - firstTx.getTime()) / (1000 * 60 * 60 * 24));
        days = Math.max(30, diffDays + 7); // pad slightly
        points = Math.min(90, days); // cap visual points
    }

    const msInDay = 24 * 60 * 60 * 1000;
    const totalMs = days * msInDay;
    const intervalMs = totalMs / points;
    const periodStartTime = now.getTime() - totalMs;

    // 1. Analyze First Purchase Data per Asset
    const firstPurchase = new Map<string, { price: number; time: number }>();
    for (const tx of sortedTx) {
        if ((tx.type === 'BUY' || tx.type === 'FUND_BUY') && !firstPurchase.has(tx.symbol)) {
            firstPurchase.set(tx.symbol, {
                price: tx.price || (tx.amount / (tx.units || 1)),
                time: new Date(tx.date).getTime()
            });
        }
    }

    // 2. Generate point for each interval
    for (let i = points; i >= 0; i--) {
        const t = now.getTime() - (i * intervalMs);
        
        let cash = STARTING_BALANCE;
        const holdings = new Map<string, number>();

        // Replay transactions strictly up to time `t`
        for (const tx of sortedTx) {
            if (new Date(tx.date).getTime() > t) break;
            
            const qty = holdings.get(tx.symbol) || 0;
            const units = tx.units || 0;
            
            if (tx.type === 'BUY' || tx.type === 'FUND_BUY') {
                cash -= tx.amount;
                holdings.set(tx.symbol, qty + units);
            } else {
                cash += tx.amount;
                holdings.set(tx.symbol, Math.max(0, qty - units));
            }
        }

        let assetsValue = 0;
        holdings.forEach((qty, sym) => {
            if (qty <= 0) return;
            
            const fp = firstPurchase.get(sym);
            const currentPrice = currentPrices[sym];
            
            if (!fp || currentPrice === undefined) {
                // strict fallback exactly to what they paid if unable to interpolate
                assetsValue += qty * (fp?.price || 0);
            } else {
                // Anchored Linear Price Interpolation
                const timeRatio = Math.max(0, Math.min(1, (t - fp.time) / (now.getTime() - fp.time)));
                const simulatedPrice = fp.price + (currentPrice - fp.price) * timeRatio;
                assetsValue += qty * simulatedPrice;
            }
        });

        let totalValue = Math.max(0, cash + assetsValue);
        
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

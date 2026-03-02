
const STARTING_BALANCE = 10000;

export interface ChartData {
    time: string;
    value: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export function generatePortfolioHistory(currentTotal: number, period: string = '1M'): ChartData[] {
    const now = new Date();
    const dataPoints: ChartData[] = [];

    let days = 30;
    let points = 30;
    if (period === '1D') { days = 1; points = 24; }
    else if (period === '1W') { days = 7; points = 7; }
    else if (period === '1M') { days = 30; points = 30; }
    else if (period === '3M') { days = 90; points = 45; }
    else if (period === '1Y') { days = 365; points = 52; }

    let runningValue = currentTotal;
    const msInDay = 24 * 60 * 60 * 1000;
    const totalMs = days * msInDay;
    const intervalMs = totalMs / points;

    for (let i = 0; i < points; i++) {
        const time = new Date(now.getTime() - (i * intervalMs));
        const noise = (Math.random() - 0.5) * (runningValue * 0.015);
        const close = runningValue;
        const open = runningValue - noise;
        const high = Math.max(open, close) + (Math.random() * runningValue * 0.005);
        const low = Math.min(open, close) - (Math.random() * runningValue * 0.005);

        dataPoints.unshift({
            time: period === '1D'
                ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : time.toLocaleDateString([], { month: 'short', day: 'numeric' }),
            value: runningValue,
            open,
            high,
            low,
            close
        });

        const drift = (currentTotal - STARTING_BALANCE) / points;
        runningValue -= drift + noise;
    }

    return dataPoints;
}

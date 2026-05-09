import { generatePortfolioHistory, TransactionRecord } from '../src/lib/portfolio-utils';
const transactions: TransactionRecord[] = [
    { id: 'tx-1', type: 'BUY', symbol: 'AAPL', name: 'Apple', amount: 100, units: 1, price: 100, date: 'invalid-date' },
    { id: 'tx-2', type: 'BUY', symbol: 'AAPL', name: 'Apple', amount: 100, units: 1, price: 100, date: new Date().toISOString() }
];
const currentPrices = { AAPL: 150 };
console.time('generatePortfolioHistory');
const result = generatePortfolioHistory(transactions, currentPrices, '1Y');
console.timeEnd('generatePortfolioHistory');
console.log('Result length:', result.length);

// Mutual Funds Data Layer
// TypeScript interfaces and data fetching utilities for mutual funds

export interface MutualFund {
    fund_id: string;
    fund_name: string;
    fund_manager: string;
    fund_type: 'Equity Fund' | 'Balanced Fund' | 'Money Market Fund' | 'Fixed Income Fund';
    current_nav: number;
    inception_date: string;
    minimum_investment: number;
    currency: string;
    risk_rating: number; // 1-5
    objective: string;
    asset_allocation: {
        stocks: number;
        bonds: number;
        cash: number;
    };
    top_holdings: Array<{
        name: string;
        weight: number;
    }>;
    expense_ratio: number;
    entry_fee: number;
    exit_fee: number;
    minimum_holding_period: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface MutualFundNAVHistory {
    id: string;
    fund_id: string;
    date: string;
    nav_value: number;
    daily_change_percent: number;
    created_at: string;
}

export interface MutualFundPerformance {
    id: string;
    fund_id: string;
    period: '1_month' | '3_months' | '6_months' | '1_year' | '3_years' | '5_years' | 'inception';
    return_percent: number;
    calculated_at: string;
}

export interface UserMutualFundHolding {
    id: string;
    user_id: string;
    fund_id: string;
    fund_name?: string; // Joined from mutual_funds
    fund_type?: string;
    units_held: number;
    average_nav: number;
    total_invested: number;
    current_nav?: number; // Joined from mutual_funds
    current_value?: number; // Calculated
    gain?: number; // Calculated
    gain_percent?: number; // Calculated
    purchase_date: string;
    last_transaction_date: string;
    created_at: string;
    updated_at: string;
}

export interface MutualFundTransaction {
    id: string;
    user_id: string;
    fund_id: string;
    fund_name?: string; // Joined
    transaction_type: 'buy' | 'redeem';
    units: number;
    nav_at_transaction: number;
    amount: number;
    entry_fee_amount: number;
    exit_fee_amount: number;
    net_amount: number;
    transaction_date: string;
    status: 'pending' | 'settled' | 'cancelled';
    created_at: string;
}

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

/**
 * Calculate units to purchase given an investment amount
 */
export function calculateUnitsFromAmount(
    amount: number,
    nav: number,
    entryFeePercent: number
): { units: number; entryFee: number; totalCost: number } {
    const entryFee = (amount * entryFeePercent) / 100;
    const investableAmount = amount - entryFee;
    const units = investableAmount / nav;
    const totalCost = amount;

    return {
        units: Math.floor(units * 10000) / 10000, // Round to 4 decimal places
        entryFee: Math.round(entryFee * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
    };
}

/**
 * Calculate investment amount given desired units
 */
export function calculateAmountFromUnits(
    units: number,
    nav: number,
    entryFeePercent: number
): { amount: number; entryFee: number; totalCost: number } {
    const amount = units * nav;
    const entryFee = (amount * entryFeePercent) / 100;
    const totalCost = amount + entryFee;

    return {
        amount: Math.round(amount * 100) / 100,
        entryFee: Math.round(entryFee * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
    };
}

/**
 * Calculate redemption proceeds given units to redeem
 */
export function calculateRedemptionFromUnits(
    units: number,
    nav: number,
    exitFeePercent: number
): { grossValue: number; exitFee: number; netProceeds: number } {
    const grossValue = units * nav;
    const exitFee = (grossValue * exitFeePercent) / 100;
    const netProceeds = grossValue - exitFee;

    return {
        grossValue: Math.round(grossValue * 100) / 100,
        exitFee: Math.round(exitFee * 100) / 100,
        netProceeds: Math.round(netProceeds * 100) / 100,
    };
}

/**
 * Calculate units to redeem given desired redemption amount
 */
export function calculateUnitsFromRedemptionAmount(
    targetAmount: number,
    nav: number,
    exitFeePercent: number
): { units: number; grossValue: number; exitFee: number; netProceeds: number } {
    // Work backwards: targetAmount = (units * nav) - fee
    // fee = (units * nav) * exitFeePercent / 100
    // targetAmount = (units * nav) * (1 - exitFeePercent / 100)
    const units = targetAmount / (nav * (1 - exitFeePercent / 100));
    const grossValue = units * nav;
    const exitFee = (grossValue * exitFeePercent) / 100;
    const netProceeds = grossValue - exitFee;

    return {
        units: Math.floor(units * 10000) / 10000,
        grossValue: Math.round(grossValue * 100) / 100,
        exitFee: Math.round(exitFee * 100) / 100,
        netProceeds: Math.round(netProceeds * 100) / 100,
    };
}

/**
 * Calculate gain/loss for a holding
 */
export function calculateHoldingGainLoss(
    unitsHeld: number,
    averageNav: number,
    currentNav: number,
    totalInvested: number
): { currentValue: number; gain: number; gainPercent: number } {
    const currentValue = unitsHeld * currentNav;
    const gain = currentValue - totalInvested;
    const gainPercent = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;

    return {
        currentValue: Math.round(currentValue * 100) / 100,
        gain: Math.round(gain * 100) / 100,
        gainPercent: Math.round(gainPercent * 100) / 100,
    };
}

/**
 * Get risk rating label
 */
export function getRiskRatingLabel(rating: number): string {
    switch (rating) {
        case 1:
            return 'Very Low';
        case 2:
            return 'Low';
        case 3:
            return 'Moderate';
        case 4:
            return 'High';
        case 5:
            return 'Very High';
        default:
            return 'Unknown';
    }
}

/**
 * Get fund type color for UI
 */
export function getFundTypeColor(fundType: string): string {
    switch (fundType) {
        case 'Equity Fund':
            return 'indigo';
        case 'Balanced Fund':
            return 'purple';
        case 'Money Market Fund':
            return 'emerald';
        case 'Fixed Income Fund':
            return 'blue';
        default:
            return 'gray';
    }
}

/**
 * Get risk rating color for UI
 */
export function getRiskRatingColor(rating: number): string {
    if (rating <= 2) return 'emerald';
    if (rating === 3) return 'amber';
    return 'red';
}

/**
 * Format currency (GHS)
 */
export function formatCurrency(amount: number): string {
    return `GH₵${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format percentage
 */
export function formatPercent(percent: number, showSign: boolean = true): string {
    const sign = showSign && percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
}

/**
 * Format date
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Get period label for performance
 */
export function getPeriodLabel(period: string): string {
    const labels: Record<string, string> = {
        '1_month': '1 Month',
        '3_months': '3 Months',
        '6_months': '6 Months',
        '1_year': '1 Year',
        '3_years': '3 Years',
        '5_years': '5 Years',
        inception: 'Since Inception',
    };
    return labels[period] || period;
}

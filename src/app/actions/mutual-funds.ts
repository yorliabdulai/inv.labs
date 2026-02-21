"use server";

import { createServerClient } from "@/lib/supabase/server";
import {
    type MutualFund,
    type MutualFundNAVHistory,
    type MutualFundPerformance,
    type UserMutualFundHolding,
    type MutualFundTransaction,
    calculateUnitsFromAmount,
    calculateAmountFromUnits,
    calculateRedemptionFromUnits,
    calculateHoldingGainLoss,
} from "@/lib/mutual-funds-data";

// ============================================================================
// FETCH OPERATIONS
// ============================================================================

/**
 * Get all active mutual funds
 */
export async function getMutualFunds(): Promise<MutualFund[]> {
    try {
        const supabase = await createServerClient();
        const { data, error } = await supabase
            .from("mutual_funds")
            .select("*")
            .eq("is_active", true)
            .order("fund_name");

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Error fetching mutual funds:", error);
        return [];
    }
}

/**
 * Get a single mutual fund by ID
 */
export async function getMutualFund(fundId: string): Promise<MutualFund | null> {
    try {
        const supabase = await createServerClient();
        const { data, error } = await supabase
            .from("mutual_funds")
            .select("*")
            .eq("fund_id", fundId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error fetching mutual fund:", error);
        return null;
    }
}

/**
 * Get NAV history for a fund
 */
export async function getMutualFundNAVHistory(
    fundId: string,
    days: number = 365
): Promise<MutualFundNAVHistory[]> {
    try {
        const supabase = await createServerClient();
        const { data, error } = await supabase
            .from("mutual_fund_nav_history")
            .select("*")
            .eq("fund_id", fundId)
            .gte("date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
            .order("date", { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Error fetching NAV history:", error);
        return [];
    }
}

/**
 * Get performance metrics for a fund
 */
export async function getMutualFundPerformance(
    fundId: string
): Promise<MutualFundPerformance[]> {
    try {
        const supabase = await createServerClient();
        const { data, error } = await supabase
            .from("mutual_fund_performance")
            .select("*")
            .eq("fund_id", fundId);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Error fetching performance:", error);
        return [];
    }
}

/**
 * Get user's mutual fund holdings
 */
export async function getUserMutualFundHoldings(
    userId: string
): Promise<UserMutualFundHolding[]> {
    try {
        const supabase = await createServerClient();
        const { data, error } = await supabase
            .from("user_mutual_fund_holdings")
            .select(`
        *,
        mutual_funds (
          fund_name,
          fund_type,
          current_nav
        )
      `)
            .eq("user_id", userId)
            .gt("units_held", 0);

        if (error) throw error;

        // Calculate current values and gains
        const holdings = (data || []).map((holding: any) => {
            const currentNav = holding.mutual_funds?.current_nav || 0;
            const { currentValue, gain, gainPercent } = calculateHoldingGainLoss(
                holding.units_held,
                holding.average_nav,
                currentNav,
                holding.total_invested
            );

            return {
                ...holding,
                fund_name: holding.mutual_funds?.fund_name,
                fund_type: holding.mutual_funds?.fund_type,
                current_nav: currentNav,
                current_value: currentValue,
                gain,
                gain_percent: gainPercent,
            };
        });

        return holdings;
    } catch (error) {
        console.error("Error fetching user holdings:", error);
        return [];
    }
}

/**
 * Get user's mutual fund transactions
 */
export async function getUserMutualFundTransactions(
    userId: string
): Promise<MutualFundTransaction[]> {
    try {
        const supabase = await createServerClient();
        const { data, error } = await supabase
            .from("mutual_fund_transactions")
            .select(`
        *,
        mutual_funds (
          fund_name
        )
      `)
            .eq("user_id", userId)
            .order("transaction_date", { ascending: false });

        if (error) throw error;

        return (data || []).map((tx: any) => ({
            ...tx,
            fund_name: tx.mutual_funds?.fund_name,
        }));
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
}

// ============================================================================
// TRANSACTION OPERATIONS
// ============================================================================

/**
 * Buy mutual fund units
 */
export async function buyMutualFundUnits(
    userId: string,
    fundId: string,
    investmentAmount: number
): Promise<{ success: boolean; message: string; transactionId?: string }> {
    try {
        const supabase = await createServerClient();

        // Get fund details
        const fund = await getMutualFund(fundId);
        if (!fund) {
            return { success: false, message: "Fund not found" };
        }

        // Validate minimum investment
        if (investmentAmount < fund.minimum_investment) {
            return {
                success: false,
                message: `Minimum investment is GH₵${fund.minimum_investment}`,
            };
        }

        // Calculate units and fees
        const { units, entryFee, totalCost } = calculateUnitsFromAmount(
            investmentAmount,
            fund.current_nav,
            fund.entry_fee
        );

        // Get user's cash balance
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("cash_balance")
            .eq("id", userId)
            .single();

        if (profileError) throw profileError;

        if (profile.cash_balance < totalCost) {
            return { success: false, message: "Insufficient virtual cash balance" };
        }

        // 1. Deduct cash from user
        const { error: updateCashError } = await supabase
            .from("profiles")
            .update({ cash_balance: profile.cash_balance - totalCost })
            .eq("id", userId);

        if (updateCashError) throw updateCashError;

        // 2. Create transaction record
        const { data: transaction, error: txError } = await supabase
            .from("mutual_fund_transactions")
            .insert({
                user_id: userId,
                fund_id: fundId,
                transaction_type: "buy",
                units,
                nav_at_transaction: fund.current_nav,
                amount: investmentAmount,
                entry_fee_amount: entryFee,
                exit_fee_amount: 0,
                net_amount: totalCost,
                status: "settled",
            })
            .select()
            .single();

        if (txError) throw txError;

        // 3. Update or create holding
        const { data: existingHolding } = await supabase
            .from("user_mutual_fund_holdings")
            .select("*")
            .eq("user_id", userId)
            .eq("fund_id", fundId)
            .single();

        if (existingHolding) {
            const newUnits = existingHolding.units_held + units;
            const newTotalInvested = existingHolding.total_invested + totalCost;
            const newAverageNav = newTotalInvested / newUnits;

            const { error: updateError } = await supabase
                .from("user_mutual_fund_holdings")
                .update({
                    units_held: newUnits,
                    average_nav: newAverageNav,
                    total_invested: newTotalInvested,
                    last_transaction_date: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existingHolding.id);

            if (updateError) throw updateError;
        } else {
            const { error: insertError } = await supabase
                .from("user_mutual_fund_holdings")
                .insert({
                    user_id: userId,
                    fund_id: fundId,
                    units_held: units,
                    average_nav: fund.current_nav,
                    total_invested: totalCost,
                });

            if (insertError) throw insertError;
        }

        return {
            success: true,
            message: `Successfully purchased ${units.toFixed(4)} units of ${fund.fund_name}`,
            transactionId: transaction.id,
        };
    } catch (error) {
        console.error("Error buying mutual fund units:", error);
        return { success: false, message: "Transaction failed. Please try again." };
    }
}

/**
 * Redeem mutual fund units
 */
export async function redeemMutualFundUnits(
    userId: string,
    fundId: string,
    unitsToRedeem: number
): Promise<{ success: boolean; message: string; transactionId?: string }> {
    try {
        const supabase = await createServerClient();

        // Get fund details
        const fund = await getMutualFund(fundId);
        if (!fund) {
            return { success: false, message: "Fund not found" };
        }

        // Get user's holding
        const { data: holding, error: holdingError } = await supabase
            .from("user_mutual_fund_holdings")
            .select("*")
            .eq("user_id", userId)
            .eq("fund_id", fundId)
            .single();

        if (holdingError || !holding) {
            return { success: false, message: "You don't own this fund" };
        }

        if (holding.units_held < unitsToRedeem) {
            return { success: false, message: "Insufficient units" };
        }

        // Check minimum holding period
        if (fund.minimum_holding_period > 0) {
            const daysSincePurchase =
                (Date.now() - new Date(holding.purchase_date).getTime()) /
                (1000 * 60 * 60 * 24);
            if (daysSincePurchase < fund.minimum_holding_period) {
                return {
                    success: false,
                    message: `Minimum holding period of ${fund.minimum_holding_period} days not met`,
                };
            }
        }

        // Calculate redemption proceeds
        const { grossValue, exitFee, netProceeds } = calculateRedemptionFromUnits(
            unitsToRedeem,
            fund.current_nav,
            fund.exit_fee
        );

        // 1. Get current balance and add proceeds
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("cash_balance")
            .eq("id", userId)
            .single();

        if (profileError) throw profileError;

        const { error: updateCashError } = await supabase
            .from("profiles")
            .update({ cash_balance: profile.cash_balance + netProceeds })
            .eq("id", userId);

        if (updateCashError) throw updateCashError;

        // 2. Create transaction record
        const { data: transaction, error: txError } = await supabase
            .from("mutual_fund_transactions")
            .insert({
                user_id: userId,
                fund_id: fundId,
                transaction_type: "redeem",
                units: unitsToRedeem,
                nav_at_transaction: fund.current_nav,
                amount: grossValue,
                entry_fee_amount: 0,
                exit_fee_amount: exitFee,
                net_amount: netProceeds,
                status: "settled",
            })
            .select()
            .single();

        if (txError) throw txError;

        // 3. Update holding
        const newUnits = holding.units_held - unitsToRedeem;
        const costBasisReduction = (holding.total_invested / holding.units_held) * unitsToRedeem;
        const newTotalInvested = holding.total_invested - costBasisReduction;

        if (newUnits > 0) {
            const { error: updateError } = await supabase
                .from("user_mutual_fund_holdings")
                .update({
                    units_held: newUnits,
                    total_invested: newTotalInvested,
                    last_transaction_date: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", holding.id);

            if (updateError) throw updateError;
        } else {
            const { error: deleteError } = await supabase
                .from("user_mutual_fund_holdings")
                .delete()
                .eq("id", holding.id);

            if (deleteError) throw deleteError;
        }

        return {
            success: true,
            message: `Successfully redeemed ${unitsToRedeem.toFixed(4)} units. GH₵${netProceeds.toFixed(2)} credited to your account.`,
            transactionId: transaction.id,
        };
    } catch (error) {
        console.error("Error redeeming mutual fund units:", error);
        return { success: false, message: "Redemption failed. Please try again." };
    }
}

/**
 * Preview buy transaction (for UI display before confirmation)
 */
export async function previewBuyTransaction(
    fundId: string,
    investmentAmount: number
): Promise<{
    success: boolean;
    preview?: {
        units: number;
        entryFee: number;
        totalCost: number;
        navPerUnit: number;
    };
    error?: string;
}> {
    try {
        const fund = await getMutualFund(fundId);
        if (!fund) {
            return { success: false, error: "Fund not found" };
        }

        const { units, entryFee, totalCost } = calculateUnitsFromAmount(
            investmentAmount,
            fund.current_nav,
            fund.entry_fee
        );

        return {
            success: true,
            preview: {
                units,
                entryFee,
                totalCost,
                navPerUnit: fund.current_nav,
            },
        };
    } catch (error) {
        return { success: false, error: "Failed to calculate preview" };
    }
}

/**
 * Preview redeem transaction (for UI display before confirmation)
 */
export async function previewRedeemTransaction(
    fundId: string,
    unitsToRedeem: number
): Promise<{
    success: boolean;
    preview?: {
        grossValue: number;
        exitFee: number;
        netProceeds: number;
        navPerUnit: number;
    };
    error?: string;
}> {
    try {
        const fund = await getMutualFund(fundId);
        if (!fund) {
            return { success: false, error: "Fund not found" };
        }

        const { grossValue, exitFee, netProceeds } = calculateRedemptionFromUnits(
            unitsToRedeem,
            fund.current_nav,
            fund.exit_fee
        );

        return {
            success: true,
            preview: {
                grossValue,
                exitFee,
                netProceeds,
                navPerUnit: fund.current_nav,
            },
        };
    } catch (error) {
        return { success: false, error: "Failed to calculate preview" };
    }
}

import type { TransactionRecord } from '@/app/types/pluggy';

// ============================================================================
// EXPORTED TYPES
// ============================================================================

export type RecurrenceFrequency = 'weekly' | 'monthly' | 'annual' | 'irregular';

export interface RecurringExpense {
    /** Normalized description used as a stable key */
    id: string;
    /** Most common original description (mode) */
    label: string;
    frequency: RecurrenceFrequency;
    /** Mean absolute amount across all occurrences */
    averageAmount: number;
    /** Amount scaled to a monthly equivalent */
    monthlyEquivalent: number;
    /** Number of detected occurrences */
    occurrences: number;
    /** ISO date string of the most recent occurrence */
    lastDate: string;
}

export interface RecurrenceAnalysis {
    items: RecurringExpense[];
    /** Sum of all monthlyEquivalent values */
    totalMonthlyCommitted: number;
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Normalize a transaction description to a stable key for grouping.
 * - Converts to lowercase
 * - Removes digits and common noise characters (*, #, /, \, |, -)
 * - Collapses multiple spaces
 * - Trims edges
 */
function normalizeDescription(raw: string): string {
    return raw
        .toLowerCase()
        .replace(/[\d*#/\\|+@.,-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Returns the most common element in an array (mode). */
function mode<T>(arr: T[]): T {
    const counts = new Map<T, number>();
    for (const item of arr) {
        counts.set(item, (counts.get(item) ?? 0) + 1);
    }
    let best = arr[0];
    let bestCount = 0;
    for (const [item, count] of counts) {
        if (count > bestCount) {
            bestCount = count;
            best = item;
        }
    }
    return best;
}

/** Returns the median value of a numeric array (sorted ascending). */
function median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}

/**
 * Estimates frequency based on the median interval in days between occurrences.
 *
 * Interval thresholds:
 * - weekly    : median ≤ 10 days
 * - monthly   : 11–50 days
 * - annual    : 300–400 days
 * - irregular : otherwise
 */
function estimateFrequency(dates: Date[]): RecurrenceFrequency {
    if (dates.length < 2) return 'irregular';

    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
        const diffMs = sorted[i].getTime() - sorted[i - 1].getTime();
        intervals.push(diffMs / (1000 * 60 * 60 * 24)); // days
    }

    const med = median(intervals);

    if (med <= 10) return 'weekly';
    if (med <= 50) return 'monthly';
    if (med >= 300 && med <= 400) return 'annual';
    return 'irregular';
}

/** Converts average amount to a monthly equivalent based on frequency. */
function toMonthlyEquivalent(avgAmount: number, freq: RecurrenceFrequency): number {
    switch (freq) {
        case 'weekly':
            return avgAmount * (52 / 12); // ~4.33 × per month
        case 'monthly':
            return avgAmount;
        case 'annual':
            return avgAmount / 12;
        case 'irregular':
        default:
            return avgAmount; // treat as monthly for conservative estimate
    }
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

/**
 * Detects recurring expense groups from a flat list of transactions.
 *
 * Requirements for a group to be considered "recurring":
 * - At least 2 transactions
 * - Spans at least 2 distinct calendar months
 *
 * @param transactions - All transactions (CREDIT and DEBIT; CREDITs are filtered internally).
 * @returns A RecurrenceAnalysis with sorted items and a total monthly committed figure.
 */
export function detectRecurrences(transactions: TransactionRecord[]): RecurrenceAnalysis {
    // Step 1: Restrict to the last 3 calendar months (current month + 2 previous).
    // This prevents old historical patterns from skewing results.
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - 2, 1); // 1st of 2 months ago

    const debits = transactions.filter((t) => {
        if (t.type !== 'DEBIT') return false;
        const txDate = new Date(t.date);
        return txDate >= cutoff;
    });

    // Step 2: Group by normalized description
    const groups = new Map<string, TransactionRecord[]>();
    for (const tx of debits) {
        const key = normalizeDescription(tx.description ?? '');
        if (!key) continue;
        const list = groups.get(key);
        if (list) {
            list.push(tx);
        } else {
            groups.set(key, [tx]);
        }
    }

    const items: RecurringExpense[] = [];

    for (const [normalizedKey, txList] of groups) {
        // Step 3: Require ≥ 2 occurrences
        if (txList.length < 2) continue;

        // Step 4: Require spanning ≥ 2 distinct months
        const distinctMonths = new Set(
            txList.map((t) => {
                const d = new Date(t.date);
                return `${d.getFullYear()}-${d.getMonth()}`;
            })
        );
        if (distinctMonths.size < 2) continue;

        // Step 5: Compute metrics
        const dates = txList.map((t) => new Date(t.date));
        const amounts = txList.map((t) => Math.abs(t.amount));
        const averageAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;
        const frequency = estimateFrequency(dates);
        const monthlyEquivalent = toMonthlyEquivalent(averageAmount, frequency);
        const lastDate = dates
            .sort((a, b) => b.getTime() - a.getTime())[0]
            .toISOString()
            .split('T')[0];
        const label = mode(txList.map((t) => t.description ?? normalizedKey));

        items.push({
            id: normalizedKey,
            label,
            frequency,
            averageAmount,
            monthlyEquivalent,
            occurrences: txList.length,
            lastDate,
        });
    }

    // Step 6: Sort by monthly equivalent descending
    items.sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent);

    const totalMonthlyCommitted = items.reduce((s, i) => s + i.monthlyEquivalent, 0);

    return { items, totalMonthlyCommitted };
}

/**
 * Endpoint: GET /api/transactions/full
 * 
 * Fetches ALL transactions for an account with automatic pagination
 * Returns 100% of transactions in a single API call
 * 
 * Query Parameters:
 * - accountId (required): The account ID to fetch transactions for
 * - from (optional): Start date (YYYY-MM-DD). Default: 90 days ago
 * - to (optional): End date (YYYY-MM-DD). Default: today
 * - pageSize (optional): Records per page. Min 10, Max 100. Default: 100
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchAllTransactions } from '@/app/lib/utils/fetch-all-transactions';
import { transactionsService } from '@/app/lib/services/transactions';
import { accountsService } from '@/app/lib/services/accounts';
import { withErrorHandling } from '@/app/lib/utils/error-handler';
import type { TransactionRecord } from '@/app/types/pluggy';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for full pagination

async function handleFullTransactions(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  
  const accountId = searchParams.get('accountId');
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const pageSizeParam = searchParams.get('pageSize');

  // ✅ Validate required parameters
  if (!accountId) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'accountId is required',
        example: '/api/transactions/full?accountId=acc_123&from=2026-01-01&to=2026-02-28'
      },
      { status: 400 }
    );
  }

  // ✅ Parse and validate dates
  const today = new Date();
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  const from = fromParam || formatDate(ninetyDaysAgo);
  const to = toParam || formatDate(today);

  // Validate date range
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid date format. Use YYYY-MM-DD',
        from,
        to
      },
      { status: 400 }
    );
  }

  if (fromDate > toDate) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'from date must be before to date'
      },
      { status: 400 }
    );
  }

  // ✅ Parse and validate pageSize
  let pageSize = 100;
  if (pageSizeParam) {
    const parsed = parseInt(pageSizeParam);
    if (parsed < 10 || parsed > 100) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'pageSize must be between 10 and 100'
        },
        { status: 400 }
      );
    }
    pageSize = parsed;
  }

  try {
    // ✅ Step 1: Get the account to retrieve the item_id
    const account = await accountsService.getAccountById(accountId);
    
    if (!account) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Account not found',
          accountId
        },
        { status: 404 }
      );
    }

    const itemId = account.item_id;

    console.log(`[/api/transactions/full] Processing account: ${accountId}, item: ${itemId}`);

    // ✅ Step 2: Fetch ALL transactions using automatic pagination
    const allTransactions = await fetchAllTransactions(
      itemId,
      from,
      to,
      pageSize
    );

    console.log(`[/api/transactions/full] Fetched ${allTransactions.length} transactions, upserting to database...`);

    // ✅ Step 3: Merge transactions in database (upsert to avoid duplicates by transaction_id)
    const savedTransactions = await transactionsService.upsertTransactions(
      allTransactions.map(tx => ({
        ...tx,
        account_id: accountId,
      }))
    );

    console.log(`[/api/transactions/full] Successfully upserted ${savedTransactions.length} transactions`);

    // ✅ Step 4: Return all transactions
    return NextResponse.json({
      success: true,
      data: {
        results: allTransactions,
        totalRecords: allTransactions.length,
        dateRange: {
          from,
          to,
        },
        metadata: {
          itemId,
          accountId,
          pageSize,
          fetchedAt: new Date().toISOString(),
        },
      },
    });

  } catch (error) {
    console.error('[/api/transactions/full] Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch all transactions',
        accountId,
        from,
        to,
      },
      { status: 500 }
    );
  }
}

export const GET = withErrorHandling(handleFullTransactions);

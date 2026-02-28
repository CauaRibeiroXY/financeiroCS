/**
 * QUICK START GUIDE: Pluggy Transactions Pagination
 * 
 * Copy-paste examples to get started immediately
 */

// ============================================================================
// 1️⃣  BACKEND: Fetch all transactions with automatic pagination
// ============================================================================

// In your API route or service:
import { fetchAllTransactions } from '@/app/lib/utils/fetch-all-transactions';
import { transactionsService } from '@/app/lib/services/transactions';

async function syncAllTransactionsExample() {
  try {
    // Fetch ALL transactions automatically (handles pagination internally)
    const allTransactions = await fetchAllTransactions(
      'item_123',           // Pluggy Item ID
      '2026-01-01',         // Start date
      '2026-02-28',         // End date
      100                   // Page size (keep at 100)
    );

    console.log(`✅ Fetched ${allTransactions.length} transactions`);

    // Save to database (upsert prevents duplicates)
    const saved = await transactionsService.upsertTransactions(allTransactions);
    console.log(`✅ Saved ${saved.length} transactions to database`);

    return saved;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// ============================================================================
// 2️⃣  FRONTEND: Call the new endpoint from React/Next.js
// ============================================================================

// Option A: Using the hook (RECOMMENDED)
import { useAllTransactions } from '@/app/hooks/useAllTransactions';

function MyComponent() {
  const { transactions, totalRecords, isLoading, refetch } = useAllTransactions(
    'acc_123',              // Account ID
    '2026-01-01',           // From date (optional)
    '2026-02-28',           // To date (optional)
    {
      pageSize: 100,        // Optional: default is 100
      onSuccess: (data) => {
        console.log(`✅ Fetched ${data.data.totalRecords} transactions`);
      },
      onError: (error) => {
        console.error('❌ Error:', error);
      },
    }
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Transactions: {totalRecords}</h1>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.transaction_id}>
            {tx.date} - {tx.description} - {tx.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Option B: Direct fetch (for service workers, background jobs, etc)
async function directFetchExample() {
  const response = await fetch(
    '/api/transactions/full?accountId=acc_123&from=2026-01-01&to=2026-02-28'
  );

  const data = await response.json();

  if (data.success) {
    console.log(`✅ Got ${data.data.totalRecords} transactions`);
    // data.data.results contains all transactions
  } else {
    console.error('❌ Error:', data.error);
  }
}

// ============================================================================
// 3️⃣  USE THE EXAMPLE COMPONENT
// ============================================================================

// In your page.tsx:
import { AllTransactionsExample } from '@/app/components/transactions/AllTransactionsExample';

export default function TransactionsPage() {
  return (
    <AllTransactionsExample
      accountId="acc_123"
      initialFrom="2026-01-01"
      initialTo="2026-02-28"
    />
  );
}

// ============================================================================
// 4️⃣  CURL EXAMPLES
// ============================================================================

/*
# Get all transactions for an account
curl "http://localhost:3000/api/transactions/full?accountId=acc_123"

# Specify date range
curl "http://localhost:3000/api/transactions/full?accountId=acc_123&from=2026-01-01&to=2026-02-28"

# Custom page size
curl "http://localhost:3000/api/transactions/full?accountId=acc_123&pageSize=50"

# All parameters
curl "http://localhost:3000/api/transactions/full?accountId=acc_123&from=2026-01-01&to=2026-02-28&pageSize=100"
*/

// ============================================================================
// 5️⃣  ERROR HANDLING EXAMPLES
// ============================================================================

function ErrorHandlingExample() {
  const { transactions, isError, error, refetch } = useAllTransactions('acc_123');

  if (isError) {
    if (error?.message?.includes('Account not found')) {
      return <div>Account does not exist. Check the account ID.</div>;
    }

    if (error?.message?.includes('Invalid date format')) {
      return <div>Date format must be YYYY-MM-DD</div>;
    }

    return (
      <div>
        <p>Error loading transactions: {error?.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  return <div>{transactions.length} transactions loaded</div>;
}

// ============================================================================
// 6️⃣  ADVANCED: Manual pagination control (if needed)
// ============================================================================

// Use the original endpoint for manual pagination:
function ManualPaginationExample() {
  const { transactions, totalPages, currentPage } = useTransactions(
    'acc_123',
    currentPage,  // You control this
    100
  );

  // This gives you control but requires manual page-by-page handling
  // For automatic pagination, use useAllTransactions instead
}

// ============================================================================
// 7️⃣  DATABASE: Understanding the upsert
// ============================================================================

/*
The endpoint automatically saves transactions using this logic:

1. Fetch all pages from Pluggy API
2. Upsert to database with:
   - Key: transaction_id (Pluggy's unique ID)
   - Action: INSERT if new, UPDATE if exists
   - Result: No duplicate transactions

Why this works:
- transaction_id is globally unique at Pluggy
- Safe to fetch multiple times (idempotent)
- Merges data across multiple calls
- Prevents stale transactions from being lost
*/

// ============================================================================
// 8️⃣  TESTING: Quick test examples
// ============================================================================

// Test the endpoint
async function testEndpoint() {
  try {
    const response = await fetch(
      '/api/transactions/full?accountId=test_acc&from=2026-01-01&to=2026-02-28'
    );
    const json = await response.json();

    if (response.ok) {
      console.log('✅ Success:', json.data.totalRecords, 'transactions');
    } else {
      console.log('❌ Error:', json.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// ============================================================================
// 9️⃣  TROUBLESHOOTING
// ============================================================================

/*
❌ "Account not found"
→ Verify account_id exists in your database
→ Check account.item_id is populated

❌ "Invalid date format"
→ Use YYYY-MM-DD format only
→ Example: 2026-02-28 (not 28/02/2026)

❌ "pageSize must be between 10 and 100"
→ Keep pageSize at 100 for best performance
→ Don't go below 10 or above 100

❌ No transactions returned
→ Check date range: from must be ≤ to
→ Verify account has transactions in that period
→ Check Pluggy connection status

❌ Duplicate transactions
→ Already prevented by transaction_id upsert
→ Safe to call endpoint multiple times
*/

// ============================================================================
// 🔟  FILE LOCATIONS
// ============================================================================

/*
📍 Utility function:
   src/app/lib/utils/fetch-all-transactions.ts

📍 API Endpoint:
   src/app/api/transactions/full/route.ts

📍 React Hook:
   src/app/hooks/useAllTransactions.ts

📍 Example Component:
   src/app/components/transactions/AllTransactionsExample.tsx

📍 Documentation:
   TRANSACTIONS_PAGINATION.md

📍 Tests:
   src/app/lib/services/__tests__/transactions.pagination.test.ts
*/

export default {};

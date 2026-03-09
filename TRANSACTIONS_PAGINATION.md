# 📋 Pluggy Transactions Pagination Implementation

Complete implementation of Pluggy's official pagination algorithm for fetching all transactions with automatic page handling.

## ✅ What's Implemented

### 1. **Utility Function: `fetchAllTransactions`**
📍 Location: [`src/app/lib/utils/fetch-all-transactions.ts`](../../lib/utils/fetch-all-transactions.ts)

Automatically handles pagination following Pluggy's official algorithm:
- Fetches all transactions page by page
- Uses `response.nextPage` to navigate
- Checks `response.hasNextPage` to know when to stop
- Merges all results into a single array
- Comprehensive error logging

```typescript
import { fetchAllTransactions } from '@/app/lib/utils/fetch-all-transactions';

const allTransactions = await fetchAllTransactions(
  itemId,
  '2026-01-01',
  '2026-02-28',
  100 // pageSize
);
```

### 2. **API Endpoint: `GET /api/transactions/full`**
📍 Location: [`src/app/api/transactions/full/route.ts`](../../api/transactions/full/route.ts)

Provides automatic pagination via HTTP endpoint:

```bash
GET /api/transactions/full?accountId=acc_123&from=2026-01-01&to=2026-02-28&pageSize=100
```

**Query Parameters:**
- `accountId` (required): Account ID to fetch transactions for
- `from` (optional): Start date (YYYY-MM-DD). Default: 90 days ago
- `to` (optional): End date (YYYY-MM-DD). Default: today
- `pageSize` (optional): Records per page. Min 10, Max 100. Default: 100

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "transaction_id": "txn_123",
        "account_id": "acc_123",
        "date": "2026-02-28",
        "description": "Purchase at Store",
        "amount": -150.50,
        "type": "DEBIT",
        "status": "POSTED"
      }
      // ... all transactions across all pages
    ],
    "totalRecords": 420,
    "dateRange": {
      "from": "2026-01-01",
      "to": "2026-02-28"
    },
    "metadata": {
      "itemId": "item_123",
      "accountId": "acc_123",
      "pageSize": 100,
      "fetchedAt": "2026-02-28T15:30:00Z"
    }
  }
}
```

### 3. **React Hook: `useAllTransactions`**
📍 Location: [`src/hooks/useAllTransactions.ts`](../../hooks/useAllTransactions.ts)

Client-side hook for fetching all transactions:

```typescript
import { useAllTransactions } from '@/app/hooks/useAllTransactions';

export function MyComponent() {
  const {
    transactions,        // TransactionRecord[]
    totalRecords,        // number
    dateRange,          // { from, to }
    metadata,           // { itemId, accountId, pageSize, fetchedAt }
    isLoading,          // boolean
    isError,            // boolean
    error,              // Error | undefined
    refetch,            // () => void
  } = useAllTransactions(
    'acc_123',
    '2026-01-01',
    '2026-02-28',
    {
      pageSize: 100,
      onSuccess: (data) => console.log('Done!'),
      onError: (error) => console.error('Error:', error),
    }
  );

  return (
    <div>
      <p>Total: {totalRecords} transactions</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### 4. **Example Component: `AllTransactionsExample`**
📍 Location: [`src/app/components/transactions/AllTransactionsExample.tsx`](../../components/transactions/AllTransactionsExample.tsx)

Complete working example with:
- Sorting by date or amount
- Error handling
- Loading states
- Refresh functionality
- Table display

```typescript
import { AllTransactionsExample } from '@/app/components/transactions/AllTransactionsExample';

export default function Page() {
  return (
    <AllTransactionsExample
      accountId="acc_123"
      initialFrom="2026-01-01"
      initialTo="2026-02-28"
    />
  );
}
```

---

## 🔄 How the Pagination Works

### Official Pluggy Algorithm

The endpoint and utility implement Pluggy's recommended approach:

```javascript
while (response.hasNextPage || response.nextPage) {
  GET /api/transactions?...&page=${nextPage}
  merge results[]
  nextPage = response.nextPage
}
```

### Step by Step

1. **First Request** (page 1)
   ```
   GET /transactions?itemId=item_123&from=2026-01-01&to=2026-02-28&page=1&pageSize=100
   Returns: 100 transactions + { nextPage: 2, hasNextPage: true }
   ```

2. **Next Requests** (pages 2, 3, ...)
   ```
   GET /transactions?itemId=item_123&from=2026-01-01&to=2026-02-28&page=2&pageSize=100
   Returns: 100 transactions + { nextPage: 3, hasNextPage: true }
   ```

3. **Last Request**
   ```
   GET /transactions?itemId=item_123&from=2026-01-01&to=2026-02-28&page=5&pageSize=100
   Returns: 20 transactions + { nextPage: undefined, hasNextPage: false }
   ```

4. **Result** = 520 total transactions merged into single array

---

## 💾 Database Integration

### Upsert Strategy (Avoid Duplicates)

The `/api/transactions/full` endpoint automatically saves transactions using upsert:

```typescript
await transactionsService.upsertTransactions(
  allTransactions.map(tx => ({
    ...tx,
    account_id: accountId,
  }))
);
```

**Conflict Resolution:**
- **Key:** `transaction_id` (Pluggy's unique identifier)
- **Strategy:** Update if exists, insert if new
- **Result:** No duplicate transactions even if fetched multiple times

### Database Schema Expected

```typescript
interface TransactionRecord {
  id?: string;                          // Optional UUID
  transaction_id: string;               // PRIMARY KEY (Pluggy ID)
  account_id: string;                   // Foreign Key
  date: string;                         // YYYY-MM-DD
  description: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  status?: 'POSTED' | 'PENDING';
  created_at?: string;
  updated_at?: string;
  // ... other fields
}
```

---

## 📊 Usage Examples

### Backend: Fetch and Save All Transactions

```typescript
// In a service or API handler
import { fetchAllTransactions } from '@/app/lib/utils/fetch-all-transactions';
import { transactionsService } from '@/app/lib/services/transactions';

async function syncAllTransactions(itemId: string) {
  const transactions = await fetchAllTransactions(
    itemId,
    '2026-01-01',
    '2026-02-28'
  );

  const saved = await transactionsService.upsertTransactions(transactions);
  return saved;
}
```

### Frontend: Display All Transactions in React Component

```typescript
'use client';

import { useAllTransactions } from '@/app/hooks/useAllTransactions';

export function TransactionsDashboard({ accountId }: { accountId: string }) {
  const { transactions, totalRecords, isLoading, refetch } = useAllTransactions(
    accountId,
    '2026-01-01',
    '2026-02-28'
  );

  if (isLoading) return <div>Loading {totalRecords} transactions...</div>;

  return (
    <div>
      <h1>All Transactions ({totalRecords})</h1>
      <button onClick={() => refetch()}>Refresh</button>
      {/* Render transactions */}
    </div>
  );
}
```

### Direct HTTP Request

```bash
# Fetch all transactions for a specific account
curl "http://localhost:3000/api/transactions/full?accountId=acc_123&from=2026-01-01&to=2026-02-28"

# With custom page size
curl "http://localhost:3000/api/transactions/full?accountId=acc_123&pageSize=100"

# Last 30 days (automatic date range)
curl "http://localhost:3000/api/transactions/full?accountId=acc_123"
```

---

## ⚙️ Configuration

### API Limits

- **Default pageSize:** 100 (optimal recommended by Pluggy)
- **Min pageSize:** 10
- **Max pageSize:** 100
- **Max API timeout:** 5 minutes (300s)

### Date Range

- **Default from:** 90 days ago
- **Default to:** Today
- **Format:** YYYY-MM-DD only

---

## 🛠️ Troubleshooting

### "itemId not found"
- Verify account exists in database
- Check `account.item_id` is correctly populated
- Ensure Pluggy token is valid

### "No transactions returned"
- Check date range: `from` must be ≤ `to`
- Verify account has transactions in date range
- Check Pluggy connection status

### Slow performance
- Paginate manually instead of fetching all (use original `/api/transactions`)
- Reduce date range to limit results
- Check database indexing on `transaction_id` and `account_id`

### Duplicate transactions
- Already handled by upsert logic
- `transaction_id` is unique constraint
- Safe to call multiple times

---

## 📚 References

- **Pluggy Official Docs:** https://docs.pluggy.ai/docs/transactions#how-to-synchronize-and-merge-transactions
- **Pluggy Quickstart:** https://github.com/pluggyai/quickstart/tree/master/examples/vercel-quickdeploy-nextjs
- **Pluggy SDK:** https://www.npmjs.com/package/pluggy-sdk

---

## 📝 Files Created/Modified

```
✅ NEW:  src/app/lib/utils/fetch-all-transactions.ts     (Pagination utility)
✅ NEW:  src/app/api/transactions/full/route.ts          (New endpoint)
✅ NEW:  src/app/hooks/useAllTransactions.ts             (React hook)
✅ NEW:  src/app/components/transactions/AllTransactionsExample.tsx  (Example)
✅ NEW:  TRANSACTIONS_PAGINATION.md                      (This file)

⚙️ EXISTING (No changes needed):
   - src/app/lib/services/transactions.ts  (Already has upsertTransactions)
   - src/app/lib/services/accounts.ts      (Already has getAccountById)
```

---

## ✨ Key Features

✅ **Automatic Pagination** - No manual page handling needed  
✅ **100% Response** - Fetches ALL matching transactions in one call  
✅ **Duplicate Prevention** - Upsert strategy prevents data duplication  
✅ **Type-Safe** - Full TypeScript support  
✅ **Error Handling** - Comprehensive logging and error messages  
✅ **Date Range Support** - Flexible from/to parameters  
✅ **React Integration** - Easy-to-use SWR-based hook  
✅ **Official Algorithm** - Follows Pluggy's documented approach  

---

**Last Updated:** February 28, 2026

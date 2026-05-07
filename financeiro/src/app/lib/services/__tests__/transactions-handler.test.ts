import { syncTransactionData, syncCreditCardBillData } from '../webhook-handlers/transactions-handler';
import { transactionsService } from '../transactions';
import { creditCardBillsService } from '../credit-card-bills';
import { getPluggyClient } from '../pluggy/client';
import type { Account, Transaction } from 'pluggy-sdk';

jest.mock('../transactions');
jest.mock('../credit-card-bills');
jest.mock('../pluggy/client');

const mockedPluggy = getPluggyClient() as any;

describe('transactions-handler sync helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const sampleTx: Transaction = {
    transaction_id: 'txn123',
    account_id: 'acc001',
    date: '2026-03-02',
    description: 'Test',
    amount: 100,
    type: 'CREDIT',
    status: 'POSTED',
  } as any;

  it('derives id from string and upserts', async () => {
    mockedPluggy.fetchAllTransactions.mockResolvedValue([sampleTx]);
    (transactionsService.upsertTransactions as jest.Mock).mockResolvedValue([]);

    await syncTransactionData('acc001');

    expect(mockedPluggy.fetchAllTransactions).toHaveBeenCalledWith('acc001');
    expect(transactionsService.upsertTransactions).toHaveBeenCalled();
  });

  it('accepts Account object and skips re-fetching', async () => {
    const accountObj = { id: 'acc002' } as Account;
    mockedPluggy.fetchAllTransactions.mockResolvedValue([sampleTx]);
    (transactionsService.upsertTransactions as jest.Mock).mockResolvedValue([]);

    await syncTransactionData(accountObj);

    expect(mockedPluggy.fetchAllTransactions).toHaveBeenCalledWith('acc002');
    expect(transactionsService.upsertTransactions).toHaveBeenCalled();
  });

  it('syncCreditCardBillData works with either form', async () => {
    mockedPluggy.fetchCreditCardBills.mockResolvedValue({ results: [] });
    (creditCardBillsService.upsertBills as jest.Mock).mockResolvedValue([]);

    await syncCreditCardBillData('accX');
    expect(mockedPluggy.fetchCreditCardBills).toHaveBeenCalledWith('accX');

    const accountObj = { id: 'accY' } as Account;
    await syncCreditCardBillData(accountObj);
    expect(mockedPluggy.fetchCreditCardBills).toHaveBeenCalledWith('accY');
  });
});

import { Account } from "pluggy-sdk";
import { AccountRecord } from "../../../types/pluggy";

export function mapAccountFromPluggyToDb(account: Account, itemId: string): Omit<AccountRecord, 'id'> {
  // Pluggy SDK Account might have an undocumented `imageUrl` or `connector?.imageUrl` 
  const rawAcc = account as unknown as Record<string, unknown>;
  const rawConnector = rawAcc.connector as Record<string, unknown> | undefined;
  const imageUrlRaw = rawAcc.imageUrl || rawConnector?.imageUrl;

  return {
    item_id: itemId,
    account_id: String(account.id),
    type: account.type,
    subtype: account.subtype,
    number: account.number,
    name: account.name,
    marketing_name: account.marketingName || undefined,
    balance: account.balance,
    currency_code: account.currencyCode,
    owner: account.owner || undefined,
    tax_number: account.taxNumber || undefined,
    bank_data: account.bankData as AccountRecord['bank_data'] || undefined,
    
    // Mapeamento explícito tratando os 'null' da Pluggy para 'undefined'
    credit_data: account.creditData ? {
      level: account.creditData.level ?? undefined,
      brand: account.creditData.brand ?? undefined,
      balance_close_date: account.creditData.balanceCloseDate instanceof Date 
        ? account.creditData.balanceCloseDate.toISOString() 
        : (account.creditData.balanceCloseDate ?? undefined),
      balance_due_date: account.creditData.balanceDueDate instanceof Date 
        ? account.creditData.balanceDueDate.toISOString() 
        : (account.creditData.balanceDueDate ?? undefined),
      available_credit_limit: account.creditData.availableCreditLimit ?? undefined,
      balance_foreign_currency: account.creditData.balanceForeignCurrency ?? undefined,
      minimum_payment: account.creditData.minimumPayment ?? undefined,
      credit_limit: account.creditData.creditLimit ?? undefined,
    } : undefined,
    
    disaggregated_credit_limits: undefined,
    icon_url: typeof imageUrlRaw === 'string' ? imageUrlRaw : undefined,
  };
}
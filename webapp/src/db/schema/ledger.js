// ledger_account, journal_entry, journal_line, expense
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  decimal, 
  pgEnum 
} from 'drizzle-orm/pg-core';
import { businesses } from './business.js';
import { users } from './identity.js';
import { paymentMethodEnum } from './sales.js'; // Importing shared payment methods
import { generateId, foreignBusinessId, timestamps } from './helpers.js';

export const accountTypeEnum = pgEnum('account_type', ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']);
export const ledgerStatusEnum = pgEnum('ledger_status', ['ACTIVE', 'INACTIVE']);

export const ledgerAccounts = pgTable('ledger_account', {
  id: generateId(),
  businessId: foreignBusinessId(businesses),
  accountCode: varchar('account_code', { length: 20 }).notNull(),
  accountName: varchar('account_name', { length: 150 }).notNull(),
  accountType: accountTypeEnum('account_type').notNull(),
  // Self-referencing foreign key for nested accounts
  parentAccountId: uuid('parent_account_id'), 
  status: ledgerStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamps.createdAt,
});

export const journalEntries = pgTable('journal_entry', {
  id: generateId(),
  businessId: foreignBusinessId(businesses),
  entryNumber: varchar('entry_number', { length: 50 }).notNull(),
  referenceType: varchar('reference_type', { length: 30 }),
  referenceId: uuid('reference_id'),
  entryDate: timestamp('entry_date', { withTimezone: true }).notNull(),
  description: text('description'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamps.createdAt,
});

export const journalLines = pgTable('journal_line', {
  id: generateId(),
  journalEntryId: uuid('journal_entry_id').notNull().references(() => journalEntries.id),
  ledgerAccountId: uuid('ledger_account_id').notNull().references(() => ledgerAccounts.id),
  debitAmount: decimal('debit_amount', { precision: 18, scale: 2 }).notNull().default('0'),
  creditAmount: decimal('credit_amount', { precision: 18, scale: 2 }).notNull().default('0'),
});

export const expenses = pgTable('expense', {
  id: generateId(),
  businessId: foreignBusinessId(businesses),
  expenseDate: timestamp('expense_date', { withTimezone: true }).notNull(),
  ledgerAccountId: uuid('ledger_account_id').notNull().references(() => ledgerAccounts.id),
  amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  remarks: text('remarks'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamps.createdAt,
});
import type { TransactionFlow, TransactionStatus, TransactionType } from '../types/enums.js';
import type {
  PaginatedResponse,
  Transaction,
  ShowTransactionResponse,
} from '../types/responses.js';
import type { RequestOptions } from '../http.js';
import { validateUuid } from '../errors.js';
import { validatePerPage, validateCreatedBetween } from '../validation.js';
import { BaseResource } from './base.js';

export interface ListAllTransactionsOptions {
  type?: TransactionType;
  flow?: TransactionFlow;
  status?: TransactionStatus;
  createdBetween?: string;
  cursor?: string;
  perPage?: number;
}

export class AllTransactions extends BaseResource {
  async list(
    options?: ListAllTransactionsOptions,
    requestOptions?: RequestOptions,
  ): Promise<PaginatedResponse<Transaction>> {
    if (options?.perPage !== undefined) validatePerPage(options.perPage);
    if (options?.createdBetween !== undefined) validateCreatedBetween(options.createdBetween);
    return this.http.get<PaginatedResponse<Transaction>>(
      '/v2/all-transactions',
      {
        'filter[type]': options?.type,
        'filter[flow]': options?.flow,
        'filter[status]': options?.status,
        'filter[created_between]': options?.createdBetween,
        cursor: options?.cursor,
        per_page: options?.perPage?.toString(),
      },
      requestOptions,
    );
  }

  async *listAll(
    options?: Omit<ListAllTransactionsOptions, 'cursor'>,
    requestOptions?: RequestOptions,
  ): AsyncGenerator<Transaction> {
    let cursor: string | undefined;

    do {
      const page = await this.list({ ...options, cursor }, requestOptions);

      for (const item of page.items) {
        yield item;
      }

      cursor = page.nextCursor ?? undefined;
    } while (cursor);
  }

  async get(
    procurosTransactionId: string,
    requestOptions?: RequestOptions,
  ): Promise<Transaction> {
    validateUuid(procurosTransactionId, 'procurosTransactionId');
    const response = await this.http.get<ShowTransactionResponse>(
      `/v2/all-transactions/${procurosTransactionId}`,
      undefined,
      requestOptions,
    );
    return response.data;
  }
}

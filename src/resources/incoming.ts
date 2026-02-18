import type { TransactionType } from '../types/enums.js';
import type { MarkProcessedRequest, BulkMarkProcessedItem } from '../types/requests.js';
import type {
  PaginatedResponse,
  ReceivedTransaction,
  MarkProcessedResponse,
  BulkMarkProcessedResponse,
} from '../types/responses.js';
import type { RequestOptions } from '../http.js';
import { validateUuid } from '../errors.js';
import { validatePerPage, validateBulkSize } from '../validation.js';
import { BaseResource } from './base.js';

export interface ListIncomingOptions {
  type?: TransactionType;
  cursor?: string;
  perPage?: number;
}

export class IncomingTransactions extends BaseResource {
  async list(
    options?: ListIncomingOptions,
    requestOptions?: RequestOptions,
  ): Promise<PaginatedResponse<ReceivedTransaction>> {
    if (options?.perPage !== undefined) validatePerPage(options.perPage);
    return this.http.get<PaginatedResponse<ReceivedTransaction>>(
      '/v2/transactions',
      {
        'filter[type]': options?.type,
        cursor: options?.cursor,
        per_page: options?.perPage?.toString(),
      },
      requestOptions,
    );
  }

  async *listAll(
    options?: Omit<ListIncomingOptions, 'cursor'>,
    requestOptions?: RequestOptions,
  ): AsyncGenerator<ReceivedTransaction> {
    let cursor: string | undefined;

    do {
      const page = await this.list({ ...options, cursor }, requestOptions);

      for (const item of page.items) {
        yield item;
      }

      cursor = page.nextCursor ?? undefined;
    } while (cursor);
  }

  async markProcessed(
    procurosTransactionId: string,
    request: MarkProcessedRequest,
    requestOptions?: RequestOptions,
  ): Promise<MarkProcessedResponse> {
    validateUuid(procurosTransactionId, 'procurosTransactionId');
    return this.http.put<MarkProcessedResponse>(
      `/v2/transactions/${procurosTransactionId}`,
      request,
      requestOptions,
    );
  }

  async bulkMarkProcessed(
    items: BulkMarkProcessedItem[],
    requestOptions?: RequestOptions,
  ): Promise<BulkMarkProcessedResponse> {
    validateBulkSize(items.length);
    return this.http.post<BulkMarkProcessedResponse>(
      '/v2/transactions/bulk/mark-processed',
      { items },
      requestOptions,
    );
  }
}

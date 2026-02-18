import type { SentTransaction, ReportErrorRequest } from '../types/requests.js';
import type { ReportErrorResponse, SendTransactionResponse } from '../types/responses.js';
import type { RequestOptions } from '../http.js';
import { BaseResource } from './base.js';

export class OutgoingTransactions extends BaseResource {
  async send(
    transaction: SentTransaction,
    requestOptions?: RequestOptions,
  ): Promise<SendTransactionResponse> {
    return this.http.post<SendTransactionResponse>('/v2/transactions', transaction, requestOptions);
  }

  async reportError(
    request: ReportErrorRequest,
    requestOptions?: RequestOptions,
  ): Promise<ReportErrorResponse> {
    return this.http.post<ReportErrorResponse>(
      '/v2/errors',
      request,
      requestOptions,
    );
  }
}

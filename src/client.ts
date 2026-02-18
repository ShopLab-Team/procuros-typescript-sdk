import { HttpClient } from './http.js';
import { ProcurosError } from './errors.js';
import { IncomingTransactions } from './resources/incoming.js';
import { OutgoingTransactions } from './resources/outgoing.js';
import { AllTransactions } from './resources/transactions.js';
import { Misc } from './resources/misc.js';
import type { RequestOptions } from './http.js';

const BASE_URLS = {
  production: 'https://api.procuros.io',
  staging: 'https://api.procuros-staging.io',
} as const;

export type Environment = keyof typeof BASE_URLS;

export interface ProcurosClientOptions {
  apiToken: string;
  environment?: Environment;
  timeout?: number;
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryOnPost?: boolean;
  fetch?: typeof globalThis.fetch;
}

export class ProcurosClient {
  readonly incoming: IncomingTransactions;
  readonly outgoing: OutgoingTransactions;
  readonly transactions: AllTransactions;

  private readonly misc: Misc;

  constructor(options: ProcurosClientOptions) {
    if (!options.apiToken) {
      throw new ProcurosError('apiToken is required');
    }

    const environment = options.environment ?? 'production';

    const http = new HttpClient({
      baseUrl: BASE_URLS[environment],
      apiToken: options.apiToken,
      timeout: options.timeout ?? 30_000,
      maxRetries: options.maxRetries ?? 2,
      baseDelay: options.baseDelay ?? 500,
      maxDelay: options.maxDelay ?? 10_000,
      retryOnPost: options.retryOnPost ?? false,
      fetch: options.fetch ?? globalThis.fetch.bind(globalThis),
    });

    this.incoming = new IncomingTransactions(http);
    this.outgoing = new OutgoingTransactions(http);
    this.transactions = new AllTransactions(http);
    this.misc = new Misc(http);
  }

  async ping(requestOptions?: RequestOptions): Promise<void> {
    await this.misc.ping(requestOptions);
  }
}

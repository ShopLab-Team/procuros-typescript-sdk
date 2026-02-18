import type { RequestOptions } from '../http.js';
import { BaseResource } from './base.js';

export class Misc extends BaseResource {
  async ping(requestOptions?: RequestOptions): Promise<void> {
    await this.http.getVoid('/v2/ping', requestOptions);
  }
}

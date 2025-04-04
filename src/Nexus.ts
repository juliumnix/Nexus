import { ApiServiceConnector } from './ApiServiceConnector';
import { ApiRequestFormat } from './types/ApiServiceConnectorTypes';

export class Nexus {
  static instanciate<TAdapter extends ApiRequestFormat>(
    adapter: TAdapter
  ): ApiServiceConnector<TAdapter> {
    return ApiServiceConnector.createOrRetrieve(adapter);
  }
}
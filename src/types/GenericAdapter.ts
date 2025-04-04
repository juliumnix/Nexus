export interface GenericAdapter {
  client: any;
  executeRequest: <T>(config: any) => Promise<T>;
}

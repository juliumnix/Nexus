/**
 * Interface para o adaptador tRPC
 * Usa tipo genérico para o cliente tRPC com tipagem manual
 */
export interface TRPCAdapter<TRouter = any> {
  trpcClient: TRouter;
  baseUrl: string;
}

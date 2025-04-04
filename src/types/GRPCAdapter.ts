import * as grpc from '@grpc/grpc-js';
// TODO: Add types for grpc
export interface GRPCAdapter {
  grpcClient: grpc.Client;
  serviceName: string;
}

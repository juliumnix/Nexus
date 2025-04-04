import * as grpc from '@grpc/grpc-js';

export interface GRPCAdapter {
  grpcClient: grpc.Client;
  serviceName: string;
}

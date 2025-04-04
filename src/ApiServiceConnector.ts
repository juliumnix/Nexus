import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { AxiosResponse } from 'axios';

import {
  ApiRequestConfig,
  ApiRequestFormat,
  ClientProtocol,
  GenericOperationConfig,
  GraphQLOperationConfig,
  GRPCOperationConfig,
  HttpRequestConfig,
  TRPCOperationConfig,
} from './types/ApiServiceConnectorTypes';
import { GenericAdapter } from './types/GenericAdapter';
import { GraphQLAdapter } from './types/GraphQLAdapter';
import { GRPCAdapter } from './types/GRPCAdapter';
import { RESTAdapter } from './types/RESTAdapter';
import { TRPCAdapter } from './types/TRPCAdapter';

const PROTOCOL_DETECTORS: Record<
  ClientProtocol,
  (adapter: ApiRequestFormat) => boolean
> = {
  REST: adapter => 'axiosInstance' in adapter,
  GraphQL: adapter => 'apolloClient' in adapter,
  gRPC: adapter => 'grpcClient' in adapter && 'serviceName' in adapter,
  tRPC: adapter => 'trpcClient' in adapter,
  Generic: adapter => 'client' in adapter && 'executeRequest' in adapter,
};

export class ApiServiceConnector<TAdapter extends ApiRequestFormat> {
  private static connectorRegistry = new Map<
    string,
    ApiServiceConnector<
      RESTAdapter | GraphQLAdapter | GRPCAdapter | TRPCAdapter | GenericAdapter
    >
  >();

  private constructor(
    readonly adapterClient: TAdapter,
    private readonly protocolType: ClientProtocol,
  ) {}

  static createOrRetrieve<TAdapter extends ApiRequestFormat>(
    adapter: TAdapter,
  ): ApiServiceConnector<TAdapter> {
    const protocol = Object.entries(PROTOCOL_DETECTORS).find(([_, detector]) =>
      detector(adapter),
    )?.[0] as ClientProtocol;

    if (!protocol) {
      throw new Error(
        'Tipo de adaptador não reconhecido. Nenhum detector de protocolo correspondente.',
      );
    }

    const registryKey = `${adapter.constructor.name}:${protocol}`;

    if (!this.connectorRegistry.has(registryKey)) {
      this.connectorRegistry.set(
        registryKey,
        new ApiServiceConnector(adapter, protocol),
      );
    }

    return this.connectorRegistry.get(
      registryKey,
    ) as ApiServiceConnector<TAdapter>;
  }

  applyAuthenticationToken(accessToken: string): void {
    if (this.protocolType !== 'REST') {
      throw new Error(
        'Autenticação via token disponível apenas para clientes REST',
      );
    }

    (
      this.adapterClient as RESTAdapter
    ).axiosInstance.defaults.headers.authorization = `Bearer ${accessToken}`;
  }

  getGraphQLClient(): ApolloClient<NormalizedCacheObject> {
    if (this.protocolType !== 'GraphQL') {
      throw new Error('Cliente GraphQL não disponível neste conector');
    }

    return (this.adapterClient as GraphQLAdapter).apolloClient;
  }

  request<TResponse>(
    this: ApiServiceConnector<RESTAdapter>,
    config: HttpRequestConfig,
  ): Promise<AxiosResponse<TResponse>>;

  request<TResponse>(
    this: ApiServiceConnector<GraphQLAdapter>,
    config: GraphQLOperationConfig,
  ): Promise<AxiosResponse<TResponse>>;

  request<TResponse>(
    this: ApiServiceConnector<GRPCAdapter>,
    config: GRPCOperationConfig,
  ): Promise<TResponse>;

  request<TResponse, TRouter = any>(
    this: ApiServiceConnector<TRPCAdapter<TRouter>>,
    config: TRPCOperationConfig,
  ): Promise<AxiosResponse<TResponse>>;

  request<TResponse>(
    this: ApiServiceConnector<GenericAdapter>,
    config: GenericOperationConfig,
  ): Promise<TResponse>;

  async request<TResponse>(
    config: ApiRequestConfig,
  ): Promise<AxiosResponse<TResponse> | TResponse> {
    if (this.protocolType === 'REST') {
      return this.executeHttpRequest(
        this.adapterClient as RESTAdapter,
        config as HttpRequestConfig,
      );
    }

    if (this.protocolType === 'GraphQL') {
      return this.executeGraphQLOperation(
        this.adapterClient as GraphQLAdapter,
        config as GraphQLOperationConfig,
      );
    }

    if (this.protocolType === 'gRPC') {
      return this.executeGRPCOperation(
        this.adapterClient as GRPCAdapter,
        config as GRPCOperationConfig,
      );
    }

    if (this.protocolType === 'tRPC') {
      return this.executeTRPCOperation<TResponse>(
        this.adapterClient as TRPCAdapter,
        config as TRPCOperationConfig,
      );
    }

    if (this.protocolType === 'Generic') {
      return this.executeGenericOperation(
        this.adapterClient as GenericAdapter,
        config as GenericOperationConfig,
      );
    }

    throw new Error(`Protocolo não suportado: ${this.protocolType}`);
  }

  private async executeHttpRequest<TResponse>(
    adapter: RESTAdapter,
    { url, method, data, params, headers }: HttpRequestConfig,
  ): Promise<AxiosResponse<TResponse>> {
    const { axiosInstance } = adapter;
    const originalHeaders = { ...axiosInstance.defaults.headers };

    try {
      if (headers) {
        Object.assign(axiosInstance.defaults.headers, headers);
      }

      const response = await axiosInstance.request<TResponse>({
        url,
        method,
        data,
        params,
      });

      return response;
    } catch (error: any) {
      if (error.isAxiosError && error.response) {
        return error.response as AxiosResponse<TResponse>;
      }
      throw new Error(`Falha na requisição HTTP: ${error.message || error}`);
    } finally {
      axiosInstance.defaults.headers = originalHeaders;
    }
  }

  private async executeGraphQLOperation<TResponse>(
    adapter: GraphQLAdapter,
    { query, variables, headers }: GraphQLOperationConfig,
  ): Promise<AxiosResponse<TResponse>> {
    const { apolloClient } = adapter;
    const gqlOperation =
      typeof query === 'string'
        ? gql`
            ${query}
          `
        : query;

    try {
      const { data } = await apolloClient.query<TResponse>({
        query: gqlOperation,
        variables,
        context: headers ? { headers } : undefined,
      });

      return {
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse<TResponse>;
    } catch (error: any) {
      throw new Error(`Falha na operação GraphQL: ${error.message || error}`);
    }
  }

  private async executeGRPCOperation<TResponse>(
    adapter: GRPCAdapter,
    { method, request, metadata }: GRPCOperationConfig,
  ): Promise<TResponse> {
    const { grpcClient, serviceName } = adapter;

    try {
      return new Promise((resolve, reject) => {
        if (!(method in grpcClient)) {
          reject(
            new Error(`Método ${method} não existe no serviço ${serviceName}`),
          );
          return;
        }

        (grpcClient as unknown as Record<string, Function>)[method](
          request,
          metadata || {},
          (error: Error | null, response: TResponse) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(response);
          },
        );
      });
    } catch (error: any) {
      throw new Error(`Falha na operação gRPC: ${error.message || error}`);
    }
  }

  private async executeTRPCOperation<TResponse, TRouter = any>(
    adapter: TRPCAdapter<TRouter>,
    { path, input, type = 'query' }: TRPCOperationConfig,
  ): Promise<AxiosResponse<TResponse>> {
    const { trpcClient } = adapter;

    console.log(`Executando operação tRPC: ${type} ${path}`, { input });

    try {
      const pathParts = path.split('.');

      // Navegação pelos caminhos do cliente tRPC
      let currentNode: any = trpcClient;

      // Construir o caminho para o procedimento
      for (const part of pathParts) {
        if (!currentNode || typeof currentNode !== 'object') {
          throw new Error(`Caminho inválido: ${path} (falha em '${part}')`);
        }

        if (!(part in currentNode)) {
          throw new Error(
            `Procedimento não encontrado: ${path} (falha em '${part}')`,
          );
        }

        currentNode = currentNode[part];
      }

      if (!currentNode) {
        throw new Error(`Procedimento não encontrado: ${path}`);
      }

      let result: TResponse;

      // Executar a operação apropriada
      if (type === 'query' && 'query' in currentNode) {
        result = await currentNode.query(input);
      } else if (type === 'mutation' && 'mutate' in currentNode) {
        result = await currentNode.mutate(input);
      } else if (typeof currentNode === 'function') {
        result = await currentNode(input);
      } else {
        // Fallback para chamada manual
        const url = `${adapter.baseUrl}/${path}`;
        console.log(`Tentativa de chamada direta para: ${url}`);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input,
            type,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        result = data.result?.data;
      }

      return {
        data: result,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
    } catch (error: unknown) {
      console.error('Erro na execução da operação tRPC:', error);

      // Fix the error handling
      const errorMessage =
        error instanceof Error ? error.message : 'Erro na operação tRPC';
      const errorCode = (error as any)?.code || 500;

      return {
        data: null as unknown as TResponse,
        status: errorCode,
        statusText: errorMessage,
        headers: {},
        config: {} as any,
      };
    }
  }

  private async executeGenericOperation<TResponse>(
    adapter: GenericAdapter,
    config: GenericOperationConfig,
  ): Promise<TResponse> {
    const { executeRequest } = adapter;

    try {
      return await executeRequest<TResponse>(config);
    } catch (error: any) {
      throw new Error(`Falha na operação genérica: ${error.message || error}`);
    }
  }
}

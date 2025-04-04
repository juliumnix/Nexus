import { DocumentNode } from '@apollo/client';
import { GenericAdapter } from './GenericAdapter';
import { GraphQLAdapter } from './GraphQLAdapter';
import { RESTAdapter } from './RESTAdapter';

export type ClientProtocol = 'REST' | 'GraphQL' | 'Generic';

export type HttpRequestConfig = {
  url: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  data?: any;
  params?: any;
  headers?: Record<string, string>;
};

export interface GRPCOperationConfig {
  method: string;
  request: any;
  metadata?: Record<string, any>;
}

export interface TRPCOperationConfig {
  /**
   * Caminho para o procedimento tRPC no formato 'namespace.procedimento'
   */
  path: string;

  /**
   * Dados de entrada para o procedimento tRPC
   */
  input?: any;

  /**
   * Tipo de operação tRPC a ser executada
   * @default "query"
   */
  type?: 'query' | 'mutation' | 'subscription';

  /**
   * Opções adicionais para a requisição
   */
  options?: {
    /**
     * Cabeçalhos HTTP adicionais
     */
    headers?: Record<string, string>;

    /**
     * Timeout em milissegundos
     */
    timeout?: number;
  };
}

export interface GenericOperationConfig {
  [key: string]: any;
}

export type GraphQLOperationConfig = {
  query: DocumentNode | string;
  variables?: any;
  headers?: Record<string, string>;
};

export type ApiRequestConfig =
  | HttpRequestConfig
  | GraphQLOperationConfig
  | GRPCOperationConfig
  | TRPCOperationConfig
  | GenericOperationConfig;

export type ApiRequestFormat =
  | RESTAdapter
  | GraphQLAdapter
  | GenericAdapter;

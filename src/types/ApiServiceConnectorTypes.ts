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
  | GenericOperationConfig;

export type ApiRequestFormat =
  | RESTAdapter
  | GraphQLAdapter
  | GenericAdapter;

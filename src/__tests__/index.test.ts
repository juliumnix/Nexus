import { Nexus } from '../Nexus';
import { ApiServiceConnector } from '../ApiServiceConnector';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import axios, { AxiosInstance } from 'axios';
import * as NexusExports from '../index';
import {
  ApiRequestConfig,
  ApiRequestFormat,
  ClientProtocol,
  GenericOperationConfig,
  GraphQLOperationConfig,
  HttpRequestConfig,
} from '../types/ApiServiceConnectorTypes';
import { RESTAdapter } from '../types/RESTAdapter';
import { GraphQLAdapter } from '../types/GraphQLAdapter';
import { GenericAdapter } from '../types/GenericAdapter';

jest.mock('axios');
jest.mock('@apollo/client');

describe('Nexus exports', () => {
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    mockAxiosInstance = {
      ...axios.create(),
      defaults: {
        headers: {
          common: {},
        },
      },
      request: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
  });

  it('should export Nexus class', () => {
    expect(NexusExports.Nexus).toBe(Nexus);
  });

  it('should export ApiServiceConnector class', () => {
    expect(NexusExports.ApiServiceConnector).toBe(ApiServiceConnector);
  });

  it('should export Apollo dependencies', () => {
    expect(NexusExports.ApolloClient).toBe(ApolloClient);
    expect(NexusExports.InMemoryCache).toBe(InMemoryCache);
  });

  it('should export adapter types', () => {
    const restAdapter: RESTAdapter = {
      axiosInstance: mockAxiosInstance,
    };
    const graphqlAdapter: GraphQLAdapter = {
      apolloClient: new ApolloClient({ uri: '', cache: new InMemoryCache() }),
    };
    const genericAdapter: GenericAdapter = {
      client: {},
      executeRequest: jest.fn(),
    };

    expect(typeof restAdapter).toBe('object');
    expect(typeof graphqlAdapter).toBe('object');
    expect(typeof genericAdapter).toBe('object');
  });

  it('should export request types', () => {
    const apiRequestConfig: ApiRequestConfig = {};
    const apiRequestFormat: ApiRequestFormat = {
      axiosInstance: mockAxiosInstance,
    };
    const clientProtocol: ClientProtocol = 'REST';
    const genericOperationConfig: GenericOperationConfig = {
      operation: 'test',
    };
    const graphqlOperationConfig: GraphQLOperationConfig = {
      query: '',
    };
    const httpRequestConfig: HttpRequestConfig = {
      url: '',
      method: 'GET',
    };

    expect(typeof apiRequestConfig).toBe('object');
    expect(typeof apiRequestFormat).toBe('object');
    expect(typeof clientProtocol).toBe('string');
    expect(typeof genericOperationConfig).toBe('object');
    expect(typeof graphqlOperationConfig).toBe('object');
    expect(typeof httpRequestConfig).toBe('object');
  });
}); 
import { ApiServiceConnector } from '../ApiServiceConnector';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { RESTAdapter } from '../types/RESTAdapter';
import { GraphQLAdapter } from '../types/GraphQLAdapter';
import { GenericAdapter } from '../types/GenericAdapter';

jest.mock('axios');
jest.mock('@apollo/client');

describe('ApiServiceConnector', () => {
  let restConnector: ApiServiceConnector<RESTAdapter>;
  let graphqlConnector: ApiServiceConnector<GraphQLAdapter>;
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;
  
  const mockRestConfig = {
    baseURL: 'http://test.com',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mockGraphqlConfig = {
    uri: 'http://test.com/graphql',
    cache: new InMemoryCache(),
  };

  beforeEach(() => {
    mockAxiosInstance = {
      ...axios.create(),
      defaults: {
        headers: {},
      },
      request: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    const restAdapter: RESTAdapter = {
      axiosInstance: mockAxiosInstance,
    };

    const graphqlAdapter: GraphQLAdapter = {
      apolloClient: new ApolloClient(mockGraphqlConfig),
    };

    // @ts-ignore - Ignorando o erro de construtor privado para fins de teste
    restConnector = new ApiServiceConnector(restAdapter, 'REST');
    // @ts-ignore - Ignorando o erro de construtor privado para fins de teste
    graphqlConnector = new ApiServiceConnector(graphqlAdapter, 'GraphQL');
    
    jest.clearAllMocks();
  });

  describe('Factory Method', () => {
    it('should create a REST connector', () => {
      const restAdapter: RESTAdapter = {
        axiosInstance: mockAxiosInstance,
      };

      const connector = ApiServiceConnector.createOrRetrieve(restAdapter);
      expect(connector).toBeInstanceOf(ApiServiceConnector);
    });

    it('should create a GraphQL connector', () => {
      const graphqlAdapter: GraphQLAdapter = {
        apolloClient: new ApolloClient(mockGraphqlConfig),
      };

      const connector = ApiServiceConnector.createOrRetrieve(graphqlAdapter);
      expect(connector).toBeInstanceOf(ApiServiceConnector);
    });

    it('should create a Generic connector', () => {
      const genericAdapter: GenericAdapter = {
        client: {},
        executeRequest: jest.fn(),
      };

      const connector = ApiServiceConnector.createOrRetrieve(genericAdapter);
      expect(connector).toBeInstanceOf(ApiServiceConnector);
    });

    it('should reuse existing connector instance', () => {
      const restAdapter: RESTAdapter = {
        axiosInstance: mockAxiosInstance,
      };

      const connector1 = ApiServiceConnector.createOrRetrieve(restAdapter);
      const connector2 = ApiServiceConnector.createOrRetrieve(restAdapter);

      expect(connector1).toBe(connector2);
    });

    it('should throw error for unrecognized adapter', () => {
      const invalidAdapter = {
        invalidField: 'test',
      };

      expect(() => {
        // @ts-ignore - Testando caso de erro com adaptador inválido
        ApiServiceConnector.createOrRetrieve(invalidAdapter);
      }).toThrow('Tipo de adaptador não reconhecido');
    });
  });

  describe('REST API', () => {
    it('should make a GET request', async () => {
      const mockResponse = { data: { id: 1, name: 'Test' } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const response = await restConnector.request({
        url: '/test',
        method: 'GET',
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        url: '/test',
        method: 'GET',
        data: undefined,
        params: undefined,
      });
      expect(response).toEqual(mockResponse);
    });

    it('should make a POST request', async () => {
      const mockData = { name: 'Test' };
      const mockResponse = { data: { id: 1, ...mockData } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const response = await restConnector.request({
        url: '/test',
        method: 'POST',
        data: mockData,
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        url: '/test',
        method: 'POST',
        data: mockData,
        params: undefined,
      });
      expect(response).toEqual(mockResponse);
    });

    it('should handle REST API errors', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { error: 'Bad Request' },
        },
      } as AxiosError;

      mockAxiosInstance.request.mockRejectedValue(mockError);

      const response = await restConnector.request({
        url: '/test',
        method: 'GET',
      });

      expect(response).toEqual(mockError.response);
    });

    it('should throw error for non-Axios errors', async () => {
      const mockError = new Error('Network error');
      mockAxiosInstance.request.mockRejectedValue(mockError);

      await expect(
        restConnector.request({
          url: '/test',
          method: 'GET',
        })
      ).rejects.toThrow('Falha na requisição HTTP: Network error');
    });

    it('should handle error without a message', async () => {
      const mockError = { isAxiosError: false };
      mockAxiosInstance.request.mockRejectedValue(mockError);

      await expect(
        restConnector.request({
          url: '/test',
          method: 'GET',
        })
      ).rejects.toThrow('Falha na requisição HTTP: [object Object]');
    });

    it('should apply authentication token', () => {
      const token = 'test-token';
      restConnector.applyAuthenticationToken(token);

      expect(mockAxiosInstance.defaults.headers.authorization).toBe(`Bearer ${token}`);
    });

    it('should handle request with headers', async () => {
      const mockResponse = { data: { id: 1, name: 'Test' } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const customHeaders = {
        'X-Custom-Header': 'test-value',
      };

      Object.assign(mockAxiosInstance.defaults.headers, customHeaders);

      await restConnector.request({
        url: '/test',
        method: 'GET',
        headers: customHeaders,
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        url: '/test',
        method: 'GET',
        data: undefined,
        params: undefined,
      });

      expect(mockAxiosInstance.defaults.headers).toEqual(customHeaders);
    });
  });

  describe('GraphQL', () => {
    it('should execute a query', async () => {
      const mockQuery = `
        query {
          test {
            id
            name
          }
        }
      `;
      const mockResponse = { data: { test: { id: 1, name: 'Test' } } };
      (ApolloClient.prototype.query as jest.Mock).mockResolvedValue(mockResponse);

      const response = await graphqlConnector.request({
        query: gql`${mockQuery}`,
      });

      expect(response).toEqual({
        data: mockResponse.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });
    });

    it('should handle string query', async () => {
      const mockQuery = `
        query {
          test {
            id
            name
          }
        }
      `;
      const mockResponse = { data: { test: { id: 1, name: 'Test' } } };
      (ApolloClient.prototype.query as jest.Mock).mockResolvedValue(mockResponse);

      const response = await graphqlConnector.request({
        query: mockQuery, // Pass as string instead of gql
      });

      expect(response).toEqual({
        data: mockResponse.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });
    });

    it('should execute a mutation', async () => {
      const mockMutation = `
        mutation {
          createTest(name: "Test") {
            id
            name
          }
        }
      `;
      const mockResponse = { data: { createTest: { id: 1, name: 'Test' } } };
      (ApolloClient.prototype.query as jest.Mock).mockResolvedValue(mockResponse);

      const response = await graphqlConnector.request({
        query: gql`${mockMutation}`,
      });

      expect(response).toEqual({
        data: mockResponse.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });
    });

    it('should handle GraphQL errors', async () => {
      const mockQuery = `
        query {
          test {
            id
            name
          }
        }
      `;
      const mockError = new Error('GraphQL error');
      (ApolloClient.prototype.query as jest.Mock).mockRejectedValue(mockError);

      await expect(
        graphqlConnector.request({
          query: gql`${mockQuery}`,
        })
      ).rejects.toThrow('Falha na operação GraphQL: GraphQL error');
    });

    it('should handle GraphQL errors without a message', async () => {
      const mockQuery = `
        query {
          test {
            id
            name
          }
        }
      `;
      const mockError = { /* Error object without a message property */ };
      (ApolloClient.prototype.query as jest.Mock).mockRejectedValue(mockError);

      await expect(
        graphqlConnector.request({
          query: gql`${mockQuery}`,
        })
      ).rejects.toThrow('Falha na operação GraphQL: [object Object]');
    });

    it('should get GraphQL client instance', () => {
      const client = graphqlConnector.getGraphQLClient();
      expect(client).toBeInstanceOf(ApolloClient);
    });

    it('should throw error when trying to get GraphQL client from REST connector', () => {
      expect(() => {
        restConnector.getGraphQLClient();
      }).toThrow('Cliente GraphQL não disponível neste conector');
    });

    it('should throw error when trying to apply token to GraphQL connector', () => {
      expect(() => {
        graphqlConnector.applyAuthenticationToken('test-token');
      }).toThrow('Autenticação via token disponível apenas para clientes REST');
    });

    it('should handle GraphQL operation with variables and headers', async () => {
      const mockQuery = `
        query TestQuery($id: ID!) {
          test(id: $id) {
            id
            name
          }
        }
      `;
      const mockVariables = { id: '123' };
      const mockHeaders = { 'X-Custom-Header': 'test-value' };
      const mockResponse = { data: { test: { id: '123', name: 'Test' } } };
      
      (ApolloClient.prototype.query as jest.Mock).mockResolvedValue(mockResponse);

      const response = await graphqlConnector.request({
        query: gql`${mockQuery}`,
        variables: mockVariables,
        headers: mockHeaders,
      });

      expect(ApolloClient.prototype.query).toHaveBeenCalledWith({
        query: gql`${mockQuery}`,
        variables: mockVariables,
        context: { headers: mockHeaders },
      });

      expect(response).toEqual({
        data: mockResponse.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });
    });
  });

  describe('Generic Adapter', () => {
    let genericConnector: ApiServiceConnector<GenericAdapter>;
    let mockExecuteRequest: jest.Mock;

    beforeEach(() => {
      mockExecuteRequest = jest.fn();
      const genericAdapter: GenericAdapter = {
        client: {},
        executeRequest: mockExecuteRequest,
      };

      // @ts-ignore - Ignorando o erro de construtor privado para fins de teste
      genericConnector = new ApiServiceConnector(genericAdapter, 'Generic');
    });

    it('should execute generic request', async () => {
      const mockConfig = {
        operation: 'test',
        params: { id: 1 },
      };
      const mockResponse = { result: 'success' };
      mockExecuteRequest.mockResolvedValue(mockResponse);

      const response = await genericConnector.request(mockConfig);

      expect(mockExecuteRequest).toHaveBeenCalledWith(mockConfig);
      expect(response).toEqual(mockResponse);
    });

    it('should handle generic operation error', async () => {
      const mockConfig = {
        operation: 'test',
        params: { id: 1 },
      };
      const mockError = new Error('Generic operation failed');
      mockExecuteRequest.mockRejectedValue(mockError);

      await expect(
        genericConnector.request(mockConfig)
      ).rejects.toThrow('Falha na operação genérica: Generic operation failed');
    });

    it('should handle generic operation error without a message', async () => {
      const mockConfig = {
        operation: 'test',
        params: { id: 1 },
      };
      const mockError = { /* Error object without a message property */ };
      mockExecuteRequest.mockRejectedValue(mockError);

      await expect(
        genericConnector.request(mockConfig)
      ).rejects.toThrow('Falha na operação genérica: [object Object]');
    });
  });

  describe('Edge Cases', () => {
    it('should throw error for unsupported protocol type', async () => {
      // Create connector with invalid protocol type
      // @ts-ignore - Creating connector with unsupported protocol for testing
      const invalidConnector = new ApiServiceConnector({}, 'UnsupportedProtocol');

      await expect(
        invalidConnector.request({})
      ).rejects.toThrow('Protocolo não suportado: UnsupportedProtocol');
    });
  });
}); 
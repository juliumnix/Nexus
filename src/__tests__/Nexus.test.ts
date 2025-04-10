import { Nexus } from '../Nexus';
import { ApiServiceConnector } from '../ApiServiceConnector';
import axios, { AxiosInstance } from 'axios';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { RESTAdapter } from '../types/RESTAdapter';
import { GraphQLAdapter } from '../types/GraphQLAdapter';
import { GenericAdapter } from '../types/GenericAdapter';

jest.mock('axios');
jest.mock('@apollo/client');

// Reset the connector registry before tests
beforeEach(() => {
  // @ts-ignore - Reset connectorRegistry for clean tests
  ApiServiceConnector.connectorRegistry = new Map();
});

describe('Nexus', () => {
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    mockAxiosInstance = {
      ...axios.create(),
      defaults: {
        headers: {
          common: {},
          authorization: undefined,
        },
      },
      request: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
    
    jest.clearAllMocks();
  });

  describe('Static Methods', () => {
    it('should instanciate a REST connector with a given adapter', () => {
      const restAdapter: RESTAdapter = {
        axiosInstance: mockAxiosInstance,
      };

      const connector = Nexus.instanciate(restAdapter);
      expect(connector).toBeInstanceOf(ApiServiceConnector);
      expect((connector as any).adapterClient).toBe(restAdapter);
      expect((connector as any).protocolType).toBe('REST');
    });

    it('should instanciate a GraphQL connector with a given adapter', () => {
      const apolloClient = new ApolloClient({
        uri: 'http://test.com/graphql',
        cache: new InMemoryCache(),
      });
      
      const graphqlAdapter: GraphQLAdapter = {
        apolloClient
      };

      const connector = Nexus.instanciate(graphqlAdapter);
      expect(connector).toBeInstanceOf(ApiServiceConnector);
      expect((connector as any).adapterClient).toBe(graphqlAdapter);
      expect((connector as any).protocolType).toBe('GraphQL');
    });

    it('should instanciate a Generic connector with a given adapter', () => {
      const mockExecuteRequest = jest.fn();
      const genericAdapter: GenericAdapter = {
        client: {},
        executeRequest: mockExecuteRequest,
      };

      const connector = Nexus.instanciate(genericAdapter);
      expect(connector).toBeInstanceOf(ApiServiceConnector);
      expect((connector as any).adapterClient).toBe(genericAdapter);
      expect((connector as any).protocolType).toBe('Generic');
    });
    
    it('should reuse existing connectors', () => {
      const restAdapter: RESTAdapter = {
        axiosInstance: mockAxiosInstance,
      };

      const connector1 = Nexus.instanciate(restAdapter);
      const connector2 = Nexus.instanciate(restAdapter);

      expect(connector1).toBe(connector2);
    });
    
    it('should throw error for unrecognized adapter', () => {
      const invalidAdapter = {
        invalidField: 'test',
      };

      expect(() => {
        // @ts-ignore - Testing error case with invalid adapter
        Nexus.instanciate(invalidAdapter);
      }).toThrow('Tipo de adaptador não reconhecido');
    });
  });
}); 
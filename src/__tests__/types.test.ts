import axios from 'axios';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import '../types/index';
import { ApiRequestConfig, ClientProtocol } from '../types/ApiServiceConnectorTypes';
import { RESTAdapter } from '../types/RESTAdapter';
import { GraphQLAdapter } from '../types/GraphQLAdapter';
import { GenericAdapter } from '../types/GenericAdapter';

describe('Type Exports', () => {
  it('should use all type definitions correctly', () => {

    const apiRequestConfig: ApiRequestConfig = {};
    expect(typeof apiRequestConfig).toBe('object');
    
    const clientProtocol: ClientProtocol = 'REST';
    expect(clientProtocol).toBe('REST');
    
    const restAdapter: RESTAdapter = {
      axiosInstance: axios.create()
    };
    expect(typeof restAdapter).toBe('object');
    
    const graphqlAdapter: GraphQLAdapter = {
      apolloClient: new ApolloClient({
        uri: 'http://test.com/graphql',
        cache: new InMemoryCache()
      })
    };
    expect(typeof graphqlAdapter.apolloClient).toBe('object');
    
    const executeRequest = jest.fn();
    const genericAdapter: GenericAdapter = {
      client: {},
      executeRequest
    };
    expect(typeof genericAdapter.executeRequest).toBe('function');
  });
}); 
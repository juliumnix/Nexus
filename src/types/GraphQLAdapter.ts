import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export interface GraphQLAdapter<TCacheShape = NormalizedCacheObject> {
  apolloClient: ApolloClient<TCacheShape>;
}
import { ApolloClient } from '@apollo/client';

export interface GraphQLAdapter {
  apolloClient: ApolloClient<any>;
}

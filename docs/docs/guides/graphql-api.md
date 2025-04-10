---
sidebar_position: 2
---

# Working with GraphQL APIs

This guide covers how to use Nexus to interact with GraphQL APIs using the GraphQL adapter.

## Setting Up a GraphQL Connector

To work with a GraphQL API, you first need to create a connector with the GraphQL adapter:

```typescript
import { Nexus, GraphQLAdapter, ApolloClient, InMemoryCache } from 'nexus';

// Create a GraphQL configuration
export class GraphQLConfig implements GraphQLAdapter {
  apolloClient = new ApolloClient({
    uri: 'https://api.example.com/graphql',
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only'
      }
    }
  });
}

// Instantiate a GraphQL connector
const apiConnector = Nexus.instanciate(new GraphQLConfig());
```

## Making GraphQL Queries

### Basic Query

```typescript
const getUsers = async () => {
  const response = await apiConnector.request({
    query: `
      query GetUsers {
        users {
          id
          name
          email
        }
      }
    `
  });
  
  return response.data.users;
};
```

### Query with Variables

```typescript
const getUserById = async (userId) => {
  const response = await apiConnector.request({
    query: `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
          posts {
            id
            title
          }
        }
      }
    `,
    variables: {
      id: userId
    }
  });
  
  return response.data.user;
};
```

## Making GraphQL Mutations

### Basic Mutation

```typescript
const createUser = async (userData) => {
  const response = await apiConnector.request({
    query: `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }
    `,
    variables: {
      input: userData
    }
  });
  
  return response.data.createUser;
};
```

### Mutation with Multiple Variables

```typescript
const updateUser = async (userId, userData) => {
  const response = await apiConnector.request({
    query: `
      mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
          id
          name
          email
          updatedAt
        }
      }
    `,
    variables: {
      id: userId,
      input: userData
    }
  });
  
  return response.data.updateUser;
};
```

## Using GraphQL Fragments

Fragments can help you reuse common fields across multiple queries:

```typescript
const userFragment = `
  fragment UserFields on User {
    id
    name
    email
    createdAt
    updatedAt
  }
`;

const getUsers = async () => {
  const response = await apiConnector.request({
    query: `
      ${userFragment}
      
      query GetUsers {
        users {
          ...UserFields
          posts {
            id
            title
          }
        }
      }
    `
  });
  
  return response.data.users;
};

const getUserById = async (userId) => {
  const response = await apiConnector.request({
    query: `
      ${userFragment}
      
      query GetUser($id: ID!) {
        user(id: $id) {
          ...UserFields
          posts {
            id
            title
          }
        }
      }
    `,
    variables: {
      id: userId
    }
  });
  
  return response.data.user;
};
```

## Authentication

### Configuring Authentication Headers

```typescript
import { Nexus, GraphQLAdapter, ApolloClient, InMemoryCache } from 'nexus';

// Create a GraphQL configuration with authentication headers
export class GraphQLConfig implements GraphQLAdapter {
  apolloClient = new ApolloClient({
    uri: 'https://api.example.com/graphql',
    cache: new InMemoryCache(),
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
}

// Instantiate the connector
const apiConnector = Nexus.instanciate(new GraphQLConfig());
```

For a more dynamic approach, you can use contextLink:

```typescript
import { Nexus, GraphQLAdapter, ApolloClient, InMemoryCache } from 'nexus';

export class GraphQLConfig implements GraphQLAdapter {
  apolloClient = new ApolloClient({
    uri: 'https://api.example.com/graphql',
    cache: new InMemoryCache(),
    contextLink: {
      getContext: () => {
        const token = localStorage.getItem('token');
        return {
          headers: {
            authorization: token ? `Bearer ${token}` : ''
          }
        };
      }
    }
  });
}

const apiConnector = Nexus.instanciate(new GraphQLConfig());
```

## Error Handling

Handling errors in GraphQL responses:

```typescript
try {
  const response = await apiConnector.request({
    query: `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
        }
      }
    `,
    variables: {
      id: 'invalid-id'
    }
  });
  
  // Successful response
  return response.data.user;
} catch (error) {
  // GraphQL errors
  if (error.graphQLErrors) {
    console.error('GraphQL Errors:', error.graphQLErrors);
  }
  
  // Network errors
  if (error.networkError) {
    console.error('Network Error:', error.networkError);
  }
  
  throw error;
}
```

## Advanced GraphQL Client Configuration

### Cache Policies

```typescript
import { Nexus, GraphQLAdapter, ApolloClient, InMemoryCache } from 'nexus';

export class GraphQLConfig implements GraphQLAdapter {
  apolloClient = new ApolloClient({
    uri: 'https://api.example.com/graphql',
    cache: new InMemoryCache({
      typePolicies: {
        User: {
          keyFields: ['id'],
          fields: {
            name: {
              read(name) {
                // Custom field read function
                return name ? name.toUpperCase() : null;
              }
            }
          }
        }
      }
    })
  });
}

const apiConnector = Nexus.instanciate(new GraphQLConfig());
```

### Using Links for Error Handling

```typescript
import { Nexus, GraphQLAdapter, ApolloClient, InMemoryCache } from 'nexus';

export class GraphQLConfig implements GraphQLAdapter {
  apolloClient = new ApolloClient({
    uri: 'https://api.example.com/graphql',
    cache: new InMemoryCache(),
    errorLink: {
      onError: ({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
          graphQLErrors.forEach(({ message, locations, path }) => {
            console.error(
              `[GraphQL Error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            );
          });
        }
        
        if (networkError) {
          console.error(`[Network Error]: ${networkError}`);
        }
      }
    }
  });
}

const apiConnector = Nexus.instanciate(new GraphQLConfig());
```

## Practical Examples

### Pagination with GraphQL

```typescript
const fetchPaginatedUsers = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  const response = await apiConnector.request({
    query: `
      query GetUsers($offset: Int!, $limit: Int!) {
        users(offset: $offset, limit: $limit) {
          data {
            id
            name
            email
          }
          paginationInfo {
            totalCount
            hasNextPage
          }
        }
      }
    `,
    variables: {
      offset,
      limit
    }
  });
  
  return {
    users: response.data.users.data,
    totalCount: response.data.users.paginationInfo.totalCount,
    hasNextPage: response.data.users.paginationInfo.hasNextPage,
    currentPage: page
  };
};
```

### File Upload with GraphQL

```typescript
const uploadFile = async (file) => {
  const response = await apiConnector.request({
    query: `
      mutation UploadFile($file: Upload!) {
        uploadFile(file: $file) {
          id
          url
          filename
          mimetype
        }
      }
    `,
    variables: {
      file: file
    }
  });
  
  return response.data.uploadFile;
};
```

### Subscription Example

To use GraphQL subscriptions, you'll need to configure your GraphQL client appropriately:

```typescript
import { Nexus, GraphQLAdapter, ApolloClient, InMemoryCache } from 'nexus';

// Configuration to support WebSocket subscriptions
export class GraphQLConfig implements GraphQLAdapter {
  apolloClient = new ApolloClient({
    uri: 'https://api.example.com/graphql',
    cache: new InMemoryCache(),
    subscriptionUri: 'wss://api.example.com/graphql',
    // Additional options for subscriptions
    subscriptionOptions: {
      reconnect: true,
      connectionParams: {
        authToken: localStorage.getItem('token')
      }
    }
  });
}

// Instantiate the connector
const apiConnector = Nexus.instanciate(new GraphQLConfig());

// Subscribe to new messages
const subscribeToNewMessages = () => {
  return apiConnector.subscribe({
    query: `
      subscription OnNewMessage {
        newMessage {
          id
          text
          createdAt
          sender {
            id
            name
          }
        }
      }
    `
  });
};

// Use the subscription
const messageSubscription = subscribeToNewMessages();
messageSubscription.subscribe({
  next: (result) => {
    console.log('New message received:', result.data.newMessage);
  },
  error: (error) => {
    console.error('Subscription error:', error);
  }
});

// When finished, don't forget to cancel the subscription
// messageSubscription.unsubscribe();
``` 
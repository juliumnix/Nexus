---
sidebar_position: 1
---

# Introduction to Nexus

Nexus is a powerful and flexible library that allows you to connect to any API service using a single interface, regardless of the underlying protocol or implementation details.

## What is Nexus?

Nexus provides a unified approach to interact with different types of APIs:

- **REST APIs** using axios
- **GraphQL APIs** using Apollo Client
- **Generic APIs** through custom adapters

With Nexus, you can switch between different API protocols without changing your application's core logic, creating a clean separation between your business logic and API communication details.

## Key Features

- **Protocol-agnostic interface** - Work with REST, GraphQL, or custom API protocols through a unified interface
- **Built-in adapters** - Ready-to-use adapters for common protocols
- **Type safety** - Full TypeScript support with proper type definitions
- **Authentication handling** - Simple API to manage authentication tokens
- **Extensibility** - Easy to extend with custom adapters for any API type

## When to Use Nexus

Nexus is ideal for:

- Applications that need to interact with multiple API services
- Projects that may need to switch API protocols in the future
- Teams looking to standardize API access patterns across their codebase
- Developers who want cleaner code with protocol-specific details abstracted away

## Quick Example

Here's a simple example of using Nexus with different API types:

```typescript
import { Nexus, RESTAdapter, GraphQLAdapter, NexusAxios, ApolloClient, InMemoryCache } from 'nexus';

// REST API example
export class RESTConfig implements RESTAdapter {
  axiosInstance = NexusAxios.create({
    baseURL: 'https://api.example.com'
  });
}

const restConnector = Nexus.instanciate(new RESTConfig());

const response = await restConnector.request({
  url: '/users',
  method: 'GET'
});

// GraphQL API example
export class GraphQLConfig implements GraphQLAdapter {
  apolloClient = new ApolloClient({
    uri: 'https://api.example.com/graphql',
    cache: new InMemoryCache()
  });
}

const graphqlConnector = Nexus.instanciate(new GraphQLConfig());

const data = await graphqlConnector.request({
  query: `query GetUsers { users { id name } }`
});
```

Ready to get started? Continue to the [Installation Guide](./installation).

---
sidebar_position: 4
---

# Adapters

Nexus uses adapters to support different API protocols. This page documents the available adapter types and their configuration options.

## REST Adapter

The REST adapter is used to interact with RESTful APIs using axios.

### Interface

```typescript
interface RESTAdapter {
  axiosInstance: AxiosInstance;
}
```

### Properties

| Name | Type | Description |
|------|------|-------------|
| `axiosInstance` | `AxiosInstance` | An axios instance configured for the API |

### Example

```typescript
import axios from 'axios';
import { ApiServiceConnector } from 'nexus';

const restAdapter: RESTAdapter = {
  axiosInstance: axios.create({
    baseURL: 'https://api.example.com',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
  })
};

const connector = ApiServiceConnector.createOrRetrieve(restAdapter);
```

## GraphQL Adapter

The GraphQL adapter is used to interact with GraphQL APIs using Apollo Client.

### Interface

```typescript
interface GraphQLAdapter<TCacheShape = NormalizedCacheObject> {
  apolloClient: ApolloClient<TCacheShape>;
}
```

### Properties

| Name | Type | Description |
|------|------|-------------|
| `apolloClient` | `ApolloClient` | An Apollo Client instance configured for the API |

### Example

```typescript
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApiServiceConnector } from 'nexus';

const graphqlAdapter: GraphQLAdapter = {
  apolloClient: new ApolloClient({
    uri: 'https://api.example.com/graphql',
    cache: new InMemoryCache()
  })
};

const connector = ApiServiceConnector.createOrRetrieve(graphqlAdapter);
```

## Generic Adapter

The Generic adapter is used to interact with any API using a custom client implementation.

### Interface

```typescript
interface GenericAdapter {
  client: any;
  executeRequest: <TResponse>(config: GenericOperationConfig) => Promise<TResponse>;
}
```

### Properties

| Name | Type | Description |
|------|------|-------------|
| `client` | `any` | A client instance for the API |
| `executeRequest` | `Function` | A function that executes requests against the client |

### Example

```typescript
import { ApiServiceConnector } from 'nexus';
import { CustomApiClient } from './custom-client';

const customClient = new CustomApiClient('https://api.example.com');

const genericAdapter: GenericAdapter = {
  client: customClient,
  executeRequest: async <TResponse>(config: GenericOperationConfig): Promise<TResponse> => {
    return customClient.executeOperation(config.operation, config.params);
  }
};

const connector = ApiServiceConnector.createOrRetrieve(genericAdapter);
```

## Protocol Detection

Nexus automatically detects the protocol type based on the adapter properties:

```typescript
const PROTOCOL_DETECTORS: Record<
  ClientProtocol,
  (adapter: ApiRequestFormat) => boolean
> = {
  REST: adapter => 'axiosInstance' in adapter,
  GraphQL: adapter => 'apolloClient' in adapter,
  Generic: adapter => 'client' in adapter && 'executeRequest' in adapter,
};
```

When you create a connector with `ApiServiceConnector.createOrRetrieve()`, Nexus will determine the protocol type based on the properties in your adapter object.

## Custom Adapters

You can create custom adapters for specialized API protocols. See the [Custom Adapters](../advanced/custom-adapters) guide for more information on how to implement and use custom adapters with Nexus. 
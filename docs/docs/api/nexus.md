---
sidebar_position: 2
---

# Nexus

The `Nexus` class serves as the main entry point for the library. It provides a simplified interface for creating API connectors.

## Class Definition

```typescript
export class Nexus {
  // Methods...
}
```

## Methods

### instanciate()

Creates an API connector using a specific configuration.

```typescript
static instanciate<TConfig extends BaseConfig>(
  config: TConfig
): ApiServiceConnector<TAdapter>
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `config` | `TConfig` | The configuration for the connector (REST, GraphQL, or Generic) |

#### Returns

An `ApiServiceConnector` instance configured for the specified API type.

#### Example

```typescript
import { Nexus, RESTAdapter, NexusAxios } from '@juliumnix/nexus';

// For REST API
export class RESTConfig implements RESTAdapter {
  axiosInstance = NexusAxios.create({
    baseURL: 'https://api.example.com',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

const apiConnector = Nexus.instanciate(new RESTConfig());
```

```typescript
import { Nexus, GraphQLAdapter, ApolloClient, InMemoryCache } from '@juliumnix/nexus';

// For GraphQL API
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

const apiConnector = Nexus.instanciate(new GraphQLConfig());
```

## Available Configurations

### RESTConfig

```typescript
export class RESTConfig implements RESTAdapter {
  axiosInstance = NexusAxios.create({
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
    interceptors?: {
      request?: {
        onFulfilled: (config: any) => any;
        onRejected: (error: any) => any;
      };
      response?: {
        onFulfilled: (response: any) => any;
        onRejected: (error: any) => any;
      };
    };
  });
}
```

### GraphQLConfig

```typescript
export class GraphQLConfig implements GraphQLAdapter {
  apolloClient = new ApolloClient({
    uri: string;
    cache: new InMemoryCache();
    defaultOptions?: {
      query?: {
        fetchPolicy?: string;
      };
    };
    headers?: Record<string, string>;
  });
}
```

### GenericConfig

```typescript
export class GenericConfig implements GenericAdapter {
  client = any;
  executeRequest = (config: GenericOperationConfig) => Promise<any>;
}
```

## Using with TypeScript

When using Nexus with TypeScript, you can provide type parameters for better type inference:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const apiConnector = Nexus.instanciate(new RESTConfig());

// Type-safe request
const response = await apiConnector.request<User[]>({
  url: '/users',
  method: 'GET'
});

// response.data will be typed as User[]
const users: User[] = response.data;
``` 
---
sidebar_position: 3
---

# ApiServiceConnector

The `ApiServiceConnector` class is the primary interface for making requests to API services. It provides a unified API for different protocols (REST, GraphQL, and custom implementations).

## Class Definition

```typescript
class ApiServiceConnector<
  TAdapter extends ApiRequestFormat,
  TCacheShape = NormalizedCacheObject
> {
  // Methods...
}
```

## Accessing an Instance

You don't directly instantiate `ApiServiceConnector`, but obtain it through the `Nexus.instanciate()` method:

```typescript
import { Nexus, RESTAdapter, NexusAxios } from 'nexus';

export class RESTConfig implements RESTAdapter {
  axiosInstance = NexusAxios.create({
    baseURL: 'https://api.example.com'
  });
}

const apiConnector = Nexus.instanciate(new RESTConfig());
```

## Authentication Methods

### applyAuthenticationToken()

Applies an authentication token to the connector (REST adapter only).

```typescript
applyAuthenticationToken(accessToken: string): void
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `accessToken` | `string` | The authentication token to apply |

#### Throws

- Error if the connector is not using a REST adapter

#### Example

```typescript
apiConnector.applyAuthenticationToken('your-jwt-token');
```

## Client Access Methods

### getGraphQLClient()

Gets the underlying Apollo Client from a GraphQL adapter.

```typescript
getGraphQLClient(): ApolloClient<TCacheShape>
```

#### Returns

The Apollo Client instance.

#### Throws

- Error if the connector is not using a GraphQL adapter

#### Example

```typescript
const apolloClient = graphqlConnector.getGraphQLClient();
```

## Request Methods

### request()

Makes a request to the API service with adapter-specific configuration.

```typescript
// REST adapter
request<TResponse>(
  config: HttpRequestConfig
): Promise<AxiosResponse<TResponse>>;

// GraphQL adapter
request<TResponse>(
  config: GraphQLOperationConfig
): Promise<AxiosResponse<TResponse>>;

// Generic adapter
request<TResponse>(
  config: GenericOperationConfig
): Promise<TResponse>;
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `config` | Varies by adapter | Configuration for the request |

#### Returns

A Promise with the response, which varies by adapter type.

#### Example

```typescript
// REST request
const response = await restConnector.request({
  url: '/users',
  method: 'GET',
  params: { page: 1 }
});

// GraphQL request
const response = await graphqlConnector.request({
  query: `query GetUsers { users { id name } }`,
  variables: { limit: 10 }
});
```

## Private Methods

The following methods are used internally by the `ApiServiceConnector` class:

### executeHttpRequest()

```typescript
private executeHttpRequest<TResponse>(
  adapter: RESTAdapter,
  config: HttpRequestConfig
): Promise<AxiosResponse<TResponse>>
```

### executeGraphQLOperation()

```typescript
private executeGraphQLOperation<TResponse>(
  adapter: GraphQLAdapter<TCacheShape>,
  config: GraphQLOperationConfig
): Promise<AxiosResponse<TResponse>>
```

### executeGenericOperation()

```typescript
private executeGenericOperation<TResponse>(
  adapter: GenericAdapter,
  config: GenericOperationConfig
): Promise<TResponse>
``` 
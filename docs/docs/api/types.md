---
sidebar_position: 5
---

# API Types

Este documento detalha os tipos e interfaces utilizados pela biblioteca Nexus.

## Tipos Principais

### ApiRequestFormat

Uma união de todos os formatos de adaptadores possíveis.

```typescript
type ApiRequestFormat = RESTAdapter | GraphQLAdapter | GenericAdapter;
```

### ClientProtocol

Enum de protocolos de cliente suportados.

```typescript
type ClientProtocol = 'REST' | 'GraphQL' | 'Generic';
```

## Configurações de Requisição

### ApiRequestConfig

Uma união de todos os formatos de configuração de requisição possíveis.

```typescript
type ApiRequestConfig = HttpRequestConfig | GraphQLOperationConfig | GenericOperationConfig;
```

### HttpRequestConfig

Configuração para requisições HTTP/REST.

```typescript
interface HttpRequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}
```

### GraphQLOperationConfig

Configuração para operações GraphQL.

```typescript
interface GraphQLOperationConfig {
  query: string | DocumentNode;
  variables?: Record<string, any>;
  headers?: Record<string, string>;
  context?: Record<string, any>;
}
```

### GenericOperationConfig

Configuração para adaptadores genéricos personalizados.

```typescript
interface GenericOperationConfig {
  operation: string;
  params?: Record<string, any>;
  options?: Record<string, any>;
}
```

## Tipos de Resposta

### HttpResponse

Um alias do tipo de resposta do Axios.

```typescript
type HttpResponse<T = any> = AxiosResponse<T>;
```

### GraphQLResponse

Estrutura de resposta GraphQL padrão.

```typescript
interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
}
```

## Uso com TypeScript

A biblioteca Nexus é totalmente tipada, permitindo verificação de tipo em tempo de compilação:

```typescript
import { ApiServiceConnector } from 'nexus';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
}

const apiConnector = ApiServiceConnector.createOrRetrieve({
  axiosInstance: axios.create({ baseURL: 'https://api.example.com' })
});

// Com tipos genéricos específicos
const response = await apiConnector.request<User[]>({
  url: '/users',
  method: 'GET'
});

// response.data será tipado como User[]
const users: User[] = response.data;
```

## Extensão de Tipos

Para criar adaptadores personalizados, você pode estender os tipos existentes:

```typescript
interface CustomAdapter extends GenericAdapter {
  client: CustomClient;
  executeRequest: <TResponse>(config: CustomOperationConfig) => Promise<TResponse>;
}

interface CustomOperationConfig extends GenericOperationConfig {
  customField: string;
}
``` 
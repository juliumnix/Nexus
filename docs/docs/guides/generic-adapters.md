---
sidebar_position: 3
---

# Generic Adapters

This guide shows how to use generic adapters in Nexus to work with APIs that don't follow REST or GraphQL standards, or to integrate custom client libraries.

## What are Generic Adapters?

Generic adapters allow you to connect Nexus to any type of API or service, regardless of protocol or format. This is useful for:

- Proprietary APIs that don't follow REST or GraphQL standards
- gRPC services
- WebSockets
- SOAP services
- Any other custom protocol or format

## Creating a Generic Adapter

To create a generic adapter, you need to provide:

1. A client that interacts with the service
2. An `executeRequest` function that implements the request execution logic

```typescript
import { Nexus, GenericAdapter } from 'nexus';
import { CustomClient } from './custom-client';

// Create a custom client instance
const customClient = new CustomClient({
  baseUrl: 'https://api.example.com',
  timeout: 5000
});

// Create a generic adapter configuration class
export class GenericConfig implements GenericAdapter {
  client = customClient;
  executeRequest = async <TResponse>(config) => {
    const { operation, params } = config;
    
    // Implement logic that transforms the request parameters
    // into the format expected by your custom client
    const result = await customClient.execute(operation, params);
    
    // Transform the response as needed
    return result.data as TResponse;
  };
}

// Create the connector using the generic adapter
const apiConnector = Nexus.instanciate(new GenericConfig());
```

## Example: gRPC Adapter

Example of an adapter for a gRPC client:

```typescript
import { Nexus, GenericAdapter } from 'nexus';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

// Load the protocol definition
const packageDefinition = protoLoader.loadSync(
  'path/to/your/proto/file.proto',
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const UserService = protoDescriptor.example.UserService;

// Create a gRPC client
const client = new UserService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Create a generic adapter configuration for the gRPC client
export class GRPCConfig implements GenericAdapter {
  client = client;
  executeRequest = async <TResponse>(config) => {
    const { operation, params } = config;
    
    return new Promise((resolve, reject) => {
      // Call the appropriate method on the gRPC client
      client[operation](params, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response as TResponse);
        }
      });
    });
  };
}

// Create the connector using the gRPC adapter
const apiConnector = Nexus.instanciate(new GRPCConfig());

// Use the connector to make requests
const getUser = async (userId) => {
  const user = await apiConnector.request({
    operation: 'getUser',
    params: { id: userId }
  });
  
  return user;
};
```

## Example: WebSocket Adapter

Example of an adapter for WebSocket:

```typescript
import { Nexus, GenericAdapter } from 'nexus';
import WebSocket from 'ws';

// Create a class to manage the WebSocket connection
class WebSocketClient {
  private ws: WebSocket;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private requestIdCounter = 0;
  
  constructor(url: string) {
    this.ws = new WebSocket(url);
    
    this.ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      const handler = this.messageHandlers.get(message.id);
      
      if (handler) {
        handler(message.data);
        this.messageHandlers.delete(message.id);
      }
    });
  }
  
  async send(type: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = (++this.requestIdCounter).toString();
      
      // Register handler for the response
      this.messageHandlers.set(requestId, resolve);
      
      // Send message
      this.ws.send(JSON.stringify({
        id: requestId,
        type,
        data
      }));
      
      // Timeout to prevent memory leaks
      setTimeout(() => {
        if (this.messageHandlers.has(requestId)) {
          this.messageHandlers.delete(requestId);
          reject(new Error('Timeout waiting for WebSocket response'));
        }
      }, 30000);
    });
  }
  
  close() {
    this.ws.close();
  }
}

// Create WebSocket client
const wsClient = new WebSocketClient('wss://api.example.com/ws');

// Create generic adapter configuration for WebSocket
export class WebSocketConfig implements GenericAdapter {
  client = wsClient;
  executeRequest = async <TResponse>(config) => {
    const { operation, params } = config;
    
    // Send message via WebSocket and wait for response
    const response = await wsClient.send(operation, params);
    
    return response as TResponse;
  };
}

// Create connector using the WebSocket adapter
const apiConnector = Nexus.instanciate(new WebSocketConfig());

// Use the connector to make requests
const getUser = async (userId) => {
  const user = await apiConnector.request({
    operation: 'getUser',
    params: { id: userId }
  });
  
  return user;
};
```

## Error Handling in Generic Adapters

Error handling in generic adapters should follow the same pattern as other adapters:

```typescript
export class RobustConfig implements GenericAdapter {
  client = customClient;
  executeRequest = async <TResponse>(config) => {
    try {
      const { operation, params } = config;
      const result = await customClient.execute(operation, params);
      return result.data as TResponse;
    } catch (error) {
      // Transform client-specific error into a more generic format
      throw new Error(`Error executing ${config.operation}: ${error.message}`);
    }
  };
}
```

## Generic Adapters with TypeScript

To improve type safety, you can extend the basic interfaces:

```typescript
import { Nexus, GenericAdapter, GenericOperationConfig } from 'nexus';

// Extend the configuration to include specific fields
interface MyServiceConfig extends GenericOperationConfig {
  // Additional fields specific to your API
  version?: string;
  apiKey?: string;
}

// Extend the adapter to improve type safety
interface MyServiceAdapter extends GenericAdapter {
  client: MyCustomClient;
  executeRequest: <TResponse>(config: MyServiceConfig) => Promise<TResponse>;
}

// Create a typed adapter configuration
export class TypedServiceConfig implements MyServiceAdapter {
  client = new MyCustomClient();
  executeRequest = async <TResponse>(config: MyServiceConfig) => {
    // Specific implementation
    return await this.client.execute(config) as TResponse;
  };
}

// Create the connector using the typed adapter
const apiConnector = Nexus.instanciate(new TypedServiceConfig());
``` 
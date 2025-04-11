---
sidebar_position: 1
---

# API Reference Overview

This section provides detailed documentation for the Nexus API. The API is designed to be intuitive and consistent across different adapter types.

## Core Components

Nexus consists of the following core components:

| Component | Description |
|-----------|-------------|
| `Nexus` | The main entry point for the library, providing a factory for API connectors |
| `ApiServiceConnector` | The primary class for interacting with API services |
| Adapters | Implementations for different protocols (REST, GraphQL, Generic) |
| Types | TypeScript interfaces and types for configuration options |

## Class Hierarchy

The class hierarchy in Nexus is designed to provide a clean abstraction over different API protocols:

```
Nexus
└── ApiServiceConnector
    ├── REST adapter (using axios)
    ├── GraphQL adapter (using Apollo Client)
    └── Generic adapter (custom implementation)
```

## API Quick Navigation

### Main Classes

- [Nexus](./nexus) - Factory class for creating API connectors
- [ApiServiceConnector](./api-service-connector) - Main class for interacting with APIs

### Adapters

- [REST Adapter](./adapters#rest-adapter) - For RESTful APIs
- [GraphQL Adapter](./adapters#graphql-adapter) - For GraphQL APIs
- [Generic Adapter](./adapters#generic-adapter) - For custom API protocols

### Types

- [API Types](./types) - Type definitions used throughout the library

## Naming Conventions

Throughout the API, we follow these naming conventions:

- **request**: Methods for making API requests
- **apply**: Methods that modify the adapter's state
- **get**: Methods that retrieve something from the adapter
- **create/retrieve**: Factory methods to create new instances or retrieve existing ones

## Error Handling

All methods in the Nexus API follow a consistent error handling approach. Operations that may fail will throw descriptive error messages that include:

- The type of operation that failed
- The specific error message from the underlying adapter
- Context information where appropriate

See the [Error Handling](../advanced/error-handling) guide for more information. 
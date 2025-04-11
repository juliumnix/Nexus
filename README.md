# Nexus

Nexus is a powerful library that allows you to connect to any API service using a single interface, regardless of the underlying protocol or implementation details.

## Features

- **Protocol-agnostic interface** - Work with REST, GraphQL, or custom API protocols through a unified interface
- **Built-in adapters** - Ready-to-use adapters for common protocols
- **Type safety** - Full TypeScript support with proper type definitions
- **Authentication handling** - Simple API to manage authentication tokens
- **Extensibility** - Easy to extend with custom adapters for any API type

## Installation

```bash
npm install @juliumnix/nexus
```

or

```bash
yarn add @juliumnix/nexus
```

## Quick Example

```typescript
// REST API example
const restConnector = ApiServiceConnector.createOrRetrieve({
  axiosInstance: axios.create({ baseURL: 'https://api.example.com' })
});

const response = await restConnector.request({
  url: '/users',
  method: 'GET'
});

// GraphQL API example
const graphqlConnector = ApiServiceConnector.createOrRetrieve({
  apolloClient: new ApolloClient({
    uri: 'https://api.example.com/graphql',
    cache: new InMemoryCache()
  })
});

const data = await graphqlConnector.request({
  query: `query GetUsers { users { id name } }`
});
```

## Documentation

Detailed documentation is available in the `/docs` directory. To run the documentation site locally:

```bash
# Install dependencies
cd docs && yarn install

# Start the documentation site
cd docs && yarn start
```

Or use the convenience script:

```bash
./docs-start.sh
```

The documentation includes:

- Getting started guides
- API references
- Examples and tutorials
- Advanced usage patterns

## License

ISC

## Author

Julio Cesar

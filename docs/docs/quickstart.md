---
sidebar_position: 3
---

# Quick Start Guide

This guide will help you get started with Nexus quickly. We'll cover the basics of setting up different API connectors and making requests.

## Basic Usage

### Setting Up API Connectors

First, import Nexus:

```typescript
import { Nexus, RESTAdapter, GraphQLAdapter, NexusAxios, ApolloClient, InMemoryCache } from 'nexus';
```

#### REST API Connector

To create a REST API connector:

```typescript
// Configure the REST adapter
export class RESTConfig implements RESTAdapter {
  axiosInstance = NexusAxios.create({
    baseURL: 'https://rickandmortyapi.com/api',
  });
}

// Instantiate the connector
const restConnector = Nexus.instanciate(new RESTConfig());
```

#### GraphQL API Connector

To create a GraphQL API connector:

```typescript
// Configure the GraphQL adapter
export class GraphQLConfig implements GraphQLAdapter {
  apolloClient = new ApolloClient({
    uri: 'https://rickandmortyapi.com/graphql',
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only'
      }
    }
  });
}

// Instantiate the connector
const graphqlConnector = Nexus.instanciate(new GraphQLConfig());
```

## Quick Example

Here's a complete example retrieving character data from the Rick and Morty API:

```typescript
import { Nexus, RESTAdapter, NexusAxios } from 'nexus';

// Step 1: Create a configuration class that implements RESTAdapter
export class RickAndMortyConfig implements RESTAdapter {
  axiosInstance = NexusAxios.create({
    baseURL: 'https://rickandmortyapi.com/api',
  });
}

// Step 2: Instantiate a Nexus connector
const apiConnector = Nexus.instanciate(new RickAndMortyConfig());

// Step 3: Define an interface for your data model
interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
}

interface ApiResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Character[];
}

// Step 4: Make API requests
async function getCharacters(page: number = 1) {
  try {
    const response = await apiConnector.request<ApiResponse>({
      url: '/character',
      method: 'GET',
      params: { page }
    });
    
    console.log(`Found ${response.data.info.count} characters`);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching characters:', error);
    return [];
  }
}

// Usage:
getCharacters().then(characters => {
  characters.forEach(char => {
    console.log(`${char.name} - ${char.species} (${char.status})`);
  });
});
```

### Making Requests

Once you have configured your connectors, you can make requests using a unified interface:

#### REST Requests

```typescript
// GET Request
const getUsers = async () => {
  const response = await restConnector.request({
    url: '/users',
    method: 'GET'
  });
  
  return response.data;
};

// POST Request
const createUser = async (userData) => {
  const response = await restConnector.request({
    url: '/users',
    method: 'POST',
    data: userData
  });
  
  return response.data;
};
```

#### GraphQL Requests

```typescript
// Query
const getUsers = async () => {
  const response = await graphqlConnector.request({
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
  
  return response.data;
};

// Mutation with variables
const createUser = async (userData) => {
  const response = await graphqlConnector.request({
    query: `
      mutation CreateUser($input: UserInput!) {
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
  
  return response.data;
};
```

### Authentication

You can easily add authentication tokens to your REST requests:

```typescript
// Add authentication token
restConnector.applyAuthenticationToken('your-access-token');

// The token will be automatically applied to all subsequent requests
```

## Next Steps

Now that you're familiar with the basics of Nexus, explore our guides to learn more about specific use cases:

- [Working with REST APIs](guides/rest-api)
- [Working with GraphQL APIs](guides/graphql-api)
- [Creating Custom Adapters](advanced/custom-adapters)

For a complete overview of all available methods and options, check out our [API Reference](api/overview). 
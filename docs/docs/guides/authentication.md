---
sidebar_position: 4
---

# Authentication with Nexus

This guide shows how to configure and manage authentication in your APIs using Nexus.

## Authentication Methods

Nexus supports various authentication methods, depending on the API protocol you're using.

### Authentication in REST APIs

#### Bearer Token (JWT)

The most common method for REST APIs is Bearer token authentication, typically using JWT:

```typescript
import { Nexus, RESTAdapter, NexusAxios } from 'nexus';

// Create a REST configuration
export class RESTConfig implements RESTAdapter {
  axiosInstance = NexusAxios.create({
    baseURL: 'https://api.example.com'
  });
}

// Instantiate a connector
const apiConnector = Nexus.instanciate(new RESTConfig());

// Apply authentication token
apiConnector.applyAuthenticationToken('your-jwt-token');

// All requests will now include the authentication header
const response = await apiConnector.request({
  url: '/protected-resources',
  method: 'GET'
});
```

#### Basic Authentication

```typescript
import { Nexus, RESTAdapter, NexusAxios } from 'nexus';

// Create a REST configuration with basic auth
export class RESTConfig implements RESTAdapter {
  axiosInstance = NexusAxios.create({
    baseURL: 'https://api.example.com',
    auth: {
      username: 'user',
      password: 'password'
    }
  });
}

const apiConnector = Nexus.instanciate(new RESTConfig());
```

#### API Key Authentication

```typescript
import { Nexus, RESTAdapter, NexusAxios } from 'nexus';

// Create a REST configuration with API key
export class RESTConfig implements RESTAdapter {
  axiosInstance = NexusAxios.create({
    baseURL: 'https://api.example.com',
    headers: {
      'X-API-Key': 'your-api-key'
    }
  });
}

const apiConnector = Nexus.instanciate(new RESTConfig());
```

### Authentication in GraphQL APIs

For GraphQL APIs, authentication is typically implemented through HTTP headers:

```typescript
import { Nexus, GraphQLAdapter, ApolloClient, InMemoryCache, createHttpLink } from 'nexus';
import { setContext } from '@apollo/client/link/context';

// Create an HTTP link
const httpLink = createHttpLink({
  uri: 'https://api.example.com/graphql',
});

// Create an authentication link that adds the token to headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Create Apollo client with combined links
export class GraphQLConfig implements GraphQLAdapter {
  apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
  });
}

// Create the connector
const apiConnector = Nexus.instanciate(new GraphQLConfig());
```

## Token Management

### Token Storage

It's important to store tokens securely:

```typescript
// In the browser
const storeToken = (token: string) => {
  // For applications requiring higher security, use localStorage
  localStorage.setItem('auth_token', token);
  
  // For short-lived tokens or increased security, use sessionStorage
  sessionStorage.setItem('auth_token', token);
};

// In Node.js applications
const storeToken = (token: string) => {
  // Store in an environment variable or a secure file
  process.env.AUTH_TOKEN = token;
};
```

### Token Renewal

Implementing automatic token renewal:

```typescript
import { Nexus, RESTAdapter, NexusAxios } from 'nexus';

const createAuthenticatedConnector = async () => {
  // Configure the REST adapter with token renewal
  export class RESTConfig implements RESTAdapter {
    axiosInstance = NexusAxios.create({
      baseURL: 'https://api.example.com'
    });
  }
  
  // Add interceptor for automatic renewal
  RESTConfig.prototype.axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If the error is 401 (unauthorized) and we haven't tried to renew yet
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Get new refresh token
          const refreshToken = localStorage.getItem('refresh_token');
          const response = await NexusAxios.post('https://api.example.com/refresh', {
            refresh_token: refreshToken
          });
          
          const newToken = response.data.token;
          localStorage.setItem('auth_token', newToken);
          
          // Update token in original request and retry
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return RESTConfig.prototype.axiosInstance(originalRequest);
        } catch (refreshError) {
          // Renewal failed, redirect to login
          // window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  const apiConnector = Nexus.instanciate(new RESTConfig());
  
  const token = localStorage.getItem('auth_token');
  if (token) {
    apiConnector.applyAuthenticationToken(token);
  }
  
  return apiConnector;
};
```

## Best Practices

1. **Never store tokens in source code**: Always use environment variables or secure storage.

2. **Use HTTPS**: Always transmit authentication tokens through secure connections.

3. **Define token scope**: Use tokens with the smallest possible scope of permissions.

4. **Set expiration**: Use short-lived tokens with a renewal mechanism.

5. **Validate tokens on the server**: Always validate tokens on the server side before allowing access.

6. **Implement logout**: Have a mechanism to invalidate tokens at logout.

```typescript
const logout = async (apiConnector) => {
  try {
    // Optional: notify the server about logout
    await apiConnector.request({
      url: '/auth/logout',
      method: 'POST'
    });
  } catch (error) {
    console.error('Error logging out on server:', error);
  } finally {
    // Clear stored tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    
    // Redirect to login page
    // window.location.href = '/login';
  }
};
```

## Handling Authentication Errors

```typescript
try {
  const response = await apiConnector.request({
    url: '/protected-resource',
    method: 'GET'
  });
  
  return response.data;
} catch (error) {
  if (error.response && error.response.status === 401) {
    console.error('Authentication error: Invalid or expired token');
    // Redirect to login or try to renew token
  } else if (error.response && error.response.status === 403) {
    console.error('Authorization error: Insufficient permissions');
    // Show permission denied message
  } else {
    console.error('Other error:', error.message);
  }
  throw error;
}
``` 
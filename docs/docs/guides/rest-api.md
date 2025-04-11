---
sidebar_position: 1
---

# Working with REST APIs

This guide covers how to use Nexus to interact with RESTful APIs using the REST adapter.

## Setting Up a REST Connector

To work with a REST API, you first need to create a connector with the REST adapter:

```typescript
import { Nexus, RESTAdapter, NexusAxios } from 'nexus';

// Create a REST configuration
export class RESTConfig implements RESTAdapter {
  axiosInstance = NexusAxios.create({
    baseURL: 'https://api.example.com',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// Instantiate a REST connector
const apiConnector = Nexus.instanciate(new RESTConfig());
```

## Making HTTP Requests

### GET Request

```typescript
const getUsers = async () => {
  const response = await apiConnector.request({
    url: '/users',
    method: 'GET',
    params: {
      page: 1,
      limit: 10
    }
  });
  
  return response.data;
};
```

### POST Request

```typescript
const createUser = async (userData) => {
  const response = await apiConnector.request({
    url: '/users',
    method: 'POST',
    data: userData
  });
  
  return response.data;
};
```

### PUT Request

```typescript
const updateUser = async (userId, userData) => {
  const response = await apiConnector.request({
    url: `/users/${userId}`,
    method: 'PUT',
    data: userData
  });
  
  return response.data;
};
```

### DELETE Request

```typescript
const deleteUser = async (userId) => {
  const response = await apiConnector.request({
    url: `/users/${userId}`,
    method: 'DELETE'
  });
  
  return response.data;
};
```

## Authentication

### Bearer Token Authentication

```typescript
// Apply authentication token
apiConnector.applyAuthenticationToken('your-jwt-token');

// Now all requests will include the Authorization header
const response = await apiConnector.request({
  url: '/secure-resource',
  method: 'GET'
});
```

### Basic Authentication

```typescript
import { Nexus, RESTAdapter, NexusAxios } from 'nexus';

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

## Error Handling

Nexus provides a consistent approach to error handling. For REST requests, you can access the response even if it contains an error status code:

```typescript
try {
  const response = await apiConnector.request({
    url: '/users',
    method: 'GET'
  });
  
  // Successful response
  console.log('Data:', response.data);
} catch (error) {
  if (error.isAxiosError && error.response) {
    // API responded with an error status
    console.error('API Error:', error.response.status, error.response.data);
  } else {
    // Network or other error
    console.error('Request Error:', error.message);
  }
}
```

## Advanced Configuration

### Request Interceptors

You can configure interceptors directly in the REST configuration:

```typescript
export class RESTConfig implements RESTAdapter {
  axiosInstance = NexusAxios.create({
    baseURL: 'https://api.example.com',
    interceptors: {
      request: {
        onFulfilled: (config) => {
          // Modify config before request is sent
          config.headers['X-Custom-Header'] = 'value';
          return config;
        },
        onRejected: (error) => {
          return Promise.reject(error);
        }
      },
      response: {
        onFulfilled: (response) => {
          // Status code in the range 2xx
          return response;
        },
        onRejected: (error) => {
          // Status codes outside the range 2xx
          return Promise.reject(error);
        }
      }
    }
  });
}

const apiConnector = Nexus.instanciate(new RESTConfig());
```

### Timeout Configuration

```typescript
export class RESTConfig implements RESTAdapter {
  axiosInstance = NexusAxios.create({
    baseURL: 'https://api.example.com',
    timeout: 10000 // 10 seconds
  });
}

const apiConnector = Nexus.instanciate(new RESTConfig());
```

### Request Cancellation

You can use an AbortController to cancel requests:

```typescript
const controller = new AbortController();

apiConnector.request({
  url: '/long-operation',
  method: 'GET',
  signal: controller.signal
});

// Later, to cancel the request
controller.abort();
```

## Practical Examples

### Fetching Paginated Data

```typescript
const fetchPaginatedUsers = async (page = 1, limit = 10) => {
  const response = await apiConnector.request({
    url: '/users',
    method: 'GET',
    params: { page, limit }
  });
  
  return {
    data: response.data,
    totalPages: parseInt(response.headers['x-total-pages'] || '1'),
    currentPage: page
  };
};
```

### File Upload

```typescript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiConnector.request({
    url: '/upload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};
```

### Working with APIs that Require CSRF Tokens

```typescript
const performSecureOperation = async () => {
  // First, get the CSRF token
  const tokenResponse = await apiConnector.request({
    url: '/csrf-token',
    method: 'GET'
  });
  
  const csrfToken = tokenResponse.data.token;
  
  // Then, use it in a subsequent request
  const response = await apiConnector.request({
    url: '/secure-operation',
    method: 'POST',
    headers: {
      'X-CSRF-Token': csrfToken
    },
    data: {
      // operation data
    }
  });
  
  return response.data;
};
``` 
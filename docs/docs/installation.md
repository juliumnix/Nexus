---
sidebar_position: 2
---

# Installation

Getting started with Nexus is straightforward. This guide will walk you through the installation process and help you set up Nexus in your project.

## Prerequisites

Nexus requires:

- Node.js 18.0 or later
- npm or yarn package manager

## Installing Nexus

You can install Nexus using npm or yarn:

```bash
npm install @juliumnix/nexus
```

or

```bash
yarn add @juliumnix/nexus
```

## Peer Dependencies

Nexus has several peer dependencies depending on which API protocols you plan to use:

### For REST APIs

```bash
npm install axios
```

### For GraphQL APIs

```bash
npm install @apollo/client graphql
```

### For React Integration (optional)

```bash
npm install react
```

You can install only the dependencies you need based on which adapters you plan to use in your project.

## Verifying the Installation

To verify that Nexus is installed correctly, you can create a simple test file:

```typescript
import { Nexus, ApiServiceConnector } from '@juliumnix/nexus';

// If you can import these without errors, the installation was successful
console.log('Nexus installation successful!');
```

## TypeScript Configuration

If you're using TypeScript (recommended), make sure your `tsconfig.json` has the following settings:

```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "esModuleInterop": true,
    "strict": true
  }
}
```

## Next Steps

Now that you have Nexus installed, let's learn how to use it in your application by following our [Quick Start Guide](./quickstart). 
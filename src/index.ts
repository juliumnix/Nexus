import * as Apollo from "@apollo/client";
import axios from "axios";
import { Nexus } from "./Nexus";
import { ApiServiceConnector } from "./ApiServiceConnector";
import {
  ApiRequestConfig,
  ApiRequestFormat,
  ClientProtocol,
  GenericOperationConfig,
  GraphQLOperationConfig,
  HttpRequestConfig,
} from "./types/ApiServiceConnectorTypes";
import { RESTAdapter } from "./types/RESTAdapter";
import { GraphQLAdapter } from "./types/GraphQLAdapter";
import { GenericAdapter } from "./types/GenericAdapter";

// Export Apollo under the NexusApollo namespace
export const NexusApollo = Apollo;

// Export axios under the NexusAxios namespace
export const NexusAxios = axios;

export {
  Nexus,
  ApiServiceConnector,
  // Types
  ApiRequestConfig,
  ApiRequestFormat,
  ClientProtocol,
  GenericOperationConfig,
  GraphQLOperationConfig,
  HttpRequestConfig,
  RESTAdapter,
  GraphQLAdapter,
  GenericAdapter,
};

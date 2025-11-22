import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { createLogger } from '@creatorflow/logger';

const logger = createLogger({ name: 'http-client' });

export function createHttpClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      logger.debug({ url: config.url, method: config.method }, 'Outgoing request');
      return config;
    },
    (error) => {
      logger.error({ err: error }, 'Request error');
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      logger.debug(
        { url: response.config.url, status: response.status },
        'Response received'
      );
      return response;
    },
    (error) => {
      logger.error(
        {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
        },
        'Response error'
      );
      return Promise.reject(error);
    }
  );

  return client;
}

export async function proxyRequest(
  client: AxiosInstance,
  config: AxiosRequestConfig
): Promise<any> {
  try {
    const response = await client.request(config);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Forward the error from the downstream service
      throw {
        statusCode: error.response.status,
        code: error.response.data?.error?.code || 'DOWNSTREAM_ERROR',
        message: error.response.data?.error?.message || 'Downstream service error',
        details: error.response.data?.error?.details,
      };
    }
    throw {
      statusCode: 503,
      code: 'SERVICE_UNAVAILABLE',
      message: 'Downstream service unavailable',
    };
  }
}

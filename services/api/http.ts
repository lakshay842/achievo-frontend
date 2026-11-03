import type { AxiosRequestConfig } from 'axios';

import { api } from '@/services/api/client';
import type { ApiSuccess, PaginationMeta } from '@/types/api';

export async function requestData<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await api.request<ApiSuccess<T>>(config);
  return response.data.data;
}

export async function requestPaged<T>(
  config: AxiosRequestConfig,
): Promise<{ items: T; meta?: PaginationMeta; message: string }> {
  const response = await api.request<ApiSuccess<T>>(config);
  return {
    items: response.data.data,
    meta: response.data.meta,
    message: response.data.message,
  };
}

export async function requestMessage(config: AxiosRequestConfig): Promise<string> {
  const response = await api.request<ApiSuccess<null>>(config);
  return response.data.message;
}

import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class HttpService {
  private readonly logger = new Logger(HttpService.name);
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000, // 10초 타임아웃
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Undertaker-Subway-App/1.0',
      },
    });

    // 요청 인터셉터
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.debug(
          `🚀 HTTP Request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        this.logger.error('❌ HTTP Request Error:', error);
        return Promise.reject(error);
      },
    );

    // 응답 인터셉터
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(
          `✅ HTTP Response: ${response.status} ${response.config.url}`,
        );
        return response;
      },
      (error) => {
        this.logger.error(
          `❌ HTTP Response Error: ${error.response?.status} ${error.config?.url}`,
          error.message,
        );
        return Promise.reject(error);
      },
    );
  }

  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }
}

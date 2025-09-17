import type { AxiosError, AxiosInstance, AxiosPromise } from 'axios';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { v4 as uuidv4 } from 'uuid';

import {
  KnapsackProEnvConfig,
  buildAuthor,
  commitAuthors,
  ciProvider,
} from './config/index.js';
import { KnapsackProLogger } from './knapsack-pro-logger.js';
import { TestFile } from './models/index.js';

export const getHeaders = ({
  clientName,
  clientVersion,
}: {
  clientName: string;
  clientVersion: string;
}) => {
  const ci = ciProvider();

  return {
    'KNAPSACK-PRO-CLIENT-NAME': clientName,
    'KNAPSACK-PRO-CLIENT-VERSION': clientVersion,
    ...(ci !== null ? { 'KNAPSACK-PRO-CI-PROVIDER': ci } : {}),
  };
};

export class KnapsackProAPI {
  private readonly api: AxiosInstance;

  private knapsackProLogger: KnapsackProLogger;

  constructor(clientName: string, clientVersion: string) {
    this.retryCondition = this.retryCondition.bind(this);
    this.retryDelay = this.retryDelay.bind(this);

    this.knapsackProLogger = new KnapsackProLogger();
    this.api = this.setUpApiClient(clientName, clientVersion);
  }

  // allTestFiles in whole user's test suite
  public fetchTestsFromQueue(
    allTestFiles: TestFile[],
    initializeQueue: boolean,
    attemptConnectToQueue: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): AxiosPromise<any> {
    const url = '/v1/queues/queue';
    const data = {
      test_suite_token: KnapsackProEnvConfig.testSuiteToken,
      can_initialize_queue: initializeQueue,
      attempt_connect_to_queue: attemptConnectToQueue,
      fixed_queue_split: KnapsackProEnvConfig.fixedQueueSplit,
      commit_hash: KnapsackProEnvConfig.commitHash,
      branch: KnapsackProEnvConfig.branch,
      node_total: KnapsackProEnvConfig.ciNodeTotal,
      node_index: KnapsackProEnvConfig.ciNodeIndex,
      node_build_id: KnapsackProEnvConfig.ciNodeBuildId,
      user_seat: KnapsackProEnvConfig.maskedUserSeat,
      batch_uuid: uuidv4(),
      ...(initializeQueue &&
        !attemptConnectToQueue && {
          test_files: allTestFiles,
          build_author: buildAuthor(),
          commit_authors: commitAuthors(),
        }),
    };

    return this.api.post(url, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public createBuildSubset(recordedTestFiles: TestFile[]): AxiosPromise<any> {
    const url = '/v1/build_subsets';
    const data = {
      test_suite_token: KnapsackProEnvConfig.testSuiteToken,
      commit_hash: KnapsackProEnvConfig.commitHash,
      branch: KnapsackProEnvConfig.branch,
      node_total: KnapsackProEnvConfig.ciNodeTotal,
      node_index: KnapsackProEnvConfig.ciNodeIndex,
      test_files: recordedTestFiles,
    };

    return this.api.post(url, data);
  }

  public isExpectedErrorStatus(error: AxiosError) {
    const { response } = error;
    if (!response) {
      return false;
    }

    const { status } = response;

    return (
      status === 400 || // params error
      status === 422 || // validation error
      status === 403 // trial ended
    );
  }

  private setUpApiClient(
    clientName: string,
    clientVersion: string,
  ): AxiosInstance {
    const apiClient = axios.create({
      baseURL: KnapsackProEnvConfig.endpoint,
      timeout: 15000,
      headers: getHeaders({ clientName, clientVersion }),
    });

    axiosRetry(apiClient, {
      retries: 2,
      shouldResetTimeout: true,
      retryDelay: this.retryDelay,
      retryCondition: this.retryCondition,
    });

    apiClient.interceptors.request.use((config) => {
      const { method, baseURL, url, headers, data } = config;

      // when axios retries request then url includes baseURL so we remove it
      const apiUrl = baseURL + url!.replace(baseURL ?? '', '');
      const requestHeaders = KnapsackProLogger.objectInspect(headers);
      const requestBody = KnapsackProLogger.objectInspect(data);

      this.knapsackProLogger.info(`${method?.toUpperCase()} ${apiUrl}`);
      this.knapsackProLogger.debug(
        `${method?.toUpperCase()} ${apiUrl}\n\n` +
          'Request headers:\n' +
          `${requestHeaders}\n\n` +
          'Request body:\n' +
          `${requestBody}`,
      );

      return config;
    });

    apiClient.interceptors.response.use(
      (response) => {
        const {
          status,
          statusText,
          data,
          headers: { 'x-request-id': requestId },
        } = response;
        const responeseBody = KnapsackProLogger.objectInspect(data);

        this.knapsackProLogger.info(
          `${status} ${statusText}\n\n` +
            'Request ID:\n' +
            `${requestId}\n\n` +
            'Response body:\n' +
            `${responeseBody}`,
        );

        return response;
      },
      (error) => {
        const { response } = error;

        if (response) {
          const {
            status,
            statusText,
            data,
            headers: { 'x-request-id': requestId },
          } = response;
          const responeseBody = KnapsackProLogger.objectInspect(data);

          this.knapsackProLogger.error(
            `${status} ${statusText}\n\n` +
              'Request ID:\n' +
              `${requestId}\n\n` +
              'Response error body:\n' +
              `${responeseBody}`,
          );
        } else {
          this.knapsackProLogger.error(error);
        }

        return Promise.reject(error);
      },
    );

    return apiClient;
  }

  // based on isNetworkOrIdempotentRequestError function
  // https://github.com/softonic/axios-retry/blob/master/es/index.js
  private retryCondition(error: AxiosError): boolean {
    return (
      axiosRetry.isNetworkError(error) ||
      this.isRetriableRequestError(error) ||
      !this.isExpectedErrorStatus(error)
    );
  }

  // based on isIdempotentRequestError function
  // https://github.com/softonic/axios-retry/blob/master/es/index.js
  private isRetriableRequestError(error: AxiosError): boolean {
    if (!error.config) {
      // Cannot determine if the request can be retried
      return false;
    }

    return axiosRetry.isRetryableError(error);
  }

  private retryDelay(retryCount: number): number {
    const requestRetryTimebox = 8000; // milliseconds
    const delay = retryCount * requestRetryTimebox;
    const randomSum = delay * 0.2 * Math.random(); // 0-20% of the delay
    const finalDelay = delay + randomSum;

    this.knapsackProLogger.info(
      `(${retryCount}) Wait ${finalDelay} ms and retry request to Knapsack Pro API.`,
    );

    return finalDelay;
  }
}

import { describe, expect, it } from 'vitest';
import type { AxiosError } from 'axios';
import { APIError } from '../../src/http/Errors.js';

/**
 * The API error helper exposes a constructor plus a static factory that unwraps
 * Axios errors. These tests exercise both code paths so that consumers can rely
 * on the metadata being populated consistently.
 */
describe('APIError', () => {
  it('preserves metadata supplied to the constructor', () => {
    // Arrange: provide a structured options object as callers would during manual instantiation.
    const cause = new Error('upstream failure');
    const error = new APIError('Something went wrong', {
      status: 422,
      code: 'unprocessable',
      problem: { errors: ['boom'] },
      headers: { 'retry-after': '5' },
      requestId: 'req-123',
      method: 'PATCH',
      url: '/widgets/1',
      cause,
    });

    // Assert: every property is mirrored on the class instance to aid debugging.
    expect(error).toBeInstanceOf(APIError);
    expect(error.name).toBe('APIError');
    expect(error.message).toBe('Something went wrong');
    expect(error.status).toBe(422);
    expect(error.code).toBe('unprocessable');
    expect(error.problem).toEqual({ errors: ['boom'] });
    expect(error.headers).toEqual({ 'retry-after': '5' });
    expect(error.requestId).toBe('req-123');
    expect(error.method).toBe('PATCH');
    expect(error.url).toBe('/widgets/1');
    expect((error as unknown as { cause?: unknown }).cause).toBe(cause);
  });

  it('unwraps Axios errors and surfaces problem details', () => {
    // Arrange: craft a minimal AxiosError shape mirroring a failed API response.
    const axiosError = {
      isAxiosError: true,
      message: 'Request failed with status code 400',
      response: {
        status: 400,
        statusText: 'Bad Request',
        data: { errors: ['First API error'], code: 'bad_request' },
        headers: {
          'x-request-id': 'req-456',
        },
      },
      config: {
        method: 'post',
        url: '/projects',
      },
      toJSON: () => ({}),
      name: 'AxiosError',
    } as unknown as AxiosError;

    // Act: translate the Axios error into our SDK-specific error shape.
    const apiError = APIError.fromAxios(axiosError);

    // Assert: ensure the translation retains the relevant context.
    expect(apiError).toBeInstanceOf(APIError);
    expect(apiError.message).toBe('First API error');
    expect(apiError.status).toBe(400);
    expect(apiError.code).toBe('bad_request');
    expect(apiError.problem).toEqual({ errors: ['First API error'], code: 'bad_request' });
    expect(apiError.headers).toEqual({ 'x-request-id': 'req-456' });
    expect(apiError.requestId).toBe('req-456');
    expect(apiError.method).toBe('POST');
    expect(apiError.url).toBe('/projects');
  });
});

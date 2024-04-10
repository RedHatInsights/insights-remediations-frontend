/* eslint-disable testing-library/no-unnecessary-act */
import { useConnectionStatus } from '../Utilities/useConnectionStatus';
import { renderHook, act } from '@testing-library/react';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    __esModule: true,
    useAxiosWithPlatformInterceptors: jest.fn(),
  })
);

describe('useConnectionStatus', () => {
  const remediation = { id: '12345' };

  test('fires off a request and returns a true boolean if all values are true', async () => {
    useAxiosWithPlatformInterceptors.mockImplementation(() => ({
      get: () => {
        let res = { data: [{ connection_status: 'connected' }] };
        return res;
      },
    }));
    let hook;
    await act(async () => {
      hook = renderHook(() => useConnectionStatus(remediation));
    });
    const { result } = hook;

    expect(result.current[0]).toBe(true);
  });
  test('fires off a request and returns FALSE', async () => {
    useAxiosWithPlatformInterceptors.mockImplementation(() => ({
      get: () => {
        let res = { data: [{ connection_status: 'NOT CONNECTED' }] };
        return res;
      },
    }));
    let hook;
    await act(async () => {
      hook = renderHook(() => useConnectionStatus(remediation));
    });
    const { result } = hook;
    expect(result.current[0]).toBe(false);
  });
});

import { useConnectionStatus } from '../Utilities/useConnectionStatus';
import { renderHook } from '@testing-library/react-hooks';
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
    const { result, waitForNextUpdate } = renderHook(() =>
      useConnectionStatus(remediation)
    );

    await waitForNextUpdate();
    expect(result.current).toBe(true);
  });
  test('fires off a request and returns FALSE', async () => {
    useAxiosWithPlatformInterceptors.mockImplementation(() => ({
      get: () => {
        let res = { data: [{ connection_status: 'NOT CONNECTED' }] };
        return res;
      },
    }));
    const { result, waitForNextUpdate } = renderHook(() =>
      useConnectionStatus(remediation)
    );

    await waitForNextUpdate();
    expect(result.current).toBe(false);
  });
});

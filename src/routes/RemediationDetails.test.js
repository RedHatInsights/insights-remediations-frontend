/* eslint-disable testing-library/no-unnecessary-act */
import { useConnectionStatus } from '../Utilities/useConnectionStatus';
import { renderHook, act } from '@testing-library/react';

jest.mock('./api', () => ({
  API_BASE: '',
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    __esModule: true,
    useAxiosWithPlatformInterceptors: jest.fn(),
  }),
);

describe('useConnectionStatus', () => {
  const remediation = { id: '12345' };

  test('returns 1 connected system but 4 systems total', async () => {
    const mockAxios = {
      get: jest.fn().mockResolvedValue({
        data: [
          {
            system_count: 1,
            system_ids: ['826473e9-a5b9-4db7-99d6-d9f271bd8f4d'],
            connection_status: 'connected',
          },
          {
            system_count: 3,
            system_ids: ['cb2dd466-283d-4260-b97b-c433606961ab'],
            connection_status: 'disconnected',
          },
        ],
      }),
    };
    let hook;
    await act(async () => {
      hook = renderHook(() => useConnectionStatus(remediation.id, mockAxios));
    });
    const { result } = hook;

    expect(result.current[0]).toBe(1);
    expect(result.current[1]).toBe(4);
  });

  test('returns 0 connected systems and 1 system total', async () => {
    const mockAxios = {
      get: jest.fn().mockResolvedValue({
        data: [
          {
            system_count: 1,
            system_ids: ['826473e9-a5b9-4db7-99d6-d9f271bd8f4d'],
            connection_status: 'not_connected',
          },
        ],
      }),
    };
    let hook;
    await act(async () => {
      hook = renderHook(() => useConnectionStatus(remediation.id, mockAxios));
    });
    const { result } = hook;
    expect(result.current[0]).toBe(0);
    expect(result.current[1]).toBe(1);
  });
});

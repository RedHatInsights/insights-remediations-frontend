/* eslint-disable testing-library/no-unnecessary-act */
import { renderHook, act } from '@testing-library/react';

import { useConnectionStatus } from './useConnectionStatus';

jest.mock('../routes/api', () => ({
  API_BASE: '',
}));

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
    console.log(result, 'result here');
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

  test('handles error and sets error state', async () => {
    const errorObj = { errors: [{ status: 403 }] };
    const mockAxios = {
      get: jest.fn().mockRejectedValue(errorObj),
    };

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    let hook;
    await act(async () => {
      hook = renderHook(() => useConnectionStatus('bad-id', mockAxios));
    });

    const { result } = hook;
    await act(async () => {});

    expect(consoleErrorSpy).toHaveBeenCalledWith(errorObj);
    expect(result.current[2]).toBe(false); // areDetailsLoading
    expect(result.current[3]).toBe(403); // detailsError
    expect(result.current[4]).toBe(403); // connectedData

    consoleErrorSpy.mockRestore();
  });
});

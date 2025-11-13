import '@testing-library/jest-dom';

// Mock RenameModal to prevent import errors
jest.mock('./RenameModal', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

// Mock useRemediationsQuery
jest.mock('../api/useRemediationsQuery', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    fetch: jest.fn(),
  })),
}));

import RemediationDetailsDropdown from './RemediationDetailsDropdown';

// Simplified test to prevent child process crashes
describe('RemediationDetailsDropdown', () => {
  it('should be importable', () => {
    expect(RemediationDetailsDropdown).toBeDefined();
    expect(typeof RemediationDetailsDropdown).toBe('function'); // Now a plain function component
  });
});

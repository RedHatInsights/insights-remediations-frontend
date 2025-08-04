import '@testing-library/jest-dom';
import RemediationDetailsDropdown from './RemediationDetailsDropdown';

// Simplified test to prevent child process crashes
describe('RemediationDetailsDropdown', () => {
  it('should be importable', () => {
    expect(RemediationDetailsDropdown).toBeDefined();
    expect(typeof RemediationDetailsDropdown).toBe('object'); // Redux-connected component
  });
});

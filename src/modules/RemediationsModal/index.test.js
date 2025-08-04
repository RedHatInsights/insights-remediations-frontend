import RemediationsModal from './index';
import RemediationsWizard from './RemediationsWizard';

// Mock the RemediationsWizard component
jest.mock('./RemediationsWizard', () => {
  return jest.fn(() => 'MockedRemediationsWizard');
});

describe('RemediationsModal index', () => {
  it('should export RemediationsWizard as default', () => {
    expect(RemediationsModal).toBe(RemediationsWizard);
  });

  it('should properly re-export the default from RemediationsWizard', () => {
    expect(typeof RemediationsModal).toBe('function');
  });
});

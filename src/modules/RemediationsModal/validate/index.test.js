import validator, { validate } from './index';
import defaultValidator from './validator';

// Mock the validator module
jest.mock('./validator', () => {
  const mockValidator = jest.fn(() => ({ valid: true, errors: [] }));
  return mockValidator;
});

describe('validate/index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export default validator', () => {
    expect(validator).toBe(defaultValidator);
  });

  it('should export named validate as validator', () => {
    expect(validate).toBe(defaultValidator);
  });

  it('should export the same function for both default and named exports', () => {
    expect(validator).toBe(validate);
  });

  it('should correctly re-export validator functionality', () => {
    const testData = { test: 'data' };

    validator(testData);
    expect(defaultValidator).toHaveBeenCalledWith(testData);

    validate(testData);
    expect(defaultValidator).toHaveBeenCalledWith(testData);

    expect(defaultValidator).toHaveBeenCalledTimes(2);
  });
});

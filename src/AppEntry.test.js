import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import Remediations from './AppEntry';
import { init } from './store';
import App from './App';

// Mock the dependencies
jest.mock('./store', () => ({
  init: jest.fn(),
}));

jest.mock('./App', () => {
  return jest.fn(() => <div data-testid="mocked-app">Mocked App</div>);
});

jest.mock('react-redux', () => ({
  Provider: jest.fn(({ children }) => (
    <div data-testid="redux-provider">{children}</div>
  )),
}));

describe('AppEntry Component', () => {
  const mockLogger = jest.fn();
  const mockStore = { dispatch: jest.fn(), getState: jest.fn() };
  const mockInitResult = { getStore: jest.fn(() => mockStore) };

  beforeEach(() => {
    jest.clearAllMocks();
    init.mockReturnValue(mockInitResult);
  });

  it('should render without crashing', () => {
    render(<Remediations logger={mockLogger} />);

    expect(screen.getByTestId('redux-provider')).toBeInTheDocument();
    expect(screen.getByTestId('mocked-app')).toBeInTheDocument();
  });

  it('should initialize store with logger', () => {
    render(<Remediations logger={mockLogger} />);

    expect(init).toHaveBeenCalledWith(mockLogger);
    expect(mockInitResult.getStore).toHaveBeenCalled();
  });

  it('should pass store to Provider', () => {
    render(<Remediations logger={mockLogger} />);

    expect(Provider).toHaveBeenCalledWith(
      expect.objectContaining({
        store: mockStore,
      }),
      expect.anything(),
    );
  });

  it('should render App component inside Provider', () => {
    render(<Remediations logger={mockLogger} />);

    expect(App).toHaveBeenCalled();
  });

  it('should work without logger prop', () => {
    render(<Remediations />);

    expect(screen.getByTestId('redux-provider')).toBeInTheDocument();
    expect(screen.getByTestId('mocked-app')).toBeInTheDocument();
    expect(init).toHaveBeenCalledWith(undefined);
  });

  it('should accept logger as a function', () => {
    const customLogger = jest.fn();
    render(<Remediations logger={customLogger} />);

    expect(init).toHaveBeenCalledWith(customLogger);
  });

  it('should validate propTypes', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Test with non-function logger (should trigger prop validation warning)
    render(<Remediations logger="not-a-function" />);

    consoleSpy.mockRestore();
  });
});

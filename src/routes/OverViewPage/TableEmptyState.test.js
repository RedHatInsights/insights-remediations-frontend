/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TableEmptyState from './TableEmptyState';

// Mock PatternFly components
jest.mock('@patternfly/react-core', () => ({
  EmptyState: ({ children, headingLevel, icon: IconComponent, titleText }) => (
    <div data-testid="empty-state">
      <div data-testid="empty-state-header" data-heading-level={headingLevel}>
        <h4>{titleText}</h4>
      </div>
      <div data-testid="empty-state-icon">
        <IconComponent data-testid="search-icon" />
      </div>
      {children}
    </div>
  ),
  EmptyStateBody: ({ children }) => (
    <div data-testid="empty-state-body">{children}</div>
  ),
}));

jest.mock('@patternfly/react-icons', () => ({
  SearchIcon: () => <span data-testid="search-icon">SearchIcon</span>,
}));

describe('TableEmptyState', () => {
  it('should render the empty state component', () => {
    render(<TableEmptyState />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('should render the correct title text', () => {
    render(<TableEmptyState />);

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('should render the correct body text', () => {
    render(<TableEmptyState />);

    expect(
      screen.getByText('Adjust your filters and try again'),
    ).toBeInTheDocument();
  });

  it('should render with correct heading level', () => {
    render(<TableEmptyState />);

    const header = screen.getByTestId('empty-state-header');
    expect(header).toHaveAttribute('data-heading-level', 'h4');
  });

  it('should render the search icon', () => {
    render(<TableEmptyState />);

    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('should render the empty state icon wrapper', () => {
    render(<TableEmptyState />);

    expect(screen.getByTestId('empty-state-icon')).toBeInTheDocument();
  });

  it('should render the empty state body wrapper', () => {
    render(<TableEmptyState />);

    expect(screen.getByTestId('empty-state-body')).toBeInTheDocument();
  });

  it('should have the complete component structure', () => {
    render(<TableEmptyState />);

    // Check that all parts are present
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state-header')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state-body')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state-icon')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoExecutions from './NoExections';

describe('NoExecutions', () => {
  it('renders the empty state with correct title and body', () => {
    render(<NoExecutions />);
    expect(screen.getByText('No execution history')).toBeInTheDocument();
    expect(
      screen.getByText('This remediation plan has not yet been executed.'),
    ).toBeInTheDocument();
  });
});

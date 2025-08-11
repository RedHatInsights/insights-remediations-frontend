import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RebootColumn from './RebootColumn';

describe('RebootColumn', () => {
  it('should render "Yes" when rebootRequired is true', () => {
    render(<RebootColumn rebootRequired={true} />);

    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('should render "No" when rebootRequired is false', () => {
    render(<RebootColumn rebootRequired={false} />);

    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('should render "No" when rebootRequired is undefined', () => {
    render(<RebootColumn />);

    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('should render "No" when rebootRequired is null', () => {
    render(<RebootColumn rebootRequired={null} />);

    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('should render "Yes" when rebootRequired is truthy', () => {
    render(<RebootColumn rebootRequired="true" />);

    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('should render "No" when rebootRequired is falsy', () => {
    render(<RebootColumn rebootRequired="" />);

    expect(screen.getByText('No')).toBeInTheDocument();
  });
});

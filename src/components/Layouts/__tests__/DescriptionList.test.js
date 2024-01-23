import React from 'react';
import { render, screen } from '@testing-library/react';
import DescriptionList from '../DescriptionList';
import '@testing-library/jest-dom';

describe('DescriptionList component', () => {
  it('should render', () => {
    render(
      <DescriptionList title="description-title">
        test-description-list
      </DescriptionList>
    );
    expect(screen.getByText('description-title')).toBeVisible();
    expect(screen.getByText('test-description-list')).toBeVisible();
  });

  it('should render with bold', () => {
    render(
      <DescriptionList isBold title="description-title">
        test-description-list
      </DescriptionList>
    );

    const ddElement = screen.getByText('test-description-list');
    // eslint-disable-next-line testing-library/no-node-access
    expect(ddElement.closest('dd')).toHaveClass(
      'rem-c-description-list__description--bold'
    );
  });
});

import React from 'react';
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';
import FetchError from '../../RemediationsModal/steps/fetchError';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

const RendererWrapper = () => (
  <FormRenderer
    onSubmit={() => {}}
    FormTemplate={FormTemplate}
    componentMapper={{
      'fetch-error': FetchError,
    }}
    schema={{
      fields: [
        {
          name: 'fetch-error',
          component: 'fetch-error',
        },
      ],
    }}
  />
);

describe('FetchError', () => {
  it('should render correctly ', async () => {
    render(<RendererWrapper />);
    expect(screen.getByText('Unexpected error')).toBeVisible();
    expect(screen.getByText('Please try again later.')).toBeVisible();
    expect(
      screen.getByText('Hint: No resolutions for selected issues.')
    ).toBeVisible();
  });
});

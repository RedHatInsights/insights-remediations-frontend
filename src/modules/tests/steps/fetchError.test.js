import React from 'react';
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';
import { mount } from 'enzyme';
import FetchError from '../../RemediationsModal/steps/fetchError';
import { EmptyState } from '@patternfly/react-core';

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
    let wrapper = mount(<RendererWrapper />);
    expect(wrapper.find(EmptyState)).toHaveLength(1);
  });
});

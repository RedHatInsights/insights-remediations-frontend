import React from 'react';
import propTypes from 'prop-types';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import {
  EmptyState,
  EmptyStateVariant,
  EmptyStateBody,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

const FetchError = (props) => {
  const { resolutionsCount } = props;

  const { input } = useFieldApi(props);
  input.valid = false;

  return (
    <EmptyState
      headingLevel="h4"
      icon={ExclamationCircleIcon}
      titleText="Unexpected error"
      variant={EmptyStateVariant.sm}
      data-component-ouia-id="wizard-fetch-error"
    >
      <EmptyStateBody>
        Please try again later.{' '}
        {resolutionsCount !== 0 && (
          <div>Hint: No resolutions for selected issues.</div>
        )}
      </EmptyStateBody>
    </EmptyState>
  );
};

FetchError.propTypes = {
  resolutionsCount: propTypes.number,
};

export default FetchError;

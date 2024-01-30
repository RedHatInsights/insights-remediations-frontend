import React from 'react';
import propTypes from 'prop-types';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import {
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateHeader,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import red from '@patternfly/react-tokens/dist/js/global_palette_red_100';

const FetchError = (props) => {
  const { resolutionsCount } = props;

  const { input } = useFieldApi(props);
  input.valid = false;

  return (
    <EmptyState
      variant={EmptyStateVariant.sm}
      data-component-ouia-id="wizard-fetch-error"
    >
      <EmptyStateHeader
        titleText="Unexpected error"
        icon={<EmptyStateIcon color={red.value} icon={ExclamationCircleIcon} />}
        headingLevel="h4"
      />
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

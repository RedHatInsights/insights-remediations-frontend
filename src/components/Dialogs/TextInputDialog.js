import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  FormGroup,
  Modal,
  TextInput,
  ModalVariant,
  Spinner,
  ValidatedOptions,
  TextVariants,
} from '@patternfly/react-core';
import { useVerifyName } from '../../Utilities/useVerifyName';

export default function TextInputDialog(props) {
  const [value, setValue] = useState(props.value || '');
  const { title, onCancel, onSubmit, ariaLabel, className } = props;

  const [isVerifyingName, isDisabled] = useVerifyName(
    value,
    props.remediationsList,
  );

  const nameStatus = (() => {
    if (isVerifyingName) return 'checking';
    if (value.trim() === '') return 'empty';
    if (value === props.value) return 'unchanged';
    if (isDisabled) return 'duplicate';
    return 'valid';
  })();

  const validationState = ['empty', 'duplicate'].includes(nameStatus)
    ? ValidatedOptions.error
    : ValidatedOptions.default;

  return (
    <Modal
      title={title}
      isOpen={true}
      onClose={(event) => onCancel(event)}
      actions={[
        nameStatus === 'checking' ? (
          <Spinner size="lg" className="pf-u-mr-sm" />
        ) : (
          <Button
            key="confirm"
            variant="primary"
            onClick={() => onSubmit(value)}
            isDisabled={nameStatus !== 'valid'}
            ouiaId="save"
          >
            Rename
          </Button>
        ),
        <Button
          key="cancel"
          variant="secondary"
          onClick={onCancel}
          ouiaId="cancel"
        >
          Cancel
        </Button>,
      ]}
      variant={ModalVariant.small}
      className={className}
    >
      <FormGroup
        fieldId="remediation-name"
        helperTextInvalid="Playbook name has to contain alphanumeric characters"
        isValid={nameStatus !== 'empty' && nameStatus !== 'duplicate'}
      >
        <TextVariants.p className="pf-v5-u-font-weight-bold">
          Name
        </TextVariants.p>

        <TextInput
          value={value}
          type="text"
          onChange={(_event, value) => setValue(value)}
          aria-label={ariaLabel || 'input text'}
          autoFocus
          isValid={nameStatus !== 'empty' && nameStatus !== 'duplicate'}
          validated={validationState}
        />
        {nameStatus === 'duplicate' && (
          <p className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100">
            A remediation plan with the same name already exists in your
            organization. Enter a unique name and try again.
          </p>
        )}
        {nameStatus === 'empty' && (
          <p className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100">
            Playbook name cannot be empty.
          </p>
        )}
      </FormGroup>
    </Modal>
  );
}

TextInputDialog.propTypes = {
  title: PropTypes.string.isRequired,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  ariaLabel: PropTypes.string,
  value: PropTypes.string,
  className: PropTypes.string,
  pattern: PropTypes.instanceOf(RegExp),
  remediationsList: PropTypes.array,
};

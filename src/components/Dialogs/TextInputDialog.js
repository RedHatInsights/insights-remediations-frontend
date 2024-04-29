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
} from '@patternfly/react-core';
import { useVerifyName } from '../../Utilities/useVerifyName';

export default function TextInputDialog(props) {
  const [value, setValue] = useState(props.value || '');
  const [valid, setValid] = useState(true);
  const { title, onCancel, onSubmit, ariaLabel, className } = props;

  function onChange(value) {
    setValue(value);

    if (props.pattern) {
      setValid(props.pattern.test(value));
    }
  }

  const [isVerifyingName, isDisabled] = useVerifyName(
    value,
    props.remediationsList
  );

  return (
    <Modal
      title={title}
      isOpen={true}
      onClose={(event) => onCancel(event)}
      actions={[
        isVerifyingName ? (
          <Spinner size="lg" className="pf-u-mr-sm" />
        ) : (
          <Button
            key="confirm"
            variant="primary"
            onClick={() => onSubmit(value)}
            isDisabled={!valid || isVerifyingName || isDisabled}
            ouiaId="save"
          >
            Save
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
        isValid={valid}
      >
        <TextInput
          value={value}
          type="text"
          onChange={(_event, value) => onChange(value)}
          aria-label={ariaLabel || 'input text'}
          autoFocus
          isValid={valid}
          validated={(isDisabled || !valid) && ValidatedOptions.error}
        />
        {isDisabled && (
          <p className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100">
            Playbook with the same name already exists.
          </p>
        )}
        {!valid && (
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

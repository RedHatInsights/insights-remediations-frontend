import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
    Button,
    FormGroup,
    Modal,
    TextInput
} from '@patternfly/react-core';

export default function TextInputDialog (props) {
    const [ value, setValue ] = useState(props.value || '');
    const [ valid, setValid ] = useState(true);
    const { title, onCancel, onSubmit, ariaLabel } = props;

    function onChange (value) {
        setValue(value);

        if (props.pattern) {
            setValid(props.pattern.test(value));
        }
    }

    return (
        <Modal
            title={ title }
            isOpen={ true }
            onClose={ event => onCancel(event) }
            actions={ [
                <Button key="cancel" variant="secondary" onClick={ onCancel }>
                    Cancel
                </Button>,
                <Button key="confirm" variant="primary" onClick={ () => onSubmit(value) } isDisabled={ !valid }>
                    Save
                </Button>
            ] }
            isLarge
        >
            <FormGroup
                fieldId="remediation-name"
                helperTextInvalid="Playbook name has to contain alphanumeric characters"
                isValid={ valid }
            >
                <TextInput
                    value={ value }
                    type="text"
                    onChange={ onChange }
                    aria-label={ ariaLabel || 'input text' }
                    autoFocus
                    isValid={ valid }
                />
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
    pattern: PropTypes.instanceOf(RegExp)
};


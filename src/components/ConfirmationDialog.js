import React from 'react';
import PropTypes from 'prop-types';

import {
    Button,
    Modal
} from '@patternfly/react-core';

export default function ConfirmationDialog ({
    isOpen = true,
    title = 'Are you sure?',
    text = 'This action cannot be undone',
    onClose = f=>f
}) {

    return (
        <Modal
            className="ins-c-dialog"
            isLarge={ true }
            title={ title }
            isOpen={ isOpen }
            onClose={ () => onClose(false) }
            actions={ [
                <Button key="cancel" variant="secondary" onClick={ () => onClose(false) }>Cancel</Button>,
                <Button key="confirm" variant="primary" onClick={ () => onClose(true) }>Confirm</Button>
            ] }
        >
            <h2>{ text }</h2>
        </Modal>
    );
}

ConfirmationDialog.propTypes = {
    isOpen: PropTypes.bool,
    title: PropTypes.string,
    text: PropTypes.string,
    onClose: PropTypes.func
};

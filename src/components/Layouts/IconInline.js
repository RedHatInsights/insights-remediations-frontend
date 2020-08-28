import React from 'react';
import PropTypes from 'prop-types';
import { Split, SplitItem } from '@patternfly/react-core';
import './IconInline.scss';

export const IconInline = ({
    icon,
    text
}) => {

    return (
        <Split hasGutter className='ins-c-icon-inline__split'>
            <SplitItem>
                { icon }
            </SplitItem>
            <SplitItem>
                { text }
            </SplitItem>
        </Split>
    );

};

IconInline.propTypes = {
    icon: PropTypes.object,
    text: PropTypes.string
};

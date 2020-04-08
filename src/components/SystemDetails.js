/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Skeleton } from '@redhat-cloud-services/frontend-components';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { Spinner } from '@patternfly/react-core';
import classnames from 'classnames';

import './SystemDetails.scss';

const PlaybookSystemDetails = ({ systemId, playbookRunSystemDetails }) => {
    
    const outputClasses = classnames(
        'ins-c-job-output',
        { ['ins-c-job-output__finished']: playbookRunSystemDetails.status !== 'running' }
    );

    return <React.Fragment>
        { systemId && systemId === playbookRunSystemDetails.system_id ?
            <React.Fragment>
                <SyntaxHighlighter
                    language="yaml"
                    showLineNumbers
                    className={outputClasses}>
                    { playbookRunSystemDetails && playbookRunSystemDetails.console || '' }
                </SyntaxHighlighter>
                { playbookRunSystemDetails.status === 'running' && 
                    <div className='ins-l-playbook-running'>
                        <Spinner size='lg' aria-valuetext='playbook in progress' className='ins-c-spinner__playbook-running'/>
                    </div>
                }
            </React.Fragment>
            : <Skeleton size='lg' /> }
    </React.Fragment>;
};

PlaybookSystemDetails.propTypes = {
    systemId: PropTypes.string,
    playbookRunSystemDetails: PropTypes.shape({
        system_id: PropTypes.string
    })

};

PlaybookSystemDetails.defaultProps = {
    playbookRunSystemDetails: { }

};

export default connect(({ playbookRunSystemDetails }) => ({
    playbookRunSystemDetails
})) (PlaybookSystemDetails);

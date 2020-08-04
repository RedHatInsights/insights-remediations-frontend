/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Skeleton } from '@redhat-cloud-services/frontend-components';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/light';
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml';
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/docco';

import { Spinner } from '@patternfly/react-core';
import classnames from 'classnames';

import { Title } from '@patternfly/react-core';

import './SystemDetails.scss';

SyntaxHighlighter.registerLanguage('yaml', yaml);

const PlaybookSystemDetails = ({ systemId, playbookRunSystemDetails }) => {

    const outputClasses = classnames(
        'ins-c-job-output',
        { ['ins-c-job-output__finished']: playbookRunSystemDetails.status !== 'running' }
    );

    return <React.Fragment>
        <Title headingLevel="h4" size="xl" className='ins-c-job-output__title'>Playbook log</Title>
        { systemId && systemId === playbookRunSystemDetails.system_id ?
            <React.Fragment>
                <SyntaxHighlighter
                    language="yaml"
                    showLineNumbers
                    style={ docco }
                    className={ outputClasses }>
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
    status: PropTypes.string,
    console: PropTypes.string,
    playbookRunSystemDetails: PropTypes.shape({
        system_id: PropTypes.string,
        status: PropTypes.string,
        console: PropTypes.string
    })

};

PlaybookSystemDetails.defaultProps = {
    playbookRunSystemDetails: { }

};

export default connect(({ playbookRunSystemDetails }) => ({
    playbookRunSystemDetails
})) (PlaybookSystemDetails);

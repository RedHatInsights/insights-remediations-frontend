/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Skeleton } from '@redhat-cloud-services/frontend-components';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const PlaybookSystemDetails = ({ systemId, playbookRunSystemDetails }) => {
    return <React.Fragment>
        { systemId && systemId === playbookRunSystemDetails.system_id ? <SyntaxHighlighter language="yaml" style={ dark }>
            { playbookRunSystemDetails && playbookRunSystemDetails.console || '' }
        </SyntaxHighlighter> : <Skeleton size='lg' /> }
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

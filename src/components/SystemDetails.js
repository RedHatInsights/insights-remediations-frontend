/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Skeleton } from '@redhat-cloud-services/frontend-components/Skeleton';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/light';
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml';
import RemediationsLogViewer from './RemediationsLogViewer';

import { Spinner } from '@patternfly/react-core';
import { Title } from '@patternfly/react-core';

import './SystemDetails.scss';

SyntaxHighlighter.registerLanguage('yaml', yaml);

const PlaybookSystemDetails = ({ systemId, playbookRunSystemDetails }) => {
  return (
    <React.Fragment>
      <Title headingLevel="h4" size="xl" className="ins-c-job-output__title">
        Playbook log
      </Title>
      {systemId && systemId === playbookRunSystemDetails.system_id ? (
        <React.Fragment>
          <RemediationsLogViewer data={playbookRunSystemDetails.console} />
          {playbookRunSystemDetails.status === 'running' && (
            <div className="rem-l-playbook-running">
              <Spinner
                size="lg"
                aria-valuetext="playbook in progress"
                className="ins-c-spinner__playbook-running"
              />
            </div>
          )}
        </React.Fragment>
      ) : (
        <Skeleton size="lg" />
      )}
    </React.Fragment>
  );
};

PlaybookSystemDetails.propTypes = {
  systemId: PropTypes.string,
  status: PropTypes.string,
  console: PropTypes.string,
  playbookRunSystemDetails: PropTypes.shape({
    system_id: PropTypes.string,
    status: PropTypes.string,
    console: PropTypes.string,
  }),
};

PlaybookSystemDetails.defaultProps = {
  playbookRunSystemDetails: {},
};

export default connect(({ playbookRunSystemDetails }) => ({
  playbookRunSystemDetails,
}))(PlaybookSystemDetails);

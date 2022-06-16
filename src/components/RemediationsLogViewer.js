import React from 'react';
import PropTypes from 'prop-types';
import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';
import { Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';

const RemediationsLogViewer = ({ data }) => {
  // New line after each line
  data = data.replaceAll('\n', '\n\n').slice(0, -1);

  return (
    <LogViewer
      data={data}
      toolbar={
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <LogViewerSearch placeholder="Search" />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      }
    />
  );
};

RemediationsLogViewer.propTypes = {
  data: PropTypes.string,
};

export default RemediationsLogViewer;

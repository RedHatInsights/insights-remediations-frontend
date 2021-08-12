import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  LogViewer,
  LogViewerSearch
} from '@patternfly/react-log-viewer';
import { Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';

const RemediationsLogViewer = ({ data }) => {

  useEffect(() => {
    console.log('Testing what we get into logger: ', data);
  }, [data]);

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
  )
};

RemediationsLogViewer.propTypes = {
  data: PropTypes.string,
}

export default RemediationsLogViewer;

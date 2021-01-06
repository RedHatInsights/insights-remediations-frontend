import React from 'react';
import { Tabs, Tab, TabTitleText } from '@patternfly/react-core';

const SkeletonTabs = () => {
  return (
    <Tabs activeKey={0} className="ins-s-tabs">
      <Tab eventKey={0} title={<TabTitleText>Actions</TabTitleText>} />
      <Tab eventKey={1} title={<TabTitleText>Activity</TabTitleText>} />
    </Tabs>
  );
};

export default SkeletonTabs;

import React from 'react';
import PropTypes from 'prop-types';
import {
  Flex,
  FlexItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { ChartDonutUtilization, ChartLabel } from '@patternfly/react-charts';
import DescriptionList from '../Layouts/DescriptionList';
import './RemediationSummary.scss';
import { renderLatestActivity, renderAutoReboot } from './summaryHelpers';

export const RemediationSummary = ({
  refetchRemediation,
  playbookRuns,
  switchAutoReboot,
  context,
  statusCounts,
}) => {
  const pluralize = (number, str) =>
    number === 1 ? `${number} ${str}` : `${number} ${str}s`;

  const remediation = refetchRemediation();

  const { stats, resolved_count: resolvedCount } = remediation;

  const totalSystems = stats.systemsWithReboot + stats.systemsWithoutReboot;

  return (
    <Split>
      <SplitItem>
        <ChartDonutUtilization
          ariaDesc="Resolved issues count"
          ariaTitle="Resolved issues chart"
          constrainToVisibleArea={true}
          data={{
            x: 'Resolved',
            y: (resolvedCount / remediation.issues.length) * 100,
          }}
          labels={({ data }) => (data.x ? `${data.x}: ${data.y}%` : null)}
          title={`${resolvedCount}/${remediation.issues.length}`}
          subTitle="Issues resolved"
          subTitleComponent={<ChartLabel y={102} />}
          thresholds={[{ value: 100, color: '#3E8635' }]}
          height={175}
          width={175}
          padding={{
            bottom: 20,
            left: 0,
            right: 20,
            top: 20,
          }}
        />
      </SplitItem>
      <SplitItem className="ins-c-remediation-summary__body">
        <Stack hasGutter>
          <StackItem>
            <Split>
              <SplitItem>
                <Flex>
                  <FlexItem spacer={{ default: 'spacer-lg' }}>
                    <DescriptionList title="Total systems">
                      {pluralize(totalSystems, 'system')}
                    </DescriptionList>
                  </FlexItem>
                </Flex>
              </SplitItem>
              <SplitItem>
                <Flex>
                  {playbookRuns &&
                    renderLatestActivity(playbookRuns, statusCounts)}
                </Flex>
              </SplitItem>
            </Split>
          </StackItem>
          <StackItem>
            {renderAutoReboot(remediation, switchAutoReboot, context)}
          </StackItem>
        </Stack>
      </SplitItem>
    </Split>
  );
};

RemediationSummary.propTypes = {
  refetchRemediation: PropTypes.func.isRequired,
  playbookRuns: PropTypes.array,
  switchAutoReboot: PropTypes.func.isRequired,
  context: PropTypes.object.isRequired,
  statusCounts: PropTypes.object,
  remediationID: PropTypes.string.isRequired,
};

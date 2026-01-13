import React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import { ChartBullet } from '@patternfly/react-charts';
import { pluralize } from '../../Utilities/utils';
import { renderChartSkeleton } from '../helpers';
import propTypes from 'prop-types';

export const PlanSummaryCharts = ({
  actionsCount,
  systemsCount,
  issuesCount,
  detailsLoading,
  isExistingPlanSelected,
  smallerFont = false,
}) => {
  const ACTIONS_MAX = 1000;
  const SYSTEMS_MAX = 100;

  const clampedActionsCount = Math.min(actionsCount, ACTIONS_MAX);
  const clampedSystemsCount = Math.min(systemsCount, SYSTEMS_MAX);

  const flexDirection =
    detailsLoading && isExistingPlanSelected
      ? { default: 'row' }
      : { default: 'column', md: 'row' };

  return (
    <Flex
      className="pf-v6-u-mt-lg"
      gap={{ default: 'gapMd' }}
      direction={flexDirection}
      flexWrap={{ default: 'nowrap' }}
    >
      {/* Actions / Points chart */}
      <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: 0 }}>
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            {detailsLoading && isExistingPlanSelected ? (
              renderChartSkeleton()
            ) : (
              <>
                <div id="actions-chart-container">
                  <ChartBullet
                    ariaDesc="Action points bullet chart"
                    ariaTitle="Action points"
                    name="actions-chart"
                    comparativeWarningMeasureData={[
                      { name: 'Warning', y: ACTIONS_MAX },
                    ]}
                    title="Actions"
                    subTitle={pluralize(actionsCount, 'point')}
                    height={120}
                    padding={{
                      bottom: 50,
                      left: 100,
                      right: 50,
                      top: 50,
                    }}
                    labels={({ datum }) => {
                      if (datum.name === 'total') {
                        return `${pluralize(
                          issuesCount,
                          'action',
                        )}, ${pluralize(actionsCount, 'point')}`;
                      }
                      return `${datum.name}: ${datum.y}`;
                    }}
                    maxDomain={{ y: ACTIONS_MAX }}
                    primarySegmentedMeasureData={[
                      { name: 'total', y: clampedActionsCount },
                    ]}
                  />
                </div>
                <FlexItem alignSelf={{ default: 'alignSelfFlexEnd' }}>
                  <Flex justifyContent={{ default: 'justifyContentFlexEnd' }}>
                    <FlexItem
                      className={smallerFont ? 'pf-v6-u-font-size-sm' : ''}
                    >
                      {ACTIONS_MAX} points maximum
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </>
            )}
          </FlexItem>
        </Flex>
      </FlexItem>

      {/* Systems chart */}
      <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: 0 }}>
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            {detailsLoading && isExistingPlanSelected ? (
              renderChartSkeleton()
            ) : (
              <div id="systems-chart-container">
                <ChartBullet
                  ariaDesc="Systems bullet chart"
                  ariaTitle="Systems"
                  name="systems-chart"
                  comparativeWarningMeasureData={[
                    { name: 'Warning', y: SYSTEMS_MAX },
                  ]}
                  title="Systems"
                  subTitle={pluralize(systemsCount, 'system')}
                  height={120}
                  padding={{
                    bottom: 50,
                    left: 100,
                    right: 50,
                    top: 50,
                  }}
                  labels={({ datum }) => {
                    if (datum.name === 'total') {
                      return pluralize(systemsCount, 'system');
                    }
                    return `${datum.name}: ${datum.y}`;
                  }}
                  maxDomain={{ y: SYSTEMS_MAX }}
                  primarySegmentedMeasureData={[
                    { name: 'total', y: clampedSystemsCount },
                  ]}
                />
              </div>
            )}
          </FlexItem>
          <FlexItem alignSelf={{ default: 'alignSelfFlexEnd' }}>
            <Flex justifyContent={{ default: 'justifyContentFlexEnd' }}>
              <FlexItem className={smallerFont ? 'pf-v6-u-font-size-sm' : ''}>
                {SYSTEMS_MAX} systems maximum
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </FlexItem>
    </Flex>
  );
};

PlanSummaryCharts.propTypes = {
  actionsCount: propTypes.number.isRequired,
  systemsCount: propTypes.number.isRequired,
  issuesCount: propTypes.number.isRequired,
  detailsLoading: propTypes.bool.isRequired,
  isExistingPlanSelected: propTypes.bool.isRequired,
  smallerFont: propTypes.bool,
};

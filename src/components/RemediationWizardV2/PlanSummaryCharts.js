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
}) => {
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
                      { name: 'Warning', y: 1000 },
                    ]}
                    comparativeWarningMeasureLegendData={[
                      { name: 'Warning at 1000' },
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
                      // Show both actions and points in the tooltip
                      if (datum.name === 'actions' || datum.name === 'points') {
                        return `${pluralize(issuesCount, 'action')}, ${pluralize(actionsCount, 'point')}`;
                      }
                      return `${datum.name}: ${datum.y}`;
                    }}
                    maxDomain={{ y: 1000 }}
                    primarySegmentedMeasureData={[
                      { name: 'actions', y: issuesCount },
                      { name: 'points', y: actionsCount },
                    ]}
                    primarySegmentedMeasureLegendData={[
                      {
                        name: `${pluralize(issuesCount, 'action')}, ${pluralize(actionsCount, 'point')}`,
                      },
                    ]}
                  />
                </div>
                <FlexItem alignSelf={{ default: 'alignSelfFlexEnd' }}>
                  <Flex justifyContent={{ default: 'justifyContentFlexEnd' }}>
                    <FlexItem style={{ paddingRight: '50px' }}>
                      1000 points maximum
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </>
            )}
          </FlexItem>
        </Flex>
      </FlexItem>
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
                  comparativeWarningMeasureData={[{ name: 'Warning', y: 100 }]}
                  comparativeWarningMeasureLegendData={[
                    { name: 'Warning at 100' },
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
                    // Show systems count in "# systems" format
                    if (datum.name === 'systems') {
                      return ` ${pluralize(datum.y, 'system')}`;
                    }
                    return `${datum.name}: ${datum.y}`;
                  }}
                  maxDomain={{ y: 100 }}
                  primarySegmentedMeasureData={[
                    { name: 'systems', y: systemsCount },
                  ]}
                  primarySegmentedMeasureLegendData={[
                    {
                      name: `${systemsCount} ${pluralize(systemsCount, 'system')}`,
                    },
                  ]}
                />
              </div>
            )}
          </FlexItem>
          <FlexItem alignSelf={{ default: 'alignSelfFlexEnd' }}>
            <Flex justifyContent={{ default: 'justifyContentFlexEnd' }}>
              <FlexItem style={{ paddingRight: '50px' }}>
                100 systems maximum
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
};

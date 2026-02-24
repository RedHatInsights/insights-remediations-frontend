import React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import { ChartAxis, ChartBullet } from '@patternfly/react-charts';
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
  const ACTIONS_MAX = 1000;
  const SYSTEMS_MAX = 100;
  const ACTIONS_MAX_DISPLAY = 1250;
  const SYSTEMS_MAX_DISPLAY = 125;

  const clampedActionsCount = Math.min(actionsCount, ACTIONS_MAX_DISPLAY);
  const clampedSystemsCount = Math.min(systemsCount, SYSTEMS_MAX_DISPLAY);

  const actionsExceedsLimit = actionsCount > ACTIONS_MAX;
  const systemsExceedsLimit = systemsCount > SYSTEMS_MAX;

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
                      { name: 'Execution limit', y: ACTIONS_MAX },
                    ]}
                    title={pluralize(actionsCount, 'Action point')}
                    labels={({ datum }) => {
                      if (datum.name === 'total') {
                        return `${pluralize(
                          issuesCount,
                          'action',
                        )}, ${pluralize(actionsCount, 'point')}`;
                      }
                      if (datum.name === 'Execution limit') {
                        return `${datum.name}: ${datum.y} pts`;
                      }
                      return `${datum.name}: ${datum.y}`;
                    }}
                    {...(actionsExceedsLimit && { themeColor: 'gold' })}
                    height={120}
                    padding={{
                      bottom: 50,
                      left: 200,
                      right: 50,
                    }}
                    maxDomain={{ y: 1250 }}
                    primarySegmentedMeasureData={[
                      {
                        name: 'total',
                        y: clampedActionsCount,
                      },
                    ]}
                    axisComponent={
                      <ChartAxis
                        tickValues={[0, 250, 500, 750, 1000, 1250]}
                        tickFormat={(val) => {
                          switch (val) {
                            case 0:
                              return '0';
                            case 250:
                              return '250';
                            case 500:
                              return '500';
                            case 750:
                              return '750';
                            case 1000:
                              return '1000';
                            case 1250:
                              return '1250';
                            default:
                              return '';
                          }
                        }}
                      />
                    }
                  />
                </div>
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
                    { name: 'Execution limit', y: SYSTEMS_MAX },
                  ]}
                  title={pluralize(systemsCount, 'System')}
                  labels={({ datum }) => {
                    if (datum.name === 'total') {
                      return pluralize(systemsCount, 'system');
                    }
                    if (datum.name === 'Execution limit') {
                      return `${datum.name}: ${datum.y} systems`;
                    }
                    return `${datum.name}: ${datum.y}`;
                  }}
                  {...(systemsExceedsLimit && { themeColor: 'gold' })}
                  height={120}
                  padding={{
                    bottom: 50,
                    left: 175,
                    right: 50,
                  }}
                  maxDomain={{ y: 125 }}
                  primarySegmentedMeasureData={[
                    {
                      name: 'total',
                      y: clampedSystemsCount,
                    },
                  ]}
                  axisComponent={
                    <ChartAxis
                      tickValues={[0, 25, 50, 75, 100, 125]}
                      tickFormat={(val) => {
                        switch (val) {
                          case 0:
                            return '0';
                          case 25:
                            return '25';
                          case 50:
                            return '50';
                          case 75:
                            return '75';
                          case 100:
                            return '100';
                          case 125:
                            return '125';
                          default:
                            return '';
                        }
                      }}
                    />
                  }
                />
              </div>
            )}
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

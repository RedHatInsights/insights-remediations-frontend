import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Flex,
  FlexItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { ChartDonutUtilization, ChartLabel } from '@patternfly/react-charts';
import {
  CheckCircleIcon,
  OffIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import DescriptionList from '../components/Layouts/DescriptionList';
import classnames from 'classnames';
import { StatusSummary } from '../components/statusHelper';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import './RemediationSummary.scss';

export const RemediationSummary = ({
  remediation,
  playbookRuns,
  switchAutoReboot,
  context,
}) => {
  const handleRebootChange = (autoReboot) => {
    switchAutoReboot(remediation.id, autoReboot);
  };

  const generateNumIssuesReboot = () => {
    let count = 0;
    for (const issue of remediation.issues) {
      if (issue.resolution.needs_reboot) {
        count++;
      }
    }

    return count;
  };

  const generateNumRebootString = (num) => {
    return `${num} issue${num === 1 ? '' : 's'} require${
      num === 1 ? 's' : ''
    } reboot to remediate`;
  };

  const pluralize = (number, str) =>
    number === 1 ? `${number} ${str}` : `${number} ${str}s`;

  const rebootEnabled = () => {
    return (
      <div>
        <CheckCircleIcon className="rem-c-success" />
        <b className="ins-c-remediation-summary__reboot--enabled"> Enabled </b>
        {context.permissions.write && (
          <Button
            variant="link"
            onClick={() => handleRebootChange(!remediation.auto_reboot)}
          >
            Turn off
          </Button>
        )}
      </div>
    );
  };

  const rebootDisabled = (required) => {
    return (
      <div>
        <OffIcon />
        <b
          className={`ins-c-remediation-summary__reboot--disabled${
            required ? '--warning' : ''
          }`}
        >
          Off
        </b>
        {required && (
          <React.Fragment>
            <ExclamationTriangleIcon className="ins-c-remediation-summary__reboot--required--icon" />
            <b className="ins-c-remediation-summary__reboot--required">
              {generateNumRebootString(generateNumIssuesReboot())}
            </b>
          </React.Fragment>
        )}
        {context.permissions.write && (
          <Button
            variant="link"
            onClick={() => handleRebootChange(!remediation.auto_reboot)}
          >
            Turn on
          </Button>
        )}
      </div>
    );
  };

  const generateAutoRebootStatus = (status, needsReboot) => {
    return status ? rebootEnabled() : rebootDisabled(needsReboot);
  };

  const renderAutoReboot = (remediation) => {
    return (
      <DescriptionList
        className="rem-c-playbookSummary__settings"
        title="Autoreboot"
      >
        <Flex>
          <FlexItem
            className={classnames(
              'ins-c-reboot-status',
              {
                'ins-c-reboot-status__enabled':
                  remediation.auto_reboot && remediation.needs_reboot,
              },
              { 'ins-c-reboot-status__disabled': !remediation.auto_reboot }
            )}
            spacer={{ default: 'spacer-xl' }}
          >
            {generateAutoRebootStatus(
              remediation.auto_reboot,
              remediation.needs_reboot
            )}
          </FlexItem>
        </Flex>
      </DescriptionList>
    );
  };

  const renderLatestActivity = (playbookRuns) => {
    if (playbookRuns.length) {
      const mostRecent = playbookRuns[0];
      return (
        <FlexItem spacer={{ default: 'spacer-xl' }}>
          <DescriptionList
            needsPointer
            className="ins-c-latest-activity"
            title="Latest activity"
          >
            <StatusSummary
              executorStatus={mostRecent.status}
              counts={mostRecent.executors.reduce(
                (acc, ex) => ({
                  pending: acc.pending + ex.counts.pending,
                  running: acc.running + ex.counts.running,
                  success: acc.success + ex.counts.success,
                  failure: acc.failure + ex.counts.failure,
                  canceled: acc.canceled + ex.counts.canceled,
                  acked: acc.acked + ex.counts.acked,
                }),
                {
                  pending: 0,
                  running: 0,
                  success: 0,
                  failure: 0,
                  canceled: 0,
                  acked: 0,
                }
              )}
              permission={{}}
            />
            <span className="ins-c-latest-activity__date">
              <DateFormat type="relative" date={mostRecent.updated_at} />
            </span>
            <Link to={`/${mostRecent.remediation_id}/${mostRecent.id}`}>
              View
            </Link>
          </DescriptionList>
        </FlexItem>
      );
    }
  };

  const getResolvedCount = (issues) => {
    let count = 0;
    issues.map((i) => i.systems.every((s) => s.resolved) && count++);
    return count;
  };

  const { stats } = remediation;

  const totalSystems = stats.systemsWithReboot + stats.systemsWithoutReboot;

  const resolvedCount = getResolvedCount(remediation.issues);

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
                  {playbookRuns && renderLatestActivity(playbookRuns)}
                </Flex>
              </SplitItem>
            </Split>
          </StackItem>
          <StackItem>{renderAutoReboot(remediation)}</StackItem>
        </Stack>
      </SplitItem>
    </Split>
  );
};

RemediationSummary.propTypes = {
  remediation: PropTypes.object.isRequired,
  playbookRuns: PropTypes.array.isRequired,
  switchAutoReboot: PropTypes.func.isRequired,
  context: PropTypes.object.isRequired,
};

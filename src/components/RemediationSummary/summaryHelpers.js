import React from 'react';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  OffIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import DescriptionList from '../Layouts/DescriptionList';
import classnames from 'classnames';
import { StatusSummary } from '../statusHelper';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import './RemediationSummary.scss';

export const renderLatestActivity = (playbookRuns, counts) => {
  if (playbookRuns?.length) {
    const mostRecent = playbookRuns[0];
    return (
      <FlexItem spacer={{ default: 'spacer-xl' }}>
        <DescriptionList
          needsPointer
          className="rem-c-description-list-latest-activity"
          title="Latest activity"
        >
          <StatusSummary
            executorStatus={mostRecent.status}
            counts={counts}
            permission={{}}
          />
          <span className="rem-c-description-list-latest-activity__date">
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

const rebootDisabled = (handleRebootChange, required, context, remediation) => {
  const generateNumRebootString = (num) => {
    return `${num} issue${num === 1 ? '' : 's'} require${
      num === 1 ? 's' : ''
    } reboot to remediate`;
  };

  const generateNumIssuesReboot = (remediation) => {
    let count = 0;

    for (const issue of remediation.issues) {
      if (issue.resolution.needs_reboot) {
        count++;
      }
    }

    return count;
  };

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
            {generateNumRebootString(generateNumIssuesReboot(remediation))}
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

const rebootEnabled = (handleRebootChange, remediation, context) => {
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

export const renderAutoReboot = (remediation, switchAutoReboot, context) => {
  const handleRebootChange = (autoReboot) => {
    switchAutoReboot(remediation.id, autoReboot);
  };

  const generateAutoRebootStatus = (status, needsReboot) => {
    return status
      ? rebootEnabled(handleRebootChange, remediation, context)
      : rebootDisabled(handleRebootChange, needsReboot, context, remediation);
  };

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

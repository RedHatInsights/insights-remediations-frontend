import {
  Alert,
  Flex,
  HelperText,
  HelperTextItem,
  Skeleton,
} from '@patternfly/react-core';
import React from 'react';
import { getIssueApplication } from '../Utilities/model';

export const wizardHelperText = (exceedsLimits) => {
  if (exceedsLimits) {
    return (
      <HelperText isLiveRegion className="pf-v6-u-mt-sm">
        <HelperTextItem variant="warning">
          Remediation plan exceeds execution limits
        </HelperTextItem>
      </HelperText>
    );
  }

  return (
    <HelperText>
      <HelperTextItem>
        Select an existing playbook or type a unique name to create a new one
      </HelperTextItem>
    </HelperText>
  );
};

export const renderChartSkeleton = () => {
  return (
    <Flex>
      <Skeleton size="lg" style={{ height: '120px', width: '400px' }} />
      <div className="pf-v6-u-text-align-center pf-v6-u-mt-sm">
        <Skeleton size="sm" style={{ width: '100px', margin: '0 auto' }} />
      </div>
    </Flex>
  );
};

export const renderExceedsLimitsAlert = ({
  exceededSystems,
  exceededActions,
  systemsCount,
  actionsCount,
}) => {
  return (
    <Alert
      isInline
      variant="warning"
      title="Remediation plan exceeds execution limits"
      className="pf-v6-u-mt-lg"
    >
      <p>
        To execute a remediation plan using Red Hat Lightspeed, the plan must
        contain no more than 100 systems or 1000 action points.
      </p>
      <ul className="pf-v6-c-list pf-v6-u-my-sm">
        <li>
          Remove{' '}
          {exceededSystems && exceededActions
            ? `${systemsCount} systems or ${actionsCount} action points`
            : exceededSystems
              ? `${systemsCount} systems`
              : `${actionsCount} action points`}{' '}
          from the plan before or after plan creation.
        </li>
        <li>
          Otherwise, create and download the plan to run with Red Hat{' '}
          <strong>Ansible Automation Platform (AAP)</strong> or execute using a{' '}
          <a
            href="https://docs.redhat.com/en/documentation/red_hat_hybrid_cloud_console/1-latest/html-single/integrating_the_red_hat_hybrid_cloud_console_with_third-party_applications/index#assembly-configuring-integration-with-eda_integrating-communications"
            target="_blank"
            rel="noopener noreferrer"
          >
            connected AAP integration
          </a>
          .
        </li>
      </ul>
    </Alert>
  );
};

// Calculates action points from an array of issues based on their application type.
// Points per action type: Advisor (20 pts), Vulnerability (20 pts), Patch (2 pts), Compliance (5 pts)
export const calculateActionPoints = (issues) => {
  if (!issues || !Array.isArray(issues)) {
    return 0;
  }

  const POINTS_MAP = {
    Advisor: 20,
    Vulnerability: 20,
    Patch: 2,
    Compliance: 5,
  };

  return issues.reduce((totalPoints, issue) => {
    const application = getIssueApplication(issue);
    const points = POINTS_MAP[application] || 0;
    return totalPoints + points;
  }, 0);
};

// Normalize data because different apps send data differently
export const normalizeRemediationData = (data) => {
  if (!data) {
    return data;
  }

  // If systems array already exists, return data as-is
  if (data.systems && Array.isArray(data.systems)) {
    return data;
  }

  // Extract unique systems from issues[].systems
  const systemsSet = new Set();
  if (data.issues && Array.isArray(data.issues)) {
    data.issues.forEach((issue) => {
      if (issue.systems && Array.isArray(issue.systems)) {
        issue.systems.forEach((system) => {
          systemsSet.add(system);
        });
      }
    });
  }

  // Return normalized data with systems array
  return {
    ...data,
    systems: Array.from(systemsSet),
  };
};

// Prepares remediation payload for create/update
export const prepareRemediationPayload = (data, autoReboot) => {
  // Check if systems are nested within issues (new structure)
  const hasNestedSystems = data?.issues?.some(
    (issue) => issue.systems && Array.isArray(issue.systems),
  );

  const issues = (data?.issues || []).map((issue) => ({
    id: issue.id,
    // Use issue's systems if nested, otherwise use flat systems array
    systems: hasNestedSystems ? issue.systems || [] : data?.systems || [],
  }));

  return {
    add: {
      issues,
      systems: [],
    },
    auto_reboot: autoReboot,
  };
};

// Handles remediation submission (create or update)
// Returns { success: boolean, remediationName?: string, error?: Error }
export const handleRemediationSubmit = async ({
  isExistingPlanSelected,
  selected,
  inputValue,
  data,
  autoReboot,
  createRemediationFetch,
  updateRemediationFetch,
}) => {
  const payload = prepareRemediationPayload(data, autoReboot);

  if (isExistingPlanSelected) {
    await updateRemediationFetch([selected, payload]);
    return {
      success: true,
      remediationId: selected,
      remediationName: inputValue,
      isUpdate: true,
    };
  } else {
    const remediationName = inputValue.trim() || 'New remediation plan';
    const createPayload = {
      ...payload,
      name: remediationName,
    };
    // createRemediation expects (payload) - pass directly, not wrapped in params
    const response = await createRemediationFetch(createPayload);
    return {
      success: true,
      remediationId: response?.id,
      remediationName,
      isUpdate: false,
    };
  }
};

// Handles preview/download of remediation
export const handleRemediationPreview = ({
  selected,
  remediationDetailsSummary,
  allRemediationsData,
  download,
  addNotification,
}) => {
  // Prepare remediation data for download
  const remediationData = remediationDetailsSummary
    ? [remediationDetailsSummary]
    : allRemediationsData?.filter((r) => r.id === selected) || [];

  download([selected], remediationData, addNotification);
};

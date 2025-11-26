import {
  Alert,
  Flex,
  HelperText,
  HelperTextItem,
  Skeleton,
} from '@patternfly/react-core';
import React from 'react';
import { getIssueApplication } from '../Utilities/model';
import { createRemediationBatches, remediationUrl } from '../Utilities/utils';

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
    <Flex direction={{ default: 'column' }}>
      <Skeleton
        size="lg"
        style={{ height: '120px', width: '100%', maxWidth: '400px' }}
      />
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

// Throttle utility to limit requests to 4 per second (250ms delay)
const throttle = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Handles remediation submission (create or update) with batching and throttling
// Returns { success: boolean, status: 'success' | 'complete_failure' | 'partial_failure', remediationId?: string, remediationName?: string, isUpdate?: boolean }
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
  const { issues } = payload.add;

  // Create batches of issues (max 50 issues per batch, max 50 systems per issue)
  const batches = createRemediationBatches(issues);

  let remediationId = selected;
  let successfulBatches = 0;
  let failedBatches = 0;

  // If no batches, still need to create/update with empty data
  if (batches.length === 0) {
    const emptyPayload = {
      add: {
        issues: [],
        systems: [],
      },
      auto_reboot: autoReboot,
    };

    try {
      if (isExistingPlanSelected) {
        await updateRemediationFetch([selected, emptyPayload]);
        successfulBatches++;
      } else {
        const remediationName = inputValue.trim() || 'New remediation plan';
        const createPayload = {
          ...emptyPayload,
          name: remediationName,
        };
        const response = await createRemediationFetch(createPayload);
        remediationId = response?.id;
        if (remediationId) {
          successfulBatches++;
        } else {
          failedBatches++;
        }
      }

      if (failedBatches > 0) {
        return {
          success: false,
          status: 'complete_failure',
          remediationId,
          remediationName: inputValue.trim() || 'New remediation plan',
          isUpdate: isExistingPlanSelected,
        };
      }

      return {
        success: true,
        status: 'success',
        remediationId,
        remediationName: inputValue.trim() || 'New remediation plan',
        isUpdate: isExistingPlanSelected,
      };
    } catch {
      return {
        success: false,
        status: 'complete_failure',
        remediationId,
        remediationName: inputValue.trim() || 'New remediation plan',
        isUpdate: isExistingPlanSelected,
      };
    }
  }

  // Process first batch - create or update remediation
  const firstBatch = batches[0];
  const firstBatchPayload = {
    add: {
      issues: firstBatch,
      systems: [],
    },
    auto_reboot: autoReboot,
  };

  // Throttle: wait 250ms before first request (4 requests per second)
  await throttle(250);

  try {
    if (isExistingPlanSelected) {
      // Update existing remediation with first batch
      await updateRemediationFetch([selected, firstBatchPayload]);
      successfulBatches++;
    } else {
      // Create new remediation with first batch
      const remediationName = inputValue.trim() || 'New remediation plan';
      const createPayload = {
        ...firstBatchPayload,
        name: remediationName,
      };
      const response = await createRemediationFetch(createPayload);
      remediationId = response?.id;

      if (!remediationId) {
        failedBatches++;
        return {
          success: false,
          status: 'complete_failure',
          remediationId: null,
          remediationName: inputValue.trim() || 'New remediation plan',
          isUpdate: false,
        };
      }
      successfulBatches++;
    }
  } catch (error) {
    // Initial request failed - complete failure
    console.error('Initial remediation request failed:', error);
    failedBatches++;
    return {
      success: false,
      status: 'complete_failure',
      remediationId: null,
      remediationName: inputValue.trim() || 'New remediation plan',
      isUpdate: isExistingPlanSelected,
    };
  }

  // Process remaining batches with throttling (4 requests per second)
  for (let i = 1; i < batches.length; i++) {
    // Throttle: wait 250ms between requests
    await throttle(250);

    const batch = batches[i];
    const patchPayload = {
      add: {
        issues: batch,
        systems: [],
      },
      auto_reboot: autoReboot,
    };

    try {
      await updateRemediationFetch([remediationId, patchPayload]);
      successfulBatches++;
    } catch (error) {
      failedBatches++;
      // Continue processing remaining batches even if one fails
      console.warn(`Failed to add batch ${i + 1}:`, error);
    }
  }

  // Determine final status
  if (failedBatches === 0) {
    return {
      success: true,
      status: 'success',
      remediationId,
      remediationName: inputValue.trim() || 'New remediation plan',
      isUpdate: isExistingPlanSelected,
    };
  } else if (successfulBatches > 0) {
    // Partial failure - some succeeded, some failed
    return {
      success: false,
      status: 'partial_failure',
      remediationId,
      remediationName: inputValue.trim() || 'New remediation plan',
      isUpdate: isExistingPlanSelected,
    };
  } else {
    // Complete failure - should not happen here since we check initial request above
    return {
      success: false,
      status: 'complete_failure',
      remediationId: null,
      remediationName: inputValue.trim() || 'New remediation plan',
      isUpdate: isExistingPlanSelected,
    };
  }
};

// Prepares playbook preview payload by merging existing remediation with new data
// Returns payload in format: { issues: [{ id, systems: [], resolution?: string }], auto_reboot: boolean }
export const preparePlaybookPreviewPayload = ({
  isExistingPlanSelected,
  remediationDetailsSummary,
  data,
  autoReboot,
}) => {
  // Check if systems are nested within issues (new structure)
  const hasNestedSystems = data?.issues?.some(
    (issue) => issue.systems && Array.isArray(issue.systems),
  );

  // Prepare new issues from data prop
  const newIssues = (data?.issues || []).map((issue) => {
    const issuePayload = {
      id: issue.id,
      systems: hasNestedSystems ? issue.systems || [] : data?.systems || [],
    };

    // Include resolution if present
    if (issue.resolution) {
      issuePayload.resolution = issue.resolution;
    }

    return issuePayload;
  });

  if (!isExistingPlanSelected || !remediationDetailsSummary) {
    // New plan: just use the data prop
    return {
      issues: newIssues,
      auto_reboot: autoReboot,
    };
  }

  // Existing plan: merge existing remediation issues with new issues
  const existingIssues = (remediationDetailsSummary.issues || []).map(
    (issue) => {
      // Extract system IDs - handle both object and string formats
      const systemIds =
        issue.systems?.map((system) =>
          typeof system === 'string' ? system : system.id,
        ) || [];

      const issuePayload = {
        id: issue.id,
        systems: systemIds,
      };

      // Include resolution if present
      if (issue.resolution) {
        issuePayload.resolution =
          typeof issue.resolution === 'string'
            ? issue.resolution
            : issue.resolution.id;
      }

      return issuePayload;
    },
  );

  // Merge existing and new issues
  // If an issue exists in both, combine their systems arrays (deduplicate)
  const issuesMap = new Map();

  // Add existing issues first
  existingIssues.forEach((issue) => {
    issuesMap.set(issue.id, {
      ...issue,
      systems: [...issue.systems],
    });
  });

  // Merge new issues
  newIssues.forEach((newIssue) => {
    if (issuesMap.has(newIssue.id)) {
      // Merge systems arrays and deduplicate
      const existingIssue = issuesMap.get(newIssue.id);
      const combinedSystems = [
        ...new Set([...existingIssue.systems, ...newIssue.systems]),
      ];
      issuesMap.set(newIssue.id, {
        ...existingIssue,
        systems: combinedSystems,
        // New resolution takes precedence if provided
        resolution: newIssue.resolution || existingIssue.resolution,
      });
    } else {
      // New issue, add it
      issuesMap.set(newIssue.id, { ...newIssue });
    }
  });

  return {
    issues: Array.from(issuesMap.values()),
    auto_reboot: autoReboot,
  };
};

// Handles playbook preview generation and download
export const handlePlaybookPreview = async ({
  hasPlanSelection,
  isExistingPlanSelected,
  remediationDetailsSummary,
  data,
  autoReboot,
  postPlaybookPreview,
  addNotification,
  inputValue,
  selected,
  allRemediationsData,
  downloadFile,
}) => {
  if (!hasPlanSelection) {
    return;
  }

  try {
    // Prepare payload using helper function
    const payload = preparePlaybookPreviewPayload({
      isExistingPlanSelected,
      remediationDetailsSummary,
      data,
      autoReboot,
    });

    const response = await postPlaybookPreview(payload, {
      responseType: 'blob',
    });

    // Determine playbook name for filename
    let playbookName = 'remediation-preview-playbook';
    if (isExistingPlanSelected && remediationDetailsSummary?.name) {
      playbookName = remediationDetailsSummary.name;
    } else if (inputValue?.trim()) {
      playbookName = inputValue.trim();
    } else if (isExistingPlanSelected && selected) {
      // Fallback: find name from allRemediationsData
      const selectedRemediation = allRemediationsData?.find(
        (r) => r.id === selected,
      );
      if (selectedRemediation?.name) {
        playbookName = selectedRemediation.name;
      }
    }

    const sanitizedFilename = playbookName
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    downloadFile(response, sanitizedFilename, 'yml');
  } catch (error) {
    console.error('Error generating playbook preview:', error);

    // Handle blob error responses (need to parse as text)
    let errorMessage = 'Failed to generate playbook preview. Please try again.';
    if (error?.response?.data) {
      if (error.response.data instanceof Blob) {
        // Try to parse blob as text for error message
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          errorMessage = parsed.message || parsed.error || errorMessage;
        } catch {
          // If parsing fails, use default message
        }
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }

    addNotification({
      title: 'Preview failed',
      description: errorMessage,
      variant: 'danger',
      dismissable: true,
      autoDismiss: true,
    });
  }
};

// Navigates to the remediation page
export const navigateToRemediation = (remediationId) => {
  if (remediationId) {
    const url = remediationUrl(remediationId);
    window.location.href = url;
  }
};

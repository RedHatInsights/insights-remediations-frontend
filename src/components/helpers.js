import {
  Alert,
  Button,
  Flex,
  HelperText,
  HelperTextItem,
  Hint,
  HintBody,
  HintTitle,
  Skeleton,
  Spinner,
} from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import React from 'react';
import { getIssuePrefix } from '../Utilities/model';
import { createRemediationBatches, remediationUrl } from '../Utilities/utils';

export const wizardHelperText = (exceedsLimits) => {
  if (exceedsLimits) {
    return (
      <HelperText isLiveRegion className="pf-v6-u-mt-sm">
        <HelperTextItem variant="warning">
          Remediation plan exceeds limits
        </HelperTextItem>
      </HelperText>
    );
  }

  return (
    <HelperText className="pf-v6-u-pt-sm">
      <HelperTextItem>
        Enter a new plan name or select an existing plan.
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
  const MAX_SYSTEMS = 100;
  const MAX_ACTIONS = 1000;

  // Calculate how many need to be removed to get within limits
  const systemsToRemove = exceededSystems ? systemsCount - MAX_SYSTEMS : 0;
  const actionsToRemove = exceededActions ? actionsCount - MAX_ACTIONS : 0;

  return (
    <Alert
      isInline
      variant="warning"
      title="Remediation plan exceeds limits "
      className="pf-v6-u-mt-lg"
    >
      <p>
        To preview or execute a remediation plan using Red Hat Lightspeed, the
        plan must be limited to no more than 100 systems and 1000 action points.
      </p>
      <ul className="pf-v6-c-list pf-v6-u-my-sm">
        <li>
          Remove{' '}
          {exceededSystems && exceededActions
            ? `at least ${systemsToRemove} systems and ${actionsToRemove} action points`
            : exceededSystems
              ? `at least ${systemsToRemove} systems`
              : `at least ${actionsToRemove} action points`}{' '}
          from the plan before or after plan creation to get within limits.
        </li>
        <li>
          Otherwise, create and download the plan to run with Red Hat Ansible
          Automation Platform (AAP) or execute using a{' '}
          <a
            href="https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.6/html/using_automation_execution/controller-setting-up-insights"
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

export const renderPreviewAlert = ({
  hasPlanSelection,
  onPreviewClick,
  previewStatus,
  previewLoading,
}) => {
  return (
    <Hint variant="info" className="pf-v6-u-mt-lg">
      <HintTitle>You can download a preview of this plan</HintTitle>
      <HintBody>
        <p>
          The preview includes the playbook used in the plan, which you can
          download and execute on your system. To execute the playbook using Red
          Hat Lightspeed, complete this form to create a remediation plan. It
          will automatically include the required remote execution
          configurations.
        </p>
        <Flex
          gap={{ default: 'gapSm' }}
          alignItems={{ default: 'alignItemsCenter' }}
          className="pf-v6-u-mt-sm"
        >
          <Button
            variant="link"
            icon={<DownloadIcon />}
            onClick={onPreviewClick}
            isDisabled={!hasPlanSelection || previewLoading}
          >
            Download preview
          </Button>
          {previewLoading && <Spinner size="sm" />}
          {previewStatus && !previewLoading && (
            <Alert
              isInline
              isPlain
              variant={previewStatus === 'success' ? 'success' : 'danger'}
              title={
                previewStatus === 'success'
                  ? 'Preview downloaded'
                  : 'Preview download failed'
              }
            />
          )}
        </Flex>
      </HintBody>
    </Hint>
  );
};

export const calculateActionPointsFromSummary = (issueCountDetails) => {
  if (!issueCountDetails || typeof issueCountDetails !== 'object') {
    return 0;
  }

  const POINTS_MAP = {
    advisor: 20,
    vulnerabilities: 20,
    'patch-advisory': 2,
    'patch-package': 2,
    ssg: 5,
  };

  let totalPoints = 0;
  for (const [issueType, count] of Object.entries(issueCountDetails)) {
    const points = POINTS_MAP[issueType] || 0;
    totalPoints += points * (count || 0);
  }

  return totalPoints;
};
// Calculates action points from an array of issues based on their application type.
// Points per action type: Advisor (20 pts), Vulnerability (20 pts), Patch (2 pts), Compliance (5 pts)
export const calculateActionPoints = (issues) => {
  if (!issues || !Array.isArray(issues)) {
    return 0;
  }

  const POINTS_MAP = {
    advisor: 20,
    vulnerabilities: 20,
    'patch-advisory': 2,
    'patch-package': 2,
    ssg: 5,
  };

  return issues.reduce((totalPoints, issue) => {
    const prefix = getIssuePrefix(issue.id);
    const points = POINTS_MAP[prefix] || 0;
    return totalPoints + points;
  }, 0);
};

// Calculate action points from both remediationDetailsSummary and normalizedData, deduplicating issues by ID
export const calculateActionPointsFromBoth = (
  remediationDetailsSummary,
  normalizedData,
) => {
  const issuesMap = new Map();

  // Add issues from existing remediation plan
  if (
    remediationDetailsSummary?.issues &&
    Array.isArray(remediationDetailsSummary.issues)
  ) {
    remediationDetailsSummary.issues.forEach((issue) => {
      if (issue.id) {
        issuesMap.set(issue.id, issue);
      }
    });
  }

  // Add issues from normalizedData (new data being added)
  if (normalizedData?.issues && Array.isArray(normalizedData.issues)) {
    normalizedData.issues.forEach((issue) => {
      if (issue.id) {
        // If issue already exists, keep the existing one (don't overwrite)
        // This ensures we don't count duplicates
        if (!issuesMap.has(issue.id)) {
          issuesMap.set(issue.id, issue);
        }
      }
    });
  }

  // Calculate action points from deduplicated issues
  const uniqueIssues = Array.from(issuesMap.values());
  return calculateActionPoints(uniqueIssues);
};

// Counts unique systems from remediation details summary (systems nested within issues)
// Count unique systems from both remediationDetailsSummary and normalizedData, deduplicating across both
export const countUniqueSystemsFromBoth = (
  remediationDetailsSummary,
  normalizedData,
) => {
  const systemsSet = new Set();

  // Add systems from existing remediation plan
  if (
    remediationDetailsSummary?.issues &&
    Array.isArray(remediationDetailsSummary.issues)
  ) {
    remediationDetailsSummary.issues.forEach((issue) => {
      if (issue.systems && Array.isArray(issue.systems)) {
        issue.systems.forEach((system) => {
          // Systems can be objects with id property or strings
          const systemId = typeof system === 'string' ? system : system.id;
          if (systemId) {
            systemsSet.add(systemId);
          }
        });
      }
    });
  }

  // Add systems from normalizedData (new data being added)
  // Handle two formats: flat systems array or nested systems within issues
  if (normalizedData) {
    // Format 1: Flat systems array
    if (normalizedData.systems && Array.isArray(normalizedData.systems)) {
      normalizedData.systems.forEach((system) => {
        const systemId = typeof system === 'string' ? system : system.id;
        if (systemId) {
          systemsSet.add(systemId);
        }
      });
    }

    // Format 2: Nested systems within issues
    if (normalizedData.issues && Array.isArray(normalizedData.issues)) {
      normalizedData.issues.forEach((issue) => {
        if (issue.systems && Array.isArray(issue.systems)) {
          issue.systems.forEach((system) => {
            const systemId = typeof system === 'string' ? system : system.id;
            if (systemId) {
              systemsSet.add(systemId);
            }
          });
        }
      });
    }
  }

  return systemsSet.size;
};

// Count unique issues from both remediationDetailsSummary and normalizedData, deduplicating by ID
export const countUniqueIssuesFromBoth = (
  remediationDetailsSummary,
  normalizedData,
) => {
  const issuesSet = new Set();

  // Add issues from existing remediation plan
  if (
    remediationDetailsSummary?.issues &&
    Array.isArray(remediationDetailsSummary.issues)
  ) {
    remediationDetailsSummary.issues.forEach((issue) => {
      if (issue.id) {
        issuesSet.add(issue.id);
      }
    });
  }

  // Add issues from normalizedData (new data being added)
  if (normalizedData?.issues && Array.isArray(normalizedData.issues)) {
    normalizedData.issues.forEach((issue) => {
      if (issue.id) {
        issuesSet.add(issue.id);
      }
    });
  }

  return issuesSet.size;
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
export const prepareRemediationPayload = (
  data,
  autoReboot,
  enablePrecedence = false,
) => {
  // Check if systems are nested within issues (new structure)
  const hasNestedSystems = data?.issues?.some(
    (issue) => issue.systems && Array.isArray(issue.systems),
  );

  const issues = (data?.issues || []).map((issue) => {
    const issuePayload = {
      id: issue.id,
      // Use issue's systems if nested, otherwise use flat systems array
      systems: hasNestedSystems ? issue.systems || [] : data?.systems || [],
    };

    if (enablePrecedence) {
      issuePayload.precedence = issue.precedence;
    }

    return issuePayload;
  });

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
// Returns { success: boolean, status: 'success' | 'complete_failure' | 'partial_failure', remediationId?: string, remediationName?: string, isUpdate?: boolean, errors?: array }
// onProgress callback: (totalBatches, successfulBatches, failedBatches, errors, isComplete) => void
export const handleRemediationSubmit = async ({
  isExistingPlanSelected,
  selected,
  inputValue,
  data,
  autoReboot,
  createRemediationFetch,
  updateRemediationFetch,
  isCompliancePrecedenceEnabled = false,
  onProgress,
}) => {
  const payload = prepareRemediationPayload(
    data,
    autoReboot,
    isCompliancePrecedenceEnabled,
  );
  const { issues } = payload.add;

  // Create batches of issues (max 50 issues per batch, max 50 systems per issue)
  const batches = createRemediationBatches(issues);
  const totalBatches = Math.max(batches.length, 1); // At least 1 batch (empty case)

  let remediationId = selected;
  let successfulBatches = 0;
  let failedBatches = 0;
  const collectedErrors = [];

  // Helper function to extract error titles from error response
  const extractErrorTitles = (error) => {
    try {
      const errorData = error?.response?.data || error?.data || {};
      const errors = errorData?.errors || [];
      return errors.map((err) => err?.title).filter(Boolean);
    } catch {
      return [];
    }
  };

  // Report initial progress
  if (onProgress) {
    onProgress(totalBatches, successfulBatches, failedBatches, [], false);
  }

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

      // Report progress after empty batch
      if (onProgress) {
        onProgress(totalBatches, successfulBatches, failedBatches, [], true);
      }

      if (failedBatches > 0) {
        return {
          success: false,
          status: 'complete_failure',
          remediationId,
          remediationName: inputValue.trim() || 'New remediation plan',
          isUpdate: isExistingPlanSelected,
          errors: collectedErrors,
        };
      }

      return {
        success: true,
        status: 'success',
        remediationId,
        remediationName: inputValue.trim() || 'New remediation plan',
        isUpdate: isExistingPlanSelected,
        errors: [],
      };
    } catch (error) {
      failedBatches++;
      const errorTitles = extractErrorTitles(error);
      collectedErrors.push(...errorTitles);
      // Report progress after failure
      if (onProgress) {
        onProgress(
          totalBatches,
          successfulBatches,
          failedBatches,
          collectedErrors,
          true,
        );
      }
      return {
        success: false,
        status: 'complete_failure',
        remediationId,
        remediationName: inputValue.trim() || 'New remediation plan',
        isUpdate: isExistingPlanSelected,
        errors: collectedErrors,
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
        // Report progress after failure
        if (onProgress) {
          onProgress(
            totalBatches,
            successfulBatches,
            failedBatches,
            collectedErrors,
            true,
          );
        }
        return {
          success: false,
          status: 'complete_failure',
          remediationId: null,
          remediationName: inputValue.trim() || 'New remediation plan',
          isUpdate: false,
          errors: collectedErrors,
        };
      }
      successfulBatches++;
    }
    // Report progress after first batch (not complete yet)
    if (onProgress) {
      const isComplete = batches.length === 1;
      onProgress(
        totalBatches,
        successfulBatches,
        failedBatches,
        collectedErrors,
        isComplete,
      );
    }
  } catch (error) {
    // Initial request failed - complete failure
    console.error('Initial remediation request failed:', error);
    failedBatches++;
    const errorTitles = extractErrorTitles(error);
    collectedErrors.push(...errorTitles);
    // Report progress after failure
    if (onProgress) {
      onProgress(
        totalBatches,
        successfulBatches,
        failedBatches,
        collectedErrors,
        true,
      );
    }
    return {
      success: false,
      status: 'complete_failure',
      remediationId: null,
      remediationName: inputValue.trim() || 'New remediation plan',
      isUpdate: isExistingPlanSelected,
      errors: collectedErrors,
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
      const errorTitles = extractErrorTitles(error);
      collectedErrors.push(...errorTitles);
      // Continue processing remaining batches even if one fails
      console.warn(`Failed to add batch ${i + 1}:`, error);
    }
    // Report progress after each batch (not complete until last batch)
    if (onProgress) {
      const isComplete = i === batches.length - 1;
      onProgress(
        totalBatches,
        successfulBatches,
        failedBatches,
        collectedErrors,
        isComplete,
      );
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
      errors: [],
    };
  } else if (successfulBatches > 0) {
    // Partial failure - some succeeded, some failed
    return {
      success: false,
      status: 'partial_failure',
      remediationId,
      remediationName: inputValue.trim() || 'New remediation plan',
      isUpdate: isExistingPlanSelected,
      errors: collectedErrors,
    };
  } else {
    // Complete failure - should not happen here since we check initial request above
    return {
      success: false,
      status: 'complete_failure',
      remediationId: null,
      remediationName: inputValue.trim() || 'New remediation plan',
      isUpdate: isExistingPlanSelected,
      errors: collectedErrors,
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
  enablePrecedence = false,
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

    if (enablePrecedence) {
      issuePayload.precedence = issue.precedence;
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

      if (enablePrecedence) {
        issuePayload.precedence = issue.precedence;
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

export const navigateToRemediation = (remediationId) => {
  if (remediationId) {
    const url = remediationUrl(remediationId);
    window.location.href = url;
  }
};

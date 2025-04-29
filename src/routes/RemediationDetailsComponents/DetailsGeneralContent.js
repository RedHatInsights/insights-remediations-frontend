import React from 'react';
import { Alert, Flex, FlexItem } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import DetailsCard from './DetailsCard';
import ProgressCard from './ProgressCard';

const DetailsGeneralContent = ({
  details,
  onRename,
  refetch,
  remediationStatus,
  updateRemPlan,
  onNavigateToTab,
  allRemediations,
  permissions,
  remediationPlaybookRuns,
}) => {
  const readyOrNot =
    !permissions?.exectute &&
    remediationStatus?.detailsError !== 403 &&
    remediationStatus?.connectedSystems !== 0;

  return (
    <section
      className={'pf-v5-l-page__main-section pf-v5-c-page__main-section'}
    >
      {!readyOrNot && (
        <Alert
          isInline
          variant={'danger'}
          title={'Remediation cannot be executed.'}
          className="pf-v5-u-mb-md"
        >
          <p>
            {
              'This remediation plan cannot currently be executed due to execution readiness errors. For more details, refer to the '
            }
            <strong>Execution readiness</strong>
            {' section.'}
          </p>
        </Alert>
      )}
      <Flex
        justifyContent={{ default: 'justifyContentSpaceEvenly' }}
        direction={{ default: 'row' }}
        alignItems={{ default: 'alignItemsStretch' }}
      >
        <FlexItem style={{ flex: '0 0 48%', maxWidth: '48%' }}>
          <DetailsCard
            details={details}
            onRename={onRename}
            refetch={refetch}
            remediationStatus={remediationStatus}
            updateRemPlan={updateRemPlan}
            onNavigateToTab={onNavigateToTab}
            allRemediations={allRemediations}
            remediationPlaybookRuns={remediationPlaybookRuns}
          />
        </FlexItem>
        <FlexItem style={{ flex: '0 0 48%', maxWidth: '48%' }}>
          <ProgressCard
            remediationStatus={remediationStatus}
            permissions={permissions}
            readyOrNot={readyOrNot}
          />
        </FlexItem>
      </Flex>
    </section>
  );
};

DetailsGeneralContent.propTypes = {
  details: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  remediationStatus: PropTypes.object.isRequired,
  updateRemPlan: PropTypes.func,
  onNavigateToTab: PropTypes.func,
  allRemediations: PropTypes.array,
  permissions: PropTypes.object,
  remediationPlaybookRuns: PropTypes.any,
};

export default DetailsGeneralContent;

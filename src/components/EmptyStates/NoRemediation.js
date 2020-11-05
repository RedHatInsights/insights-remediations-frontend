
import React from 'react';

import { Button, EmptyState, EmptyStateIcon, Title, Bullseye } from '@patternfly/react-core';
import { WrenchIcon } from '@patternfly/react-icons';

const NoRemediation = () => (
    <Bullseye>
        <EmptyState>
            <EmptyStateIcon icon={ WrenchIcon } />
            <Title headingLevel="h5" size="lg">
                Remediation not found
            </Title>
            <Button
                variant="link"
                component="a"
                href={ `./${window.insights.chrome.isBeta() ? 'beta/' : ''}insights/remediations` }>
                    Back to Remediations
            </Button>
        </EmptyState>
    </Bullseye>
);

export default NoRemediation;

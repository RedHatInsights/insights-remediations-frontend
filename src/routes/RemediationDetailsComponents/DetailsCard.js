import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Button,
  Switch,
  Title,
  Text,
  Spinner,
  Flex,
  TextInput,
  ValidatedOptions,
  FormGroup,
  CardFooter,
} from '@patternfly/react-core';
import {
  CheckIcon,
  ExternalLinkAltIcon,
  PencilAltIcon,
  TimesIcon,
} from '@patternfly/react-icons';
import { formatDate } from '../Cells';
import { useVerifyName } from '../../Utilities/useVerifyName';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { execStatus } from './helpers';

const DetailsCard = ({
  details,
  remediationStatus,
  updateRemPlan,
  onNavigateToTab,
  allRemediations,
  refetch,
  remediationPlaybookRuns,
}) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(details?.name);
  const [rebootToggle, setRebootToggle] = useState(details?.auto_reboot);

  const [isVerifyingName, isDisabled] = useVerifyName(
    value,
    allRemediations?.data
  );

  const onSubmit = () => {
    updateRemPlan({
      id: details.id,
      name: value,
    }).then(() => refetch());
    setEditing(false);
  };
  if (!details) {
    return <Spinner />;
  }
  const onToggleAutoreboot = () => {
    setRebootToggle(!rebootToggle);
    updateRemPlan({ id: details.id, auto_reboot: !rebootToggle });
  };

  const formatedDate = new Date(remediationPlaybookRuns?.updated_at);
  return (
    <Card isFullHeight>
      <CardTitle>
        <Title headingLevel="h4" size="xl">
          Details
        </Title>
      </CardTitle>
      <CardBody>
        <p className="pf-v5-u-font-size-sm pf-v5-u-mb-md">
          Overview of the set up and status details for this remediation plan.
        </p>
        <DescriptionList isHorizontal termWidth="20ch">
          {/* Editable Name */}
          <DescriptionListGroup>
            <DescriptionListTerm>Name</DescriptionListTerm>
            <DescriptionListDescription>
              {editing ? (
                <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                  <FormGroup
                    fieldId="remediation-name"
                    helperTextInvalid="Playbook name has to contain alphanumeric characters"
                    isValid={isDisabled}
                  >
                    <TextInput
                      type="text"
                      value={value}
                      onChange={(_event, value) => setValue(value)}
                      aria-label={'Rename Input'}
                      autoFocus
                      isValid={!isDisabled}
                      validated={
                        value === details?.name && isDisabled
                          ? ValidatedOptions.default
                          : (value.trim() === '' || isDisabled) &&
                            ValidatedOptions.error
                      }
                    />
                    {isDisabled &&
                      value !== details.name &&
                      !isVerifyingName && (
                        <p className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100">
                          A playbook with the same name already exists within
                          your organization. Try a different name.
                        </p>
                      )}
                    {value.trim() === '' && !isVerifyingName && (
                      <p className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100">
                        Playbook name cannot be empty.
                      </p>
                    )}
                  </FormGroup>
                  <Button
                    variant="link"
                    onClick={() => onSubmit(value)}
                    isDisabled={isDisabled || value.trim() === ''}
                  >
                    {isVerifyingName ? (
                      <Spinner size="md" />
                    ) : (
                      <CheckIcon
                        color={
                          isDisabled || value.trim() === ''
                            ? `var(--pf-v5-global--disabled-color--200)`
                            : `var(--pf-v5-global--link--Color)`
                        }
                      />
                    )}
                  </Button>
                  <Button variant="link" onClick={() => setEditing(false)}>
                    <TimesIcon color="var(--pf-v5-global--icon--Color--light--dark)" />
                  </Button>
                </Flex>
              ) : (
                <Flex>
                  <Text component="p">{details.name}</Text>
                  <Button variant="link" onClick={() => setEditing(true)}>
                    <PencilAltIcon />
                  </Button>
                </Flex>
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Created by */}
          <DescriptionListGroup>
            <DescriptionListTerm>Created</DescriptionListTerm>
            <DescriptionListDescription>
              {formatDate(details?.created_at)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Last Modified */}
          <DescriptionListGroup>
            <DescriptionListTerm>Last modified date</DescriptionListTerm>
            <DescriptionListDescription>
              {formatDate(details?.updated_at)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Last Execution Status */}
          <DescriptionListGroup>
            <DescriptionListTerm>Last execution status</DescriptionListTerm>
            <DescriptionListDescription>
              {execStatus(remediationPlaybookRuns?.status, formatedDate)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Actions */}
          <DescriptionListGroup>
            <DescriptionListTerm>Actions</DescriptionListTerm>
            <DescriptionListDescription>
              <Button
                variant="link"
                onClick={() => onNavigateToTab(null, 'actions')}
              >
                {`${details?.issues.length} action${
                  details?.issues.length > 1 ? 's' : ''
                }`}
              </Button>
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Systems */}
          <DescriptionListGroup>
            <DescriptionListTerm>Systems</DescriptionListTerm>
            <DescriptionListDescription>
              <Button
                variant="link"
                onClick={() => onNavigateToTab(null, 'systems')}
              >
                {`${remediationStatus?.totalSystems} system${
                  remediationStatus?.totalSystems > 1 ? 's' : ''
                } total`}
              </Button>
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* Autoreboot toggle */}
          <DescriptionListGroup>
            <DescriptionListTerm>Autoreboot</DescriptionListTerm>
            <DescriptionListDescription>
              <Switch
                id="autoreboot-switch"
                isChecked={rebootToggle}
                onChange={onToggleAutoreboot}
                label="On"
                labelOff="Off"
              />
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
      <CardFooter className="pf-v5-u-font-size-sm">
        New to remediating through Insights?{' '}
        <InsightsLink
          to={
            'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html/red_hat_insights_remediations_guide/index'
          }
        >
          <Button variant="link" className="pf-v5-u-font-size-sm">
            Learn More <ExternalLinkAltIcon />
          </Button>{' '}
        </InsightsLink>
      </CardFooter>
    </Card>
  );
};

DetailsCard.propTypes = {
  details: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    needs_reboot: PropTypes.bool.isRequired,
    auto_reboot: PropTypes.bool.isRequired,
    archived: PropTypes.bool.isRequired,
    created_by: PropTypes.shape({
      username: PropTypes.string.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
    }).isRequired,
    created_at: PropTypes.string.isRequired,
    updated_by: PropTypes.shape({
      username: PropTypes.string.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
    }).isRequired,
    updated_at: PropTypes.string.isRequired,
    resolved_count: PropTypes.number.isRequired,
    issues: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        resolution: PropTypes.shape({
          id: PropTypes.string.isRequired,
          description: PropTypes.string.isRequired,
          resolution_risk: PropTypes.number.isRequired,
          needs_reboot: PropTypes.bool.isRequired,
        }).isRequired,
        resolutions_available: PropTypes.number.isRequired,
        systems: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            hostname: PropTypes.string.isRequired,
            display_name: PropTypes.string.isRequired,
            resolved: PropTypes.bool.isRequired,
          })
        ).isRequired,
      })
    ).isRequired,
    autoreboot: PropTypes.bool.isRequired,
  }).isRequired,
  onRename: PropTypes.func.isRequired,
  onToggleAutoreboot: PropTypes.func.isRequired,
  onViewActions: PropTypes.func.isRequired,
  remediationStatus: PropTypes.any,
  onNavigateToTab: PropTypes.func,
  allRemediations: PropTypes.array,
  updateRemPlan: PropTypes.func,
  refetch: PropTypes.func,
  remediationPlaybookRuns: PropTypes.object,
};

export default DetailsCard;

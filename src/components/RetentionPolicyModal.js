import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  HelperText,
  HelperTextItem,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Select,
  SelectList,
  SelectOption,
  Skeleton,
} from '@patternfly/react-core';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import useRemediations from '../Utilities/Hooks/api/useRemediations';
import { getOrgConfig, putOrgConfigOverrides } from '../routes/api';
import {
  formatDuration,
  getValidWarningOptions,
  normalizeRetentionDays,
  normalizeWarningDays,
  RETENTION_PERIOD_OPTIONS,
} from '../Utilities/retentionPolicy';

const DurationSelect = ({
  fieldId,
  options,
  selectedValue,
  onChange,
  isDisabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel =
    options.find((option) => option.value === selectedValue)?.label ?? '';

  return (
    <Select
      id={fieldId}
      isOpen={isOpen}
      selected={selectedValue}
      onSelect={(_event, value) => {
        onChange(Number(value));
        setIsOpen(false);
      }}
      onOpenChange={(open) => setIsOpen(open)}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen((current) => !current)}
          isExpanded={isOpen}
          isFullWidth
          isDisabled={isDisabled}
          aria-label={fieldId}
        >
          {selectedLabel}
        </MenuToggle>
      )}
    >
      <SelectList>
        {options.map((option) => (
          <SelectOption key={option.value} value={option.value}>
            {option.label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

DurationSelect.propTypes = {
  fieldId: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selectedValue: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
};

const RetentionPolicyModal = ({ isOpen, onClose }) => {
  const addNotification = useAddNotification();
  const [retentionDays, setRetentionDays] = useState(null);
  const [warningDays, setWarningDays] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // getOrgConfig/putOrgConfigOverrides aren't in the generated remediations-client
  // yet, so they're plain axios wrapper functions (see routes/api.js) passed directly
  // as the "endpoint" - useRemediations supports functions the same way it supports
  // client method name strings.
  const {
    result: orgConfig,
    loading: isLoading,
    error: orgConfigError,
  } = useRemediations(getOrgConfig);

  const { fetch: saveOrgConfigOverrides } = useRemediations(
    putOrgConfigOverrides,
    { skip: true },
  );

  const warningOptions = useMemo(
    () => (retentionDays == null ? [] : getValidWarningOptions(retentionDays)),
    [retentionDays],
  );

  useEffect(() => {
    if (!orgConfig) {
      return;
    }

    const normalizedRetention = normalizeRetentionDays(
      orgConfig.plan_retention_days,
    );
    setRetentionDays(normalizedRetention);
    setWarningDays(
      normalizeWarningDays(orgConfig.plan_warning_days, normalizedRetention),
    );
  }, [orgConfig]);

  useEffect(() => {
    if (!orgConfigError) {
      return;
    }

    console.error(orgConfigError);
    addNotification({
      title: 'Failed to load retention policy',
      description: 'The retention policy settings could not be loaded.',
      variant: 'danger',
      dismissable: true,
      autoDismiss: true,
    });
    onClose();
  }, [orgConfigError, addNotification, onClose]);

  const handleRetentionChange = (nextRetentionDays) => {
    setRetentionDays(nextRetentionDays);
    setWarningDays((currentWarningDays) =>
      normalizeWarningDays(currentWarningDays, nextRetentionDays),
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveOrgConfigOverrides({
        plan_retention_days: retentionDays,
        plan_warning_days: warningDays,
      });

      addNotification({
        title: 'Remediation plan retention policy updated',
        description: `The retention policy is now ${formatDuration(retentionDays)} and the expiration warning will begin at ${formatDuration(warningDays)} before deletion.`,
        variant: 'success',
        dismissable: true,
        autoDismiss: true,
      });
      onClose();
    } catch (error) {
      console.error(error);
      addNotification({
        title: 'Retention policy update failed',
        description: 'The changes were not saved. Try again.',
        variant: 'danger',
        dismissable: true,
        autoDismiss: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isReady = !isLoading && retentionDays != null && warningDays != null;

  return (
    <Modal variant={ModalVariant.medium} isOpen={isOpen} onClose={onClose}>
      <ModalHeader title="Remediation plan retention policy" />
      <ModalBody>
        {!isReady ? (
          <Skeleton screenreaderText="Loading retention policy settings" />
        ) : (
          <>
            <p className="pf-v6-u-mb-lg">
              By default, remediation plans are deleted after 4 months of
              inactivity. Any plan modifications or executions will reset the
              retention period. Changes to this retention policy will affect all
              user accounts and remediation plans across your organization.
            </p>

            <FormGroup
              label="Retention period"
              isRequired
              fieldId="retention-period"
            >
              <DurationSelect
                fieldId="retention-period"
                options={RETENTION_PERIOD_OPTIONS}
                selectedValue={retentionDays}
                onChange={handleRetentionChange}
                isDisabled={isSaving}
              />
              <HelperText className="pf-v6-u-pt-sm">
                <HelperTextItem>
                  The duration that an inactive remediation plan is kept before
                  being automatically deleted.
                </HelperTextItem>
              </HelperText>
            </FormGroup>

            <FormGroup
              label="Expiration warning"
              isRequired
              fieldId="expiration-warning"
              className="pf-v6-u-mt-md"
            >
              <DurationSelect
                fieldId="expiration-warning"
                options={warningOptions}
                selectedValue={warningDays}
                onChange={setWarningDays}
                isDisabled={isSaving}
              />
              <HelperText className="pf-v6-u-pt-sm">
                <HelperTextItem>
                  The duration to display a warning before an inactive plan is
                  automatically deleted.
                </HelperTextItem>
              </HelperText>
            </FormGroup>
          </>
        )}
      </ModalBody>
      {isReady && (
        <ModalFooter>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            isDisabled={isSaving}
          >
            Save
          </Button>
          <Button variant="link" onClick={onClose} isDisabled={isSaving}>
            Cancel
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
};

RetentionPolicyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RetentionPolicyModal;

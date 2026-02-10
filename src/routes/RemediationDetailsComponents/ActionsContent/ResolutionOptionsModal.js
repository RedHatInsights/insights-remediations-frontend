import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Radio,
  Button,
  Skeleton,
  HelperText,
  HelperTextItem,
  Popover,
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Flex,
  FlexItem,
  Tooltip,
} from '@patternfly/react-core';
import {
  OutlinedQuestionCircleIcon,
  PowerOffIcon,
} from '@patternfly/react-icons';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { getResolutionsBatch } from '../../../api';
import { useParams } from 'react-router-dom';
import useRemediations from '../../../Utilities/Hooks/api/useRemediations';

const ResolutionOptionsModal = ({
  isOpen,
  onClose,
  issueId,
  issueDescription,
  currentResolution,
  remediationId,
  onResolutionUpdated,
}) => {
  const { id } = useParams();
  const [selectedResolution, setSelectedResolution] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resolutions, setResolutions] = useState([]);
  const addNotification = useAddNotification();

  const { fetch: updateIssueResolution } = useRemediations(
    'updateRemediationIssue',
    {
      skip: true,
    },
  );

  useEffect(() => {
    const fetchResolutions = async () => {
      if (!isOpen || !issueId) {
        return;
      }

      setIsLoading(true);
      try {
        const result = await getResolutionsBatch([issueId]);
        const issueResolutionData = result?.[issueId];
        const issueResolutions = issueResolutionData?.resolutions || [];
        setResolutions(issueResolutions);

        // Set current resolution as selected, or first one if no current
        const current = issueResolutions.find(
          (r) => r.id === currentResolution?.id,
        );
        setSelectedResolution(current || issueResolutions[0] || null);
      } catch (error) {
        console.error('Error fetching resolutions:', error);
        addNotification({
          title: 'Failed to load resolution options',
          variant: 'danger',
          dismissable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResolutions();
  }, [isOpen, issueId, currentResolution, addNotification]);

  const handleSave = async () => {
    if (!selectedResolution) {
      return;
    }

    setIsSaving(true);
    try {
      await updateIssueResolution([
        remediationId || id,
        issueId,
        { resolution: selectedResolution.id },
      ]);

      addNotification({
        title: 'Resolution updated successfully',
        variant: 'success',
        dismissable: true,
        autoDismiss: true,
      });

      if (onResolutionUpdated) {
        onResolutionUpdated();
      }

      onClose();
    } catch (error) {
      console.error('Error updating resolution:', error);
      addNotification({
        title: 'Failed to update resolution',
        variant: 'danger',
        dismissable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal variant={ModalVariant.medium} isOpen={isOpen} onClose={onClose}>
      <ModalHeader title="Resolution options" />
      <ModalBody>
        {isLoading ? (
          <Skeleton screenreaderText="Loading resolution options" />
        ) : (
          <>
            <div>
              <p className="pf-v6-u-mb-md" style={{ fontSize: '14px' }}>
                <strong>{issueDescription} </strong>
              </p>
            </div>
            <Flex
              className="pf-v6-u-mb-sm"
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapXs' }}
            >
              <FlexItem>
                <span
                  className="pf-v6-u-font-weight-bold"
                  style={{ fontSize: '14px' }}
                >
                  Select resolution{' '}
                  <span
                    style={{ color: '#c9190b', display: 'inline' }}
                    aria-label="required"
                  >
                    *
                  </span>
                </span>
              </FlexItem>
              <FlexItem>
                <Popover
                  aria-label="Select resolution help popover"
                  headerContent="Default resolution"
                  bodyContent={
                    <div>
                      A default resolution has been selected for you. To select
                      a different resolution use the radio buttons.
                    </div>
                  }
                >
                  <Button
                    variant="plain"
                    icon={<OutlinedQuestionCircleIcon color="#6a6e73" />}
                    aria-label="Select resolution help"
                    hasNoPadding
                  />
                </Popover>
              </FlexItem>
            </Flex>

            <div className="pf-v6-u-mb-md">
              {resolutions.map((resolution) => (
                <Radio
                  key={resolution.id}
                  id={`resolution-${resolution.id}`}
                  name="resolution-options"
                  label={
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      gap={{ default: 'gapSm' }}
                    >
                      <FlexItem>{resolution.description}</FlexItem>
                      {resolution?.needs_reboot && (
                        <FlexItem>
                          <Tooltip content="System reboot required">
                            <button
                              type="button"
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                display: 'inline-flex',
                              }}
                              aria-label="System reboot required"
                            >
                              <PowerOffIcon color="var(--pf-t--global--icon--color--status--danger--default)" />
                            </button>
                          </Tooltip>
                        </FlexItem>
                      )}
                    </Flex>
                  }
                  isChecked={selectedResolution?.id === resolution.id}
                  onChange={() => setSelectedResolution(resolution)}
                  className="pf-v6-u-mb-md"
                />
              ))}
            </div>
            <HelperText className="pf-v6-u-mb-lg">
              <HelperTextItem>
                The resolution is applied to all affected systems in the plan.
              </HelperTextItem>
            </HelperText>
          </>
        )}
      </ModalBody>
      {!isLoading && (
        <ModalFooter>
          <Button
            variant="primary"
            onClick={handleSave}
            isDisabled={!selectedResolution || isSaving}
            isLoading={isSaving}
          >
            Save
          </Button>
          <Button variant="link" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
};

ResolutionOptionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  issueId: PropTypes.string.isRequired,
  issueDescription: PropTypes.string,
  currentResolution: PropTypes.shape({
    id: PropTypes.string,
    description: PropTypes.string,
  }),
  remediationId: PropTypes.string,
  onResolutionUpdated: PropTypes.func,
};

export default ResolutionOptionsModal;

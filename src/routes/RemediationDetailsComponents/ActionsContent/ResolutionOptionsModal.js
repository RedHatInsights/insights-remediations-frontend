import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Title,
  Radio,
  Button,
  Skeleton,
  HelperText,
  HelperTextItem,
  Popover,
} from '@patternfly/react-core';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import {
  ExternalLinkAltIcon,
  OutlinedQuestionCircleIcon,
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

  const modalTitle = (
    <>
      <Title headingLevel="h2" size="xl">
        Resolution options
      </Title>
    </>
  );

  const modalActions = !isLoading
    ? [
        <Button
          key="save"
          variant="primary"
          onClick={handleSave}
          isDisabled={!selectedResolution || isSaving}
          isLoading={isSaving}
        >
          Save
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>,
      ]
    : [];

  return (
    <Modal
      variant={ModalVariant.medium}
      title={modalTitle}
      isOpen={isOpen}
      onClose={onClose}
      actions={modalActions}
    >
      {isLoading ? (
        <Skeleton screenreaderText="Loading resolution options" />
      ) : (
        <>
          <div>
            <p className="pf-v6-u-mb-md" style={{ fontSize: '14px' }}>
              <strong>{issueDescription} </strong>
              <span>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Add actual knowledgebase link
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pf-v6-u-ml-md"
                >
                  View knowledgebase article{' '}
                  <ExternalLinkAltIcon className="pf-v6-u-ml-sm" />
                </a>
              </span>{' '}
            </p>
          </div>
          <p
            className="pf-v6-u-mb-md pf-v6-u-font-weight-bold"
            style={{ fontSize: '14px' }}
          >
            Select resolution{' '}
            <span
              style={{ color: '#c9190b', display: 'inline' }}
              aria-label="required"
            >
              *
            </span>
            <Popover
              aria-label="Select resolution help popover"
              headerContent="Default resolution"
              bodyContent={
                <div>
                  A default resolution has been selected for you. To select a
                  different resolution, use the options above.
                </div>
              }
            >
              <OutlinedQuestionCircleIcon
                variant="plain"
                className="pf-v6-u-ml-sm"
                size="sm"
                style={{ color: '#6a6e73' }}
              />
            </Popover>
          </p>

          <div className="pf-v6-u-mb-md">
            {resolutions.map((resolution) => (
              <Radio
                key={resolution.id}
                id={`resolution-${resolution.id}`}
                name="resolution-options"
                label={resolution.description}
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

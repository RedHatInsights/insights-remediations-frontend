import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
  DrawerPanelBody,
  Title,
  Content,
  Radio,
  Alert,
  Button,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { patchRemediation } from '../../../api';
import { useParams } from 'react-router-dom';
import useRemediations from '../../../Utilities/Hooks/api/useRemediations';

const ResolutionOptionsDrawer = ({
  isOpen,
  onClose,
  issueId,
  currentResolution,
  remediationId,
  onResolutionUpdated,
}) => {
  const { id } = useParams();
  const [selectedResolution, setSelectedResolution] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const addNotification = useAddNotification();

  const {
    result: resolutionsResult,
    loading: isLoading,
    fetch: fetchResolutions,
  } = useRemediations('getResolution', {
    skip: !isOpen || !issueId,
    params: { issue: issueId },
  });

  useEffect(() => {
    if (isOpen && issueId) {
      fetchResolutions({ issue: issueId });
    }
  }, [isOpen, issueId, fetchResolutions]);

  useEffect(() => {
    if (resolutionsResult?.resolutions) {
      const issueResolutions = resolutionsResult.resolutions || [];
      // Set current resolution as selected, or first one if no current
      const current = issueResolutions.find(
        (r) => r.id === currentResolution?.id,
      );
      setSelectedResolution(current || issueResolutions[0] || null);
    }
  }, [resolutionsResult, currentResolution]);

  const resolutions = resolutionsResult?.resolutions || [];

  const handleSave = async () => {
    if (!selectedResolution) {
      return;
    }

    setIsSaving(true);
    try {
      await patchRemediation(remediationId || id, {
        add: {
          issues: [
            {
              id: issueId,
              resolution: selectedResolution.id,
            },
          ],
        },
      });

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

  const panelContent = (
    <DrawerPanelContent>
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          Resolution options
        </Title>
        <DrawerActions>
          <DrawerCloseButton onClick={onClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <Content component="p" className="pf-v6-u-mb-md">
          A default resolution has been selected for you. To select a different
          resolution, use the options below.
        </Content>

        <Content component="p" className="pf-v6-u-mb-lg">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add actual knowledgebase link
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            View knowledgebase article{' '}
            <ExternalLinkAltIcon className="pf-v6-u-ml-xs" />
          </a>
        </Content>

        {isLoading ? (
          <Content component="p">Loading resolution options...</Content>
        ) : (
          <>
            <Title headingLevel="h3" size="md" className="pf-v6-u-mb-md">
              Resolution options
            </Title>

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

            <Alert
              variant="info"
              isInline
              title="Resolution is applied to all affected systems in the plan."
              className="pf-v6-u-mb-lg"
            />

            <Flex spaceItems={{ default: 'spaceItemsMd' }}>
              <FlexItem>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isDisabled={!selectedResolution || isSaving}
                  isLoading={isSaving}
                >
                  Save
                </Button>
              </FlexItem>
              <FlexItem>
                <Button variant="link" onClick={onClose}>
                  Cancel
                </Button>
              </FlexItem>
            </Flex>
          </>
        )}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <Drawer isExpanded={isOpen}>
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBody />
      </DrawerContent>
    </Drawer>
  );
};

ResolutionOptionsDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  issueId: PropTypes.string.isRequired,
  currentResolution: PropTypes.shape({
    id: PropTypes.string,
    description: PropTypes.string,
  }),
  remediationId: PropTypes.string,
  onResolutionUpdated: PropTypes.func,
};

export default ResolutionOptionsDrawer;

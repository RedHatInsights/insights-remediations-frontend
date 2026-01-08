import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Skeleton,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { getResolutionsBatch } from '../../../api';
import { useParams } from 'react-router-dom';
import useRemediations from '../../../Utilities/Hooks/api/useRemediations';

const ResolutionOptionsDrawer = ({
  isOpen,
  onExpand,
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
  const drawerRef = useRef(undefined);

  const { fetch: updateIssueResolution } = useRemediations(
    'updateRemediationIssue',
    {
      skip: true,
    },
  );

  const handleExpand = () => {
    if (onExpand) {
      onExpand();
    }
    drawerRef.current && drawerRef.current.focus();
  };

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

  const panelContent = (
    <DrawerPanelContent>
      <DrawerHead>
        <span tabIndex={isOpen ? 0 : -1} ref={drawerRef}>
          <Title headingLevel="h2" size="xl" className="pf-v6-u-mb-lg">
            Resolution options
          </Title>
          {issueDescription && (
            <Title headingLevel="h3" size="md" className="pf-v6-u-mb-md">
              {issueDescription}
            </Title>
          )}
        </span>
        <DrawerActions>
          <DrawerCloseButton onClick={onClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody style={{ height: '100%' }}>
        <Flex direction={{ default: 'column' }} style={{ height: '100%' }}>
          <FlexItem grow={{ default: 'grow' }} style={{ overflowY: 'auto' }}>
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
              <Skeleton screenreaderText="Loading resolution options" />
            ) : (
              <>
                <Title headingLevel="h3" size="md" className="pf-v6-u-mb-md">
                  Select resolution
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
                <HelperText className="pf-v6-u-mt-md">
                  <HelperTextItem>
                    A default resolution has been selected for you. To select a
                    different resolution, use the options above.
                  </HelperTextItem>
                </HelperText>
              </>
            )}
          </FlexItem>

          {!isLoading && (
            <FlexItem>
              <Alert
                variant="info"
                isInline
                isPlain
                title="Resolution is applied to all affected systems in the plan."
                className="pf-v6-u-mb-md"
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
            </FlexItem>
          )}
        </Flex>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'auto',
        }}
      >
        <Drawer isExpanded={isOpen} onExpand={handleExpand} position="right">
          <DrawerContent panelContent={panelContent}>
            <DrawerContentBody />
          </DrawerContent>
        </Drawer>
      </div>
    </div>,
    document.body,
  );
};

ResolutionOptionsDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onExpand: PropTypes.func.isRequired,
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

export default ResolutionOptionsDrawer;

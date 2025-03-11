import React, { useState, useEffect, Suspense } from 'react';
import { useDispatch, useSelector as reduxSelector } from 'react-redux';
import { StackItem, Stack, Spinner, Bullseye } from '@patternfly/react-core';

import * as actions from '../actions';
import { downloadPlaybook } from '../api';

import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import RemediationTable from '../components/RemediationTable';
import TestButtons from '../components/TestButtons';

import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

import './Home.scss';

import { PermissionContext } from '../App';
import DeniedState from '../components/DeniedState';
import NoReceptorBanner from '../components/Alerts/NoReceptorBanner';
import {
  useFilter,
  usePagination,
  useSelector,
  useSorter,
} from '../hooks/table';
import ConfirmationDialog from '../components/ConfirmationDialog';
import keyBy from 'lodash/keyBy';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useFeatureFlag } from '../Utilities/Hooks/useFeatureFlag';
import OverViewPageProvider, { OverViewPage } from './OverViewPage';

function verifyDownload(selectedIds, data) {
  let valid = [];
  const byId = keyBy(data, (r) => r.id);

  valid = selectedIds.reduce((result, id) => {
    const remediation = byId[id];

    if (remediation && remediation.issue_count > 0) {
      result.push(remediation.id);
    }

    return result;
  }, []);

  return valid;
}

function download(selectedIds, data, dispatch) {
  const valid = verifyDownload(selectedIds, data);

  if (valid.length === 0) {
    dispatch(
      addNotification({
        variant: 'danger',
        title: `No playbooks downloaded.`,
        description:
          selectedIds.length > 1
            ? 'Selected remediations do not contain any issues to remediate.'
            : 'Selected remediation does not contain any issues to remediate.',
      })
    );
  } else if (valid.length < selectedIds.length) {
    downloadPlaybook(valid);
    dispatch(
      addNotification({
        variant: 'success',
        title:
          valid.length > 1 ? `Downloading playbooks` : `Downloading playbook`,
        description:
          selectedIds.length - valid.length > 1
            ? `${
                selectedIds.length - valid.length
              } remediations with no issues were not downloaded.`
            : `1 remediation with no issues was not downloaded.`,
      })
    );
  } else {
    downloadPlaybook(valid);
    dispatch(
      addNotification({
        variant: 'success',
        title:
          valid.length > 1 ? `Downloading playbooks` : `Downloading playbook`,
      })
    );
  }
}

const SORTING_ITERATEES = [
  null,
  'name',
  'system_count',
  'issue_count',
  'updated_at',
];

const Home = () => {
  const chrome = useChrome();
  useEffect(() => {
    chrome.updateDocumentTitle('Remediations - Automation');
  }, [chrome]);

  const [noReceptorBannerVisible, setNoReceptorBannerVisible] = useState(
    localStorage.getItem('remediations:receptorBannerStatus') !== 'dismissed'
  );
  const sorter = useSorter(4, 'desc');
  const filter = useFilter();
  const selector = useSelector();
  const pagination = usePagination();
  const [remediationCount, setRemediationCount] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(
    false || localStorage.getItem('remediations:showArchived') === 'true'
  );
  const [shouldUpdateGrid, setShouldUpdateGrid] = useState(false);
  const remediations = reduxSelector((state) => state.remediations);
  const dispatch = useDispatch();
  const loadRemediations = (...args) =>
    dispatch(actions.loadRemediations(...args));
  const deleteRemediations = (ids) =>
    dispatch(
      actions.deleteRemediations({
        remediation_ids: ids,
      })
    );
  const itemsCountInPage = remediations?.value?.data.length || 0;

  function load() {
    const column = SORTING_ITERATEES[sorter.sortBy];
    if (showArchived) {
      loadRemediations(
        column,
        sorter.sortDir,
        filter.value,
        pagination.pageSize,
        pagination.offset
      );
    } else {
      const hideArchived = true;
      loadRemediations(
        column,
        sorter.sortDir,
        filter.value,
        pagination.pageSize,
        pagination.offset,
        undefined,
        hideArchived
      );
    }
  }

  useEffect(load, []);

  useEffect(() => {
    if (remediations.status === 'fulfilled' && filter.value === filterText) {
      setShouldUpdateGrid(true);
    }
  }, [
    sorter.sortBy,
    sorter.sortDir,
    filter.value,
    pagination.pageSize,
    pagination.pageDebounced,
    showArchived,
  ]);

  useEffect(() => {
    filter.setValue(filterText);
  }, [filterText]);

  filter.onChange(pagination.reset);
  sorter.onChange(pagination.reset);

  const selectedIds = selector.getSelectedIds();

  const handleNoReceptorToggle = () => {
    setNoReceptorBannerVisible(false);
    localStorage.setItem('remediations:receptorBannerStatus', 'dismissed');
  };

  const sendNotification = (data) => {
    dispatch(addNotification(data));
  };

  const onRemediationCreated = (result) => {
    sendNotification(result.getNotification());
    dispatch(actions.loadRemediations());
  };

  const activeFiltersConfig = {
    filters: filterText.length
      ? [{ category: 'Name', chips: [{ name: filterText }] }]
      : [],
    onDelete: () => {
      setFilterText('');
      filter.setValue('');
    },
  };

  return (
    <div className="page__remediations">
      <PermissionContext.Consumer>
        {(permission) =>
          permission.permissions.read === false ? (
            <DeniedState />
          ) : (
            <React.Fragment>
              <PageHeader>
                <PageHeaderTitle title="Remediations" />
                <TestButtons onRemediationCreated={onRemediationCreated} />
              </PageHeader>
              <PrimaryToolbar
                filterConfig={{
                  items: [
                    {
                      label: 'Search playbooks',
                      type: 'text',
                      filterValues: {
                        id: 'filter-by-string',
                        key: 'filter-by-string',
                        placeholder: 'Search playbooks',
                        value: filterText,
                        onChange: (_e, value) => {
                          setFilterText(value);
                        },
                      },
                    },
                  ],
                }}
                bulkSelect={{
                  items: [
                    {
                      title: 'Select none',
                      onClick: () => selector.props.onSelect('none', true),
                    },
                    {
                      title: `Select page (${itemsCountInPage})`,
                      onClick: () => selector.props.onSelect('page', true),
                    },
                  ],
                  checked:
                    selectedIds.length && remediationCount > selectedIds.length
                      ? null
                      : selectedIds.length,
                  count: selectedIds.length,
                  isDisabled: !itemsCountInPage,
                  onSelect: (isSelected) =>
                    selector.props.onSelect(
                      selectedIds.length ? 'none' : 'page',
                      isSelected
                    ),
                }}
                actionsConfig={{
                  actions: [
                    {
                      label:
                        selectedIds.length > 1
                          ? 'Download playbooks'
                          : 'Download playbook',
                      props: {
                        variant: 'secondary',
                        isDisabled: !selectedIds.length,
                      },
                      onClick: () =>
                        download(
                          selectedIds,
                          remediations.value.data,
                          dispatch
                        ), // TODO state for downloads?
                    },
                    {
                      label: 'Delete playbooks',
                      props: {
                        isDisabled:
                          !permission.permissions.write || !selectedIds.length,
                      },
                      onClick: () => setDialogOpen(true),
                    },
                    {
                      label: showArchived
                        ? 'Hide archived playbooks'
                        : 'Show archived playbooks',
                      onClick: showArchived
                        ? () => {
                            setShowArchived(false);
                            selector.reset();
                            localStorage.setItem(
                              'remediations:showArchived',
                              'false'
                            );
                          }
                        : () => {
                            setShowArchived(true);
                            selector.reset();
                            localStorage.setItem(
                              'remediations:showArchived',
                              'true'
                            );
                          },
                    },
                  ],
                }}
                pagination={{
                  ...pagination.props,
                  itemCount: remediationCount,
                }}
                activeFiltersConfig={activeFiltersConfig}
              />
              <Main>
                <Stack hasGutter>
                  {permission.hasSmartManagement &&
                    !permission.isReceptorConfigured &&
                    noReceptorBannerVisible && (
                      <StackItem>
                        <NoReceptorBanner
                          onClose={() => handleNoReceptorToggle()}
                        />
                      </StackItem>
                    )}
                  {dialogOpen && (
                    <ConfirmationDialog
                      title={
                        selectedIds.length === 1
                          ? 'Remove playbook'
                          : 'Remove playbooks'
                      }
                      text={`${selectedIds.length} ${
                        selectedIds.length > 1 ? 'playbooks' : 'playbook'
                      }
                                            will be removed from Remediations. This is permanent and cannot be undone.`}
                      confirmText={'Remove'}
                      onClose={async (del) => {
                        setDialogOpen(false);
                        if (del) {
                          await deleteRemediations(selectedIds);

                          loadRemediations();
                          activeFiltersConfig.onDelete();
                          selector.reset();
                        }
                      }}
                    />
                  )}
                  <StackItem>
                    <RemediationTable
                      remediations={remediations}
                      loadRemediations={loadRemediations}
                      sorter={sorter}
                      filter={filter}
                      selector={selector}
                      pagination={pagination}
                      shouldUpdateGrid={shouldUpdateGrid}
                      setShouldUpdateGrid={setShouldUpdateGrid}
                      setRemediationCount={setRemediationCount}
                      showArchived={showArchived}
                      setShowArchived={setShowArchived}
                    />
                  </StackItem>
                </Stack>
              </Main>
            </React.Fragment>
          )
        }
      </PermissionContext.Consumer>
    </div>
  );
};

const RemediationHome = () => {
  const remediationsV2 = useFeatureFlag('remediationsV2');
  return remediationsV2 === undefined ? (
    <Bullseye>
      <Spinner />
    </Bullseye>
  ) : remediationsV2 ? (
    <OverViewPageProvider />
  ) : (
    <Home />
  );
};

export default RemediationHome;

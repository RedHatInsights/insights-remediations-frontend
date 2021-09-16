import React, { useState, useEffect, useRef } from 'react';
import orderBy from 'lodash/orderBy';
import { CheckIcon, TimesIcon } from '@patternfly/react-icons';

import PropTypes from 'prop-types';
import {
  Modal,
  ModalVariant,
  ToolbarItem,
  ToolbarGroup,
} from '@patternfly/react-core';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import {
  ConditionalFilter,
  conditionalFilterType,
} from '@redhat-cloud-services/frontend-components/ConditionalFilter';

import { TableToolbar } from '@redhat-cloud-services/frontend-components/TableToolbar';
import { inventoryUrlBuilder } from '../../Utilities/urls';
import reducers from '../../store/reducers';
import RemediationDetailsSystemDropdown from '../RemediationDetailsSystemDropdown';
import ConfirmationDialog from '../ConfirmationDialog';
import { getSystemName } from '../../Utilities/model';
import { IconInline } from '../Layouts/IconInline';

export const SystemsStatusModal = ({
  isOpen,
  onClose,
  issue,
  remediation,
  onDelete,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [system, setSystem] = useState({});
  const [systemStatuses, setSystemStatuses] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [filterText, setFilterText] = useState('');
  const inventory = useRef(null);
  const { current: urlBuilder } = useRef(inventoryUrlBuilder(issue));

  useEffect(() => {
    const statuses = {};
    issue.systems.map((system) => {
      statuses[system.id] =
        system.resolved === true ? (
          <IconInline icon={<CheckIcon />} text="Remediated" />
        ) : (
          <IconInline icon={<TimesIcon />} text="Not remediated" />
        );
    });
    setSystemStatuses(statuses);
  }, []);

  // eslint-disable-next-line react/display-name
  const detailDropdown = (remediation, issue) => (system) =>
    (
      <RemediationDetailsSystemDropdown
        remediation={remediation}
        issue={issue}
        system={system}
      />
    );

  const generateStatus = (id) => {
    return systemStatuses[id];
  };

  const onRefresh = (options) => {
    if (inventory && inventory.current) {
      setPage(options.page);
      setPageSize(options.per_page);
      inventory.current.onRefreshData(options);
    }
  };

  return (
    <React.Fragment>
      <Modal
        className="remediations"
        variant={ModalVariant.large}
        title={`System${issue.systems.length > 1 ? 's' : ''} for action ${
          issue.description
        }`}
        isOpen={isOpen}
        onClose={onClose}
        isFooterLeftAligned
      >
        <div className="rem-c-toolbar__filter">
          <InventoryTable
            onLoad={({ mergeWithEntities, INVENTORY_ACTION_TYPES }) =>
              getRegistry().register({
                ...mergeWithEntities(
                  reducers.inventoryEntitiesReducer({
                    INVENTORY_ACTION_TYPES,
                    detailDropdown: detailDropdown(remediation, issue),
                    urlBuilder,
                    generateStatus,
                  })()
                ),
              })
            }
            ref={inventory}
            items={orderBy(
              issue.systems.filter((s) =>
                getSystemName(s).includes(filterText)
              ),
              [(s) => getSystemName(s), (s) => s.id]
            )}
            onRefresh={onRefresh}
            page={page}
            total={issue.systems.length}
            perPage={pageSize}
            hasCheckbox={false}
            actions={[
              {
                title: ' Remove system',
                onClick: (event, rowId, rowData) => {
                  setSystem(rowData);
                  setDeleteDialogOpen(true);
                },
              },
            ]}
          >
            <TableToolbar>
              <ToolbarGroup>
                <ToolbarItem>
                  <ConditionalFilter
                    items={[
                      {
                        value: 'display_name',
                        label: 'Name',
                        filterValues: {
                          placeholder: 'Search by name',
                          type: conditionalFilterType.text,
                          value: filterText,
                          onChange: (e, selected) => setFilterText(selected),
                        },
                      },
                    ]}
                  />
                </ToolbarItem>
              </ToolbarGroup>
            </TableToolbar>
          </InventoryTable>
        </div>
      </Modal>
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        text={`Removing the system ${getSystemName(system)} from the action ${
          issue.description
        }
                    will remove this system’s remediation from the playbook.`}
        onClose={(value) => {
          setDeleteDialogOpen(false);
          value && onDelete(remediation.id, issue.id, system.id);
        }}
      />
    </React.Fragment>
  );
};

SystemsStatusModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  issue: PropTypes.object,
  remediation: PropTypes.object,
  onDelete: PropTypes.func,
};

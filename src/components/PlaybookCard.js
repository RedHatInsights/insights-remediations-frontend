import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardActions,
  CardTitle,
  Dropdown,
  DropdownItem,
  KebabToggle,
  Progress,
  ProgressMeasureLocation,
  ProgressVariant,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { patchRemediation } from '../actions.js';
import { generateUniqueId } from './Alerts/PlaybookToastAlerts';
import './PlaybookCard.scss';

function buildName(name, id) {
  return (
    <Link to={`/${id}`} className="rem-c-playbook-card__header--name">
      {name}
    </Link>
  );
}

function actionWrapper(actionsList, callback, dispatch) {
  Promise.all(
    actionsList.map((event) => {
      dispatch(event);
      return event.payload;
    })
  ).then(callback);
}

const PlaybookCardHeader = ({
  remediation,
  remediationIdx,
  archived,
  selector,
  setExecuteOpen,
  update,
  loadRemediation,
  getConnectionStatus,
  downloadPlaybook,
  permission,
  setActiveAlert,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isArchived, setIsArchived] = useState(archived);
  const dispatch = useDispatch();
  const dropdownItems = [];

  const archiveHandler = () => {
    actionWrapper(
      [patchRemediation(remediation.id, { archived: !isArchived })],
      () => {
        setIsArchived(!isArchived);
        update(true);
      },
      dispatch
    );
  };

  dropdownItems.push(
    <DropdownItem
      key="execute"
      id="execute"
      isDisabled={!permission.isReceptorConfigured || isArchived}
      className={`${
        (!permission.hasSmartManagement || !permission.permissions.execute) &&
        'ins-m-not-entitled'
      }`}
      onClick={() => {
        setExecuteOpen(false);
        actionWrapper(
          [
            loadRemediation(remediation.id),
            getConnectionStatus(remediation.id),
          ],
          () => {
            setExecuteOpen(true);
            setIsOpen(false);
          },
          dispatch
        );
      }}
    >
      Execute playbook
    </DropdownItem>
  );

  dropdownItems.push(
    <DropdownItem
      key="download"
      onClick={() => {
        downloadPlaybook(remediation.id);
        setIsOpen(false);
        setActiveAlert({
          key: generateUniqueId(),
          title: `Preparing playbook for download`,
          description: 'Once complete, your download will start automatically.',
          variant: 'info',
        });
      }}
    >
      Download playbook
    </DropdownItem>
  );

  isArchived
    ? dropdownItems.push(
        <DropdownItem
          key="restore"
          onClick={() => {
            archiveHandler();
            setIsOpen(false);
            dispatch(
              addNotification({
                variant: 'info',
                title: `Restored playbook ${remediation.name}`,
              })
            );
          }}
        >
          Restore playbook
        </DropdownItem>
      )
    : dropdownItems.push(
        <DropdownItem
          key="archive"
          onClick={() => {
            archiveHandler();
            setIsOpen(false);
            dispatch(
              addNotification({
                variant: 'info',
                title: `Archived playbook ${remediation.name}`,
              })
            );
          }}
        >
          Archive playbook
        </DropdownItem>
      );

  return (
    <CardHeader className="rem-c-playbook-card__header">
      <CardActions>
        <Dropdown
          key="dropdown"
          id={`${remediation.id}-dropdown`}
          isOpen={isOpen}
          isPlain
          onSelect={(f) => f}
          toggle={
            <KebabToggle
              id={`${remediation.id}-toggle`}
              onToggle={(isOpen) => setIsOpen(isOpen)}
            />
          }
          dropdownItems={dropdownItems}
          position={'right'}
        />
        <input
          type="checkbox"
          name={`${remediation.id}-checkbox`}
          checked={selector.getSelectedIds().includes(remediation.id)}
          onChange={(e) => {
            selector.props.onSelect(e, e.target.checked, remediationIdx);
          }}
          aria-label={`${remediation.id}-checkbox`}
        />
      </CardActions>
      <CardTitle>
        <Stack hasGutter>
          <StackItem className="rem-c-playbook-card__header--title">
            {isArchived && (
              <Badge isRead className="rem-c-playbook-card__header--badge">
                Archived
              </Badge>
            )}
            {buildName(remediation.name, remediation.id)}
          </StackItem>
          <StackItem className="rem-c-playbook-card__header--last-modified">
            Last modified: <DateFormat date={remediation.updated_at} />
          </StackItem>
        </Stack>
      </CardTitle>
    </CardHeader>
  );
};

PlaybookCardHeader.propTypes = {
  remediation: PropTypes.object.isRequired,
  remediationIdx: PropTypes.number.isRequired,
  archived: PropTypes.bool.isRequired,
  selector: PropTypes.object.isRequired,
  setExecuteOpen: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  loadRemediation: PropTypes.func.isRequired,
  getConnectionStatus: PropTypes.func.isRequired,
  downloadPlaybook: PropTypes.func.isRequired,
  permission: PropTypes.object.isRequired,
  setActiveAlert: PropTypes.func.isRequired,
};

const renderActionStatus = (complete, total) => {
  return complete === total && complete !== 0 ? (
    <div>
      <CheckCircleIcon className="rem-c-success" /> {complete} of &nbsp;{total}
    </div>
  ) : (
    `${complete} of ${total}`
  );
};

const renderProgress = (complete, total) => {
  return complete === total && complete !== 0 ? (
    <Progress
      className="rem-c-playbook-card__progress rem-c-playbook-card__progress--success"
      value={100}
      measureLocation={ProgressMeasureLocation.none}
      variant={ProgressVariant.success}
    />
  ) : (
    <Progress
      className="rem-c-playbook-card__progress"
      value={(complete / total) * 100}
      measureLocation={ProgressMeasureLocation.none}
    />
  );
};

export const PlaybookCard = ({
  remediation,
  remediationIdx,
  archived,
  selector,
  setExecuteOpen,
  //executeOpen,
  update,
  loadRemediation,
  getConnectionStatus,
  downloadPlaybook,
  permission,
  setActiveAlert,
}) => {
  // const [ poll, setPoll ] = useState(executeOpen => !executeOpen);
  // const [ curResolved, setCurResolved ] = useState(remediation.resolved_count);
  // const selected = reduxSelector(state => state.selectedRemediation);
  // const [ loaded, setLoaded ] = useState(false);
  // const dispatch = useDispatch();

  // useEffect(() => {
  //     if (poll && !archived) {
  //         const interval = setInterval(() => {
  //             if (poll) {
  //                 actionWrapper([
  //                     loadRemediation(remediation.id)
  //                 ], () => { setLoaded(true); }, dispatch);
  //             }
  //         }, 15000);
  //         return () => clearInterval(interval);
  //     }
  // }, [ poll ]);

  // useEffect(() => {
  //     if (loaded) {
  //         if (curResolved !== selected.remediation.resolved_count) {
  //             setCurResolved(selected.remediation.resolved_count);
  //         }
  //     }
  // }, [ loaded ]);

  // useEffect(() => {
  //     if (executeOpen) {
  //         setPoll(false);
  //     } else {
  //         setPoll(true);
  //     }
  // }, [ executeOpen ]);

  return (
    <Card className="rem-c-playbook-card" isCompact>
      <PlaybookCardHeader
        remediation={remediation}
        remediationIdx={remediationIdx}
        archived={archived}
        selector={selector}
        setExecuteOpen={setExecuteOpen}
        update={update}
        loadRemediation={loadRemediation}
        getConnectionStatus={getConnectionStatus}
        downloadPlaybook={downloadPlaybook}
        permission={permission}
        setActiveAlert={setActiveAlert}
      />
      <CardBody className="rem-c-playbook-card__body">
        <Split hasGutter className="rem-c-playbook-card__body--split">
          <SplitItem>
            <Stack>
              <StackItem className="rem-c-playbook-card__body--titles">
                Systems
              </StackItem>
              <StackItem className="rem-c-playbook-card__body--values">
                {remediation.system_count}
              </StackItem>
            </Stack>
          </SplitItem>
          <SplitItem>
            <Stack>
              <StackItem className="rem-c-playbook-card__body--titles">
                Complete actions
              </StackItem>
              <StackItem className="rem-c-playbook-card__body--values">
                {renderActionStatus(
                  remediation.resolved_count,
                  remediation.issue_count
                )}
              </StackItem>
            </Stack>
          </SplitItem>
        </Split>
      </CardBody>
      {renderProgress(remediation.resolved_count, remediation.issue_count)}
    </Card>
  );
};

PlaybookCard.propTypes = {
  remediation: PropTypes.object.isRequired,
  remediationIdx: PropTypes.number.isRequired,
  archived: PropTypes.bool.isRequired,
  selector: PropTypes.object.isRequired,
  setExecuteOpen: PropTypes.func.isRequired,
  executeOpen: PropTypes.bool.isRequired,
  update: PropTypes.func.isRequired,
  loadRemediation: PropTypes.func.isRequired,
  getConnectionStatus: PropTypes.func.isRequired,
  downloadPlaybook: PropTypes.func.isRequired,
  permission: PropTypes.object.isRequired,
  setActiveAlert: PropTypes.object.isRequired,
};

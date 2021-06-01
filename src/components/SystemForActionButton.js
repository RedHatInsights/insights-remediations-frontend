import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { deleteRemediationIssueSystem } from '../actions';
import { SystemsStatusModal } from './Modals/SystemsStatusModal';
import './SystemForActionButton.scss';

export const SystemForActionButton = ({ issue, remediation, title }) => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  return (
    <React.Fragment>
      <a onClick={() => setOpen(true)}>{title}</a>
      <SystemsStatusModal
        isOpen={open}
        onClose={() => setOpen(false)}
        issue={issue}
        remediation={remediation}
        onDelete={(id, issue, system) =>
          dispatch(deleteRemediationIssueSystem(id, issue, system))
        }
      />
    </React.Fragment>
  );
};

SystemForActionButton.propTypes = {
  issue: PropTypes.object.isRequired,
  remediation: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
};

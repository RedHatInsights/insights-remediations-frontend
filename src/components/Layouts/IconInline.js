import React from 'react';
import PropTypes from 'prop-types';
import './IconInline.scss';

export const IconInline = ({ icon, text }) => {
  return (
    <div className="rem-c-icon-inline">
      {icon}
      <span className="rem-c-icon-inline__text">{text}</span>
    </div>
  );
};

IconInline.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
};

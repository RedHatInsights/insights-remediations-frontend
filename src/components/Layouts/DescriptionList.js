import React from 'react';
import propTypes from 'prop-types';
import classnames from 'classnames';

import './DescriptionList.scss';

const DescriptionList = ({
  title,
  className,
  children,
  isBold,
  hasGutter,
  needsPointer,
  ...props
}) => {
  const descriptionListClasses = classnames(
    'rem-c-description-list__description',
    { ['rem-c-description-list__description--bold']: isBold },
    { ['rem-c-description-list__description--withGutter']: hasGutter },
    { ['rem-c-description-list__description--needsPointer']: needsPointer }
  );

  const mainClasses = classnames(className, 'rem-c-description-list');

  return (
    <dl className={mainClasses} {...props}>
      <dt className="rem-c-description-list__title">
        <b>{title}</b>
      </dt>
      <dd className={descriptionListClasses}> {children} </dd>
    </dl>
  );
};

export default DescriptionList;

DescriptionList.propTypes = {
  title: propTypes.string,
  children: propTypes.any,
  isBold: propTypes.bool,
  className: propTypes.string,
  hasGutter: propTypes.bool,
  needsPointer: propTypes.bool,
};

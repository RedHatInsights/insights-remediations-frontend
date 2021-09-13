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
    'rem-l-description-list__description',
    { ['rem-l-description-list__description--bold']: isBold },
    { ['rem-l-description-list__description--withGutter']: hasGutter },
    { ['rem-l-description-list__description--needsPointer']: needsPointer }
  );

  const mainClasses = classnames(className, 'rem-l-description-list');

  return (
    <dl className={mainClasses} {...props}>
      <dt className="rem-l-description-list__title">
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

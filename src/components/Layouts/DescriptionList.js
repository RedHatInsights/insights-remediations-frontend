import React from 'react';
import propTypes from 'prop-types';
import classnames from 'classnames';

import './DescriptionList.scss';

const DescriptionList = ({ title, className, children, isBold, hasGutter, needsPointer, ...props }) => {

    const descriptionListClasses = classnames(
        'ins-l-description-list__description',
        { ['ins-l-description-list__description--bold']: isBold },
        { ['ins-l-description-list__description--withGutter']: hasGutter },
        { ['ins-l-description-list__description--needsPointer']: needsPointer }
    );

    const mainClasses = classnames(
        className,
        'ins-l-description-list'
    );

    return (
        <dl className={ mainClasses } { ...props }>
            <dt className='ins-l-description-list__title'><b>{ title }</b></dt>
            <dd className={ descriptionListClasses }> { children } </dd>
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
    needsPointer: propTypes.bool
};

import React from 'react';
import propTypes from 'prop-types';
import classnames from 'classnames';

import './DescriptionList.scss';

const DescriptionList = ({ title, children, isBold, ...props }) => {

    const DescriptionListClasses = classnames(
        'ins-l-description-list__description',
        { ['ins-l-description-list__description--bold']: isBold }
    );

    return (
        <dl className='ins-l-description-list' { ...props }>
            <dt className='ins-l-description-list__title'><b>{ title }</b></dt>
            <dd className={ DescriptionListClasses }> { children } </dd>
        </dl>
    );
};

export default DescriptionList;

DescriptionList.propTypes = {
    title: propTypes.string,
    children: propTypes.any,
    isBold: propTypes.bool
};

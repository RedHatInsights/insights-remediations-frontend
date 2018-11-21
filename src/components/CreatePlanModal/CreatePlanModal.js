import React from 'react';
import propTypes from 'prop-types';

import classNames from 'classnames';

import PlanName from './ModalSteps/PlanName.js';
import PlanSystems from './ModalSteps/PlanSystems.js';

const CreatePlanModal = ({ step, className, ...props }) => {

    let modalClass = classNames(
        className
    );

    switch (step) {

        // Name Plan
        case 0:
            return (<PlanName/>);

        // Select systems that plan applies to
        case 1:
            return (<PlanSystems/>);
        default:
            return (<span className={ modalClass } { ...props } widget-type='CreatePlanModal'> Step { step + 1 } </span>);
    }
};

export default CreatePlanModal;

CreatePlanModal.propTypes = {
    step: propTypes.number,
    className: propTypes.string
};

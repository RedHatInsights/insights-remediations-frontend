import React from 'react';

import {
    Form,
    FormGroup,
    TextInput
} from '@patternfly/react-core';

const PlanName = () => {

    return (
        <React.Fragment>
            <h2> Name your plan </h2>
            <Form>
                <FormGroup
                    label="Plan Name"
                    isRequired
                    fieldId="plan-name"
                >
                    <TextInput
                        isRequired
                        type="text"
                        value=''
                        placeholder="What do you want to call your grand plan?"
                        aria-label='Name your plan'
                    />
                </FormGroup>
            </Form>
        </React.Fragment>
    );
};

export default PlanName;

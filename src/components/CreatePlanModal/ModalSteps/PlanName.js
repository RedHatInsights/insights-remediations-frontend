import React, { Component } from 'react';

import { Form, FormGroup, TextInput } from '@patternfly/react-core';

class PlanName extends Component {
  constructor() {
    super();
    this.state = {
      value: '',
    };
  }

  handleTextInputChange = (value) => {
    this.setState({ value });
  };

  render() {
    const { value } = this.state;

    return (
      <React.Fragment>
        <h2> Name your plan </h2>
        <Form>
          <FormGroup label="Plan Name" isRequired fieldId="plan-name">
            <TextInput
              isRequired
              type="text"
              value={value}
              onChange={(_event, value) => this.handleTextInputChange(value)}
              placeholder="What do you want to call your grand plan?"
              aria-label="Name your plan"
              autoFocus
            />
          </FormGroup>
        </Form>
      </React.Fragment>
    );
  }
}

export default PlanName;

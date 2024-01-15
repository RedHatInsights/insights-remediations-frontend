import React, { Component } from 'react';

import {
	Form,
	FormGroup,
	Radio
} from '@patternfly/react-core';
import {
	Select,
	SelectOption
} from '@patternfly/react-core/deprecated';

import './PlanSystems.scss';

class PlanSystems extends Component {
  constructor() {
    super();
    this.state = {
      systemValue: 'Select a System',
      groupValue: 'Select a System',
    };
    this.onChangeSystemOptions = this.onChangeSystemOptions.bind(this);
    this.onChangeSystemGroup = this.onChangeSystemGroup.bind(this);

    // TODO: Change these to actual system groups
    this.systemOptions = [
      { value: 'Select a System', label: 'Select a System', disabled: true },
      { value: 'System 1', label: 'System 1', disabled: false },
      { value: 'System 2', label: 'System 2', disabled: false },
    ];
    this.groupOptions = [
      {
        value: 'Select a System',
        label: 'Select a System Group',
        disabled: true,
      },
      { value: 'Group 1', label: 'Group 1', disabled: false },
      { value: 'Group 2', label: 'Group 2', disabled: false },
    ];
  }

  onChangeSystemOptions(systemValue) {
    this.setState({ systemValue });
  }

  onChangeSystemGroup(groupValue) {
    this.setState({ groupValue });
  }

  render() {
    return (
      <React.Fragment>
        <h2> Select the system(s) for the plan </h2>
        <Form className="rem-c-form-select-systems">
          <FormGroup isRequired fieldId="select-systems">
            <Radio
              id="one-system"
              name="select-systems"
              label="A System"
              aria-label="A System"
            />
            <Select
              value={this.state.systemValue}
              onChange={this.onChangeSystemOptions}
              aria-label="Select Input"
              ouiaId="select"
            >
              {this.systemOptions.map((option, index) => (
                <SelectOption
                  isDisabled={option.disabled}
                  key={index}
                  value={option.value}
                  label={option.label}
                />
              ))}
            </Select>

            <Radio
              id="system-group"
              name="select-systems"
              label="System Group"
              aria-label="System Group"
            />
            <Select
              value={this.state.groupValue}
              onChange={this.onChangeSystemGroup}
              aria-label="Select Input"
            >
              {this.groupOptions.map((option, index) => (
                <SelectOption
                  isDisabled={option.disabled}
                  key={index}
                  value={option.value}
                  label={option.label}
                />
              ))}
            </Select>

            <Radio
              id="all-systems"
              name="select-systems"
              label="All Systems (x)"
              aria-label="All Systems"
            />
          </FormGroup>
        </Form>
      </React.Fragment>
    );
  }
}

export default PlanSystems;

import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import RemediationStatusToast from '../RemediationStatusToast';

describe('ExecuteBanner component', () => {

    it('should render', () => {
        const wrapper = mount(<RemediationStatusToast name='passed remediation'/>);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render failed', () => {
        const wrapper = mount(<RemediationStatusToast name='failed remediation' status='failed'/>);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});

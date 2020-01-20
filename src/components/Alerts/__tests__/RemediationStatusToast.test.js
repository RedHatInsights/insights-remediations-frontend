import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import RemediationStatusToast from '../RemediationStatusToast';

describe('ExecuteBanner component', () => {
    
    it('should render', () => {
        const wrapper = shallow(<RemediationStatusToast name='passed remediation'/>);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render failed', () => {
        const wrapper = shallow(<RemediationStatusToast name='failed remediation' status='failed'/>);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});

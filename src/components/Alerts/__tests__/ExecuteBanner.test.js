import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import ExecuteBanner from '../ExecuteBanner';

describe('ExecuteBanner component', () => {

    it('should render', () => {
        const wrapper = shallow(<ExecuteBanner/>);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    /* eslint-disable no-console */
    it('should click cancel with default prop', () => {
        console.log = jest.fn();
        const wrapper = mount(<ExecuteBanner/>);
        wrapper.find('AlertActionLink').simulate('click');
        expect(console.log.mock.calls[0][0]).toBe('Cancel Remediation');
    });
    /* eslint-enable no-console */

    it('should click cancel', () => {
        const mockCallBack = jest.fn();
        const wrapper = mount(<ExecuteBanner onCancel={ mockCallBack }/>);
        wrapper.find('AlertActionLink').simulate('click');
        expect(mockCallBack.mock.calls.length).toEqual(1);
    });
});

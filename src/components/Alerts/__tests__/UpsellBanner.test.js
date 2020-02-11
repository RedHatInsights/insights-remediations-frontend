import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import UpsellBanner from '../UpsellBanner';

describe('UpsellBanner component', () => {

    it('should render', () => {
        const wrapper = shallow(<UpsellBanner/>);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    /* eslint-disable no-console */
    it('should click close with default prop', () => {
        console.log = jest.fn();
        const wrapper = mount(<UpsellBanner/>);
        wrapper.find('AlertActionCloseButton').simulate('click');
        expect(console.log.mock.calls[0][0]).toBe('Close banner');
    });
    /* eslint-enable no-console */

    it('should click close', () => {
        const mockCallBack = jest.fn();
        const wrapper = mount(<UpsellBanner onClose={ mockCallBack }/>);
        wrapper.find('AlertActionCloseButton').simulate('click');
        expect(mockCallBack.mock.calls.length).toEqual(1);
    });
});

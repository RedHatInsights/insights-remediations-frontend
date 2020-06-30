import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import UpsellBanner from '../UpsellBanner';

describe('UpsellBanner component', () => {

    it('should render', () => {
        const wrapper = shallow(<UpsellBanner/>);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should call default prop', () => {
        const mockCallBack = jest.fn();
        const wrapper = mount(<UpsellBanner/>);
        wrapper.find('Button').simulate('click');
        expect(mockCallBack.mock.results[0]).toBeUndefined();
    });

    it('should click close', () => {
        const mockCallBack = jest.fn();
        const wrapper = mount(<UpsellBanner onClose={ mockCallBack }/>);
        wrapper.find('Button').simulate('click');
        expect(mockCallBack.mock.calls.length).toEqual(1);
    });
});

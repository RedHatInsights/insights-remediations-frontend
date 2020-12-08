import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import DescriptionList from '../DescriptionList';

describe('DescriptionList component', () => {
  it('should render', () => {
    const wrapper = shallow(
      <DescriptionList title="title">DescriptionList</DescriptionList>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render with bold', () => {
    const wrapper = shallow(
      <DescriptionList isBold title="title">
        DescriptionList
      </DescriptionList>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});

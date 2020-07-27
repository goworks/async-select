import React from 'react';
import { shallow } from 'enzyme';
import BizComponent from '../src/index';
import '../src/main.scss';

it('renders', () => {
  const wrapper = shallow(<BizComponent />);
  expect(wrapper.find('.biz-component-class').length).toBe(1);
});

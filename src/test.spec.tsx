import React from 'react';
import { shallow } from 'enzyme';
import { PluridApp } from './index';

it('renders without crashing', () => {
    shallow(<PluridApp />);
});

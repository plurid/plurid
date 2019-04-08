import React from 'react';
import { shallow } from 'enzyme';
import { PluridApp } from './';

it('renders without crashing', () => {
    shallow(<PluridApp />);
});

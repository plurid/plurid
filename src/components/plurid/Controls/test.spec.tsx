import React from 'react';
import { shallow } from 'enzyme';
import PluridControls from './';

describe('PluridControls', () => {
    it('renders without crashing', () => {
        shallow(<PluridControls />);
    });
});

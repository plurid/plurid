import React from 'react';
import { shallow } from 'enzyme';
import PluridApp from '.';

describe('PluridApp', () => {
    it('renders without crashing', () => {
        shallow(<PluridApp />);
    });
});

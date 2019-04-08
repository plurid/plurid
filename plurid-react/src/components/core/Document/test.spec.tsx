import React from 'react';
import { shallow } from 'enzyme';
import PluridDocument from './';



describe('PluridDocument', () => {
    it('renders without crashing', () => {
        shallow(<PluridDocument />);
    });
});

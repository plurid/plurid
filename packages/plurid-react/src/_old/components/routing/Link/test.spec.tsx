import React from 'react';
import { shallow } from 'enzyme';
import PluridLink from '.';



describe('PluridLink', () => {
    it('renders without crashing', () => {
        shallow(<PluridLink page="/" />);
    });
});

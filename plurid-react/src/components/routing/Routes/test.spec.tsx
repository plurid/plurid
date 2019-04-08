import React from 'react';
import { shallow } from 'enzyme';
import PluridRoutes from './';

describe('PluridRoutes', () => {
    it('renders without crashing', () => {
        shallow(<PluridRoutes subdomain="testing" />);
    });
});

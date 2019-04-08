import React from 'react';
import { shallow } from 'enzyme';
import PluridRouter from './';

describe('PluridRouter', () => {
    it('renders without crashing', () => {
        shallow(<PluridRouter />);
    });
});

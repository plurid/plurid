import React from 'react';
import { shallow } from 'enzyme';
import PluridPage from '.';

describe('PluridPage', () => {
    it('renders without crashing', () => {
        shallow(<PluridPage />);
    });
});

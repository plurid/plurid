import React from 'react';
import { shallow } from 'enzyme';
import PluridRoot from './';

describe('PluridRoot', () => {
    it('renders without crashing', () => {
        shallow(<PluridRoot />);
    });
});

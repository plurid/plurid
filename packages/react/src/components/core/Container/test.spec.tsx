import React from 'react';
import { shallow } from 'enzyme';
import PluridContainer from '.';

describe('PluridContainer', () => {
    it('renders without crashing', () => {
        shallow(<PluridContainer />);
    });
});

import React from 'react';
import { shallow } from 'enzyme';
import PluridRoots from '.';

describe('PluridRoots', () => {
    it('renders without crashing', () => {
        shallow(<PluridRoots />);
    });
});

import React from 'react';
import { shallow } from 'enzyme';
import PluridSpace from '.';

describe('PluridSpace', () => {
    it('renders without crashing', () => {
        shallow(<PluridSpace />);
    });
});

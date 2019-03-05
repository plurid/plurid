import React from 'react';
import { shallow } from 'enzyme';
import PluridOptions from './';

describe('PluridOptions', () => {
    it('renders without crashing', () => {
        shallow(<PluridOptions />);
    });
});

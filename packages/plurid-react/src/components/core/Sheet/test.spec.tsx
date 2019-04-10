import React from 'react';
import { shallow } from 'enzyme';
import PluridSheet from '.';

describe('PluridSheet', () => {
    it('renders without crashing', () => {
        shallow(<PluridSheet />);
    });
});

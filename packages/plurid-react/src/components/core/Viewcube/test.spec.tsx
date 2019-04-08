import React from 'react';
import { shallow } from 'enzyme';
import PluridViewcube from './';

describe('PluridViewcube', () => {
    it('renders without crashing', () => {
        shallow(<PluridViewcube />);
    });
});

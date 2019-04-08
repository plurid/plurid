import React from 'react';
import { shallow } from 'enzyme';
import PluridContent from './';

describe('PluridContent', () => {
    it('renders without crashing', () => {
        shallow(<PluridContent />);
    });
});

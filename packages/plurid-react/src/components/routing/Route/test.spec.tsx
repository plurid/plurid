import React from 'react';
import { shallow } from 'enzyme';
import PluridRoute from './';

describe('PluridRoute', () => {
    it('renders without crashing', () => {
        shallow(<PluridRoute page="/" component="component" />);
    });
});

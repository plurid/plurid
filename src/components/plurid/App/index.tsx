import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PluridContainer from '../Container';

export interface IPluridAppProps {
    theme?: string;
}

class PluridApp extends Component<IPluridAppProps> {
    public static propTypes = {
        theme: PropTypes.string,
    }

    public render() {
        const { children } = this.props;

        return (
            <PluridContainer>
                {children}
            </PluridContainer>
        );
    }
}

export default PluridApp;

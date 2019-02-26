import React, { Component } from 'react';
import PluridContainer from '../Container';

export interface IPluridAppProps {
    theme?: string;
}

class PluridApp extends Component<IPluridAppProps> {
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

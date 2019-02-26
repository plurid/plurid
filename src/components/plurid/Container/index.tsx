import React, { Component } from 'react';
import PluridSpace from '../Space';

class PluridContainer extends Component {
    public render() {
        const { children } = this.props;

        return (
            <PluridSpace>
                {children}
            </PluridSpace>
        );
    }
}

export default PluridContainer;

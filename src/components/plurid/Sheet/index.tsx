import React, { Component } from 'react';

class PluridSheet extends Component {
    public render() {
        const { children } = this.props;

        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
}

export default PluridSheet;

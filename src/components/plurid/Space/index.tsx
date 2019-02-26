import React, { Component } from 'react';

class PluridSpace extends Component {
    public render() {
        const { children } = this.props;

        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
}

export default PluridSpace;

import React, { Component } from 'react';

class PluridRoots extends Component {
    public render() {
        const { children } = this.props;

        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
}

export default PluridRoots;

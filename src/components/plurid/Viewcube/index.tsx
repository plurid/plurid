import React, { Component } from 'react';

class PluridViewcube extends Component {
    public render() {
        const { children } = this.props;

        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
}

export default PluridViewcube;

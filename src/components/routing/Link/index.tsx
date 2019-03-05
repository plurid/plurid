import React, { Component } from 'react';



export interface IPluridLinkProps {
    page: string;
}


class PluridLink extends Component<IPluridLinkProps, {}> {
    public render() {
        const { children } = this.props;

        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
}

export default PluridLink;

import React, { Component } from 'react';



export interface IPluridRoutesProps {
    subdomain: string;
}


class PluridRoutes extends Component<IPluridRoutesProps, {}> {
    public render() {
        const { children } = this.props;

        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
}

export default PluridRoutes;

import React, { Component } from 'react';



export interface IPluridRouteProps {
    exact?: boolean;
    page: string;
    component: any;
    subdomain?: string;
}


class PluridRoute extends Component<IPluridRouteProps, {}> {
    public render() {
        const { children } = this.props;

        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
}

export default PluridRoute;

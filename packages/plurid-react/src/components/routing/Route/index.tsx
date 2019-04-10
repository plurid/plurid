import React, { Component } from 'react';

import PluridRoutingContext from '../RoutingContext';



export interface IPluridRouteProps {
    exact?: boolean;
    page: string;
    component: any;
    subDomain?: string;
}


class PluridRoute extends Component<IPluridRouteProps, {}> {
    public static displayName = "Plurid.Route";

    public render() {
        const { component, page } = this.props;

        return (
            <PluridRoutingContext.Consumer>
                {context => {
                    const route = {
                        component,
                        params: {},
                        path: page,
                    }
                    context.registerRoute(route);
                    return (null);
                }}
            </PluridRoutingContext.Consumer>
        );
    }
}

export default PluridRoute;

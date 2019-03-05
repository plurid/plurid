import React, { Component } from 'react';



export interface IPluridRouterProps {
    domain?: string; // domain can be 'plurid.com', or unspecified
    alwaysOnDomain: boolean; // if the user enters the site through a sublink/subdomain,
                             // the user gets redirected in the browser's url to the domain
                             // and the plurid pages have the user link
}


class PluridRouter extends Component<IPluridRouterProps, {}> {
    public render() {
        const { children } = this.props;

        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
}

export default PluridRouter;

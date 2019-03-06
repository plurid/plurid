import React, { Component } from 'react';


export interface IPluridRouterProps {
    /**
     * The domain can be unspecified or be the site's main domain, e.g. 'plurid.com'.
     * The hostname ('plurid') and the domain extension ('.com') will be resolved
     * automatically, also the localhost case.
     */
    domain?: string;
    /**
     * When the user enters the site through a sublink/subdomain
     * he/she gets redirected in the browser's URL to the specified domain
     * and the Plurid.Page within the Plurid.App will have the initial link.
     */
    alwaysOnDomain?: boolean;
}

export type DOMElement = any | JSX.Element;

export interface RouteParams {
    [key: string]: object;
}

export interface SubRoute {
    component: DOMElement;
    params: RouteParams;
    path: string;
    subDomain: string;
    subRoutes?: SubRoute[];
}

export interface Route {
    component: DOMElement;
    params: RouteParams;
    path: string;
    subDomain: string;
    subRoutes?: SubRoute[];
}

export interface Routes {
    [key: string]: Route[];
}


class PluridRouter extends Component<IPluridRouterProps, {}> {
    public static defaultProps = {
        alwaysOnDomain: true,
    }

    constructor(props: IPluridRouterProps) {
        super(props);

        const routes = this.routes(this.props.children);
        this.state = {
            routes,
        }
    }

    public componentDidMount() {
        window.addEventListener('pluridlinkopen', this.handlePluridLink);
    }

    public componentWillUnmount() {
        window.removeEventListener('pluridlinkopen', this.handlePluridLink);
    }

    public render() {
        const { children } = this.props;

        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }

    private handlePluridLink = (event: CustomEvent) => {
        console.log(event.detail);
    }

    private routes(children: React.ReactNode): Routes {
        console.log(children);
        const div = (<div>test div</div>);

        const routes: Routes = {
            test: [
                {
                    component: div,
                    params: {},
                    path: '/testing',
                    subDomain: 'test',
                    subRoutes: [
                        {
                            component: div,
                            params: {},
                            path: '/the-test',
                            subDomain: 'test',
                        },
                    ],
                },
            ],
            www: [
                {
                    component: div,
                    params: {},
                    path: '/post',
                    subDomain: '',
                },
                {
                    component: div,
                    params: {
                        id: {
                        },
                    },
                    path: '/post/:id',
                    subDomain: '',
                },
            ],
        };

        return routes;
    }
}

export default PluridRouter;

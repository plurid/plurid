import React, { Component } from 'react';

import PluridRoutingContext from '../RoutingContext';



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

export interface IPluridRouterState {
    routes: DomainRoutes[];
    domain: string;
}


export type DOMElement = any | JSX.Element;

export interface RouteParams {
    [key: string]: object;
}

export interface SubRoute {
    component: DOMElement;
    domain: string,
    domainName: string,
    hostName: string,
    params: RouteParams;
    path: string;
    subDomain: string;
    subRoutes?: SubRoute[];
}

export interface Route {
    component: DOMElement;
    params: RouteParams;
    path: string;
    subRoutes?: SubRoute[];
}

export interface SubDomainRoutes {
    routes: Route[];
    subDomain: string;
}

export interface DomainRoutes {
    domain: string;
    domainName: string;
    hostName: string;
    subDomains: SubDomainRoutes[]
}

const div = () => (<div>test div</div>);

const domains: DomainRoutes[] = [
    {
        domain: 'plurid.com',
        domainName: 'com',
        hostName: 'plurid',
        subDomains: [
            {
                routes: [
                    {
                        component: div,
                        params: {},
                        path: '/post',
                    },
                    {
                        component: div,
                        params: {},
                        path: '/post/:id',
                    },
                ],
                subDomain: 'www',
            },
            {
                routes: [
                    {
                        component: div,
                        params: {},
                        path: '/post',
                    },
                    {
                        component: div,
                        params: {},
                        path: '/post/:id',
                    },
                ],
                subDomain: 'denote',
            },
        ],
    },
    {
        domain: 'plurid.org',
        domainName: 'org',
        hostName: 'plurid',
        subDomains: [
            {
                routes: [
                    {
                        component: div,
                        params: {},
                        path: '/post',
                    },
                    {
                        component: div,
                        params: {},
                        path: '/post/:id',
                    },
                ],
                subDomain: 'www',
            },
        ],
    },
];



class PluridRouter extends Component<IPluridRouterProps, IPluridRouterState> {
    public static defaultProps = {
        alwaysOnDomain: true,
    }

    constructor(props: IPluridRouterProps) {
        super(props);

        const { domain } = this.props;
        const routes: DomainRoutes[] = [];

        this.state = {
            domain: domain ? domain : '',
            routes,
        };
    }

    public componentDidMount() {
        window.addEventListener('pluridlinkopen', this.handlePluridLinkOpen);
    }

    public componentWillUnmount() {
        window.removeEventListener('pluridlinkopen', this.handlePluridLinkOpen);
    }

    public render() {
        const { children } = this.props;
        const { routes, domain } = this.state;

        return (
            <PluridRoutingContext.Provider
                children={children || null}
                value={{
                    domain,
                    registerRoute: this.registerRoute,
                    routes,
                }}
            />
        );
    }

    private registerRoute = (route: Route) => {
        console.log('registering route', route);
        // const { routes } = this.state;
        // const newRoutes: DomainRoutes = domains;
        // this.setState( {
        //     routes: newRoutes
        // });
    }

    private handlePluridLinkOpen = (event: CustomEvent) => {
        console.log(event.detail);
    }

    private routes(children: React.ReactNode): DomainRoutes[] {
        // const www = 'www';
        // const subDomains: string[] = [];
        // const routesChildrenWithProps = React.Children.map(children, (child: any) => {
        //     if (child.type) {
        //         const name = child.type.displayName;
        //         if (name) {
        //             const pluridRouteRegex = /Plurid.Route$/;
        //             const pluridRouteTest = pluridRouteRegex.test(name);

        //             if (pluridRouteTest) {
        //                 // If the route has a subDomain, use it
        //                 // else, set it to 'www'.
        //                 const subDomain = child.props.subDomain;
        //                 if (subDomain) {
        //                     subDomains.push(subDomain);
        //                     return child;
        //                 } else {
        //                     subDomains.push(www);
        //                     const childWithProps = React.cloneElement(child, {
        //                         subDomain: www,
        //                     });
        //                     return childWithProps;
        //                 }
        //             }

        //             const pluridRoutesRegex = /Plurid.Routes$/;
        //             const pluridRoutesTest = pluridRoutesRegex.test(name);

        //             if (pluridRoutesTest) {
        //                 const subDomain = child.props.subDomain;
        //                 if (subDomain) {
        //                     subDomains.push(subDomain);
        //                 }
        //                 console.log(child);
        //             }
        //         }
        //     }
        // });

        // console.log(children);
        // console.log(subDomains);
        // console.log(routesChildrenWithProps);

        return domains;
    }
}

export default PluridRouter;

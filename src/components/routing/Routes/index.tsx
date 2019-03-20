import React, { Component } from 'react';



export interface IPluridRoutesProps {
    domain: string;
    subDomain: string;
}


class PluridRoutes extends Component<IPluridRoutesProps, {}> {
    public static displayName = "Plurid.Routes";

    public render() {
        const { children, domain, subDomain } = this.props;

        const www = 'www';
        const subDomains: string[] = [];
        const childrenWithProps = React.Children.map(children, (child: any) => {
            if (child.type) {
                const name = child.type.displayName;
                if (name) {
                    const pluridRouteRegex = /Plurid.Route$/;
                    const pluridRouteTest = pluridRouteRegex.test(name);

                    if (pluridRouteTest) {
                        // If the route has a subDomain, use it
                        // else, set it to 'www'.
                        const sub = child.props.subDomain;
                        if (subDomain) {
                            subDomains.push(sub);
                            return child;
                        } else {
                            subDomains.push(www);
                            const childWithProps = React.cloneElement(child, {
                                subDomain: www,
                            });
                            return childWithProps;
                        }
                    }

                    // const pluridRoutesRegex = /Plurid.Routes$/;
                    // const pluridRoutesTest = pluridRoutesRegex.test(name);

                    // if (pluridRoutesTest) {
                    //     const subDomain = child.props.subDomain;
                    //     if (subDomain) {
                    //         subDomains.push(subDomain);
                    //     }
                    //     console.log(child);
                    // }
                }
            }
            console.log(child);
        });

        // console.log('domain', domain ? domain : 'aaa');
        // console.log('subdomain', subDomain ? subDomain : 'www');

        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
}

export default PluridRoutes;

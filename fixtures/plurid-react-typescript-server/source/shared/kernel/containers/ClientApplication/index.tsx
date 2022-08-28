// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridRouterLink,
        PluridReactRouteComponent,
        PluridApplication,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import Head from '~kernel-components/Head';
    // #endregion external


    // #region internal
    import {
        StyledClientPlane,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const ClientApplication: PluridReactRouteComponent<{}> = (
    properties,
) => {
    // #region render
    return (
        <>
            <Head
                title="A Client Application | Plurid' Application"
            />

            <PluridApplication
                planes={[
                    [
                        '/one', () => (
                            <StyledClientPlane>
                                <div>
                                    an example of a client application
                                </div>

                                <div>
                                    <PluridRouterLink
                                        route="/"
                                    >
                                        back to home
                                    </PluridRouterLink>
                                </div>
                            </StyledClientPlane>
                        ),
                    ],
                ]}
                view={[
                    '/one'
                ]}
                hostname="localhost:63000"
            />
        </>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default ClientApplication;
// #endregion exports

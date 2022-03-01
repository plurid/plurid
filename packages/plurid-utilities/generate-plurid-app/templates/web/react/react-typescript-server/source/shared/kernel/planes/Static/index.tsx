// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridRouterLink,
        PluridReactRouteComponent,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import Head from '~kernel-components/Head';
    // #endregion external


    // #region internal
    import {
        StyledStatic,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const Static: PluridReactRouteComponent<{}> = (
    properties,
) => {
    // #region render
    return (
        <StyledStatic>
            <Head
                title="A Static Page | Plurid' Application"
            />

            <div>
                an example of a static page
            </div>

            <div>
                <PluridRouterLink
                    route="/"
                >
                    back to home
                </PluridRouterLink>
            </div>
        </StyledStatic>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Static;
// #endregion exports

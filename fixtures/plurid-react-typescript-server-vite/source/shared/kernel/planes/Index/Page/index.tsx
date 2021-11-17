// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridLink,
        PluridRouterLink,
        PluridReactComponent,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    // import pluridLogo from './assets/plurid-logo.png';
    import pluridLogoSVG from './assets/plurid-logo.svg';
    // #endregion external


    // #region internal
    import {
        StyledPage,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const Page: PluridReactComponent<{}> = (
    properties,
) => {
    /** properties */
    // const {
    //     plurid,
    // } = properties;


    /** render */
    return (
        <StyledPage>
            <div>
                <a
                    href="https://plurid.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img src={pluridLogoSVG} alt="plurid logo" height={250} />
                    {/* <img src={pluridLogo} alt="plurid logo" height={250} /> */}
                </a>
            </div>

            <h1>
                enjoy the plurid' exploration
            </h1>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <PluridLink
                    route="/plane"
                    style={{
                        color: '~ccc',
                    }}
                >
                    plurid self link
                </PluridLink>

                <PluridRouterLink
                    route="/static"
                    style={{
                        color: '~ccc',
                    }}
                >
                    router link to static page
                </PluridRouterLink>
            </div>
        </StyledPage>
    );
}
// #endregion module



// #region exports
export default Page;
// #endregion exports

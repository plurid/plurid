// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridLink,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import pluridLogo from '../../plurid-logo.png';
    // #endregion external


    // #region internal
    import {
        StyledPlane,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const Plane: React.FC<any> = (
    properties,
) => {
    // #region properties
    // const {
    //     plurid,
    // } = properties;
    // #endregion properties


    // #region render
    return (
        <StyledPlane>
            <div>
                <a
                    href="https://plurid.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img src={pluridLogo} alt="plurid logo" height={150} />
                </a>
            </div>

            <h1>
                enjoy the plurid' exploration
            </h1>

            <div>
                <PluridLink route="/plane">self link</PluridLink>
            </div>
        </StyledPlane>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Plane;
// #endregion exports

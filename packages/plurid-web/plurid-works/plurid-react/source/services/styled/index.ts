// #region imports
    // #region libraries
    import {
        keyframes,
        css,
    } from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
export const fadeIn = keyframes`
    from {
        opacity: 0%;
    }

    to {
        opacity: 100%;
    }
`;


export const fadeInAnimation = (
    fadeInTime: number,
) => (css as any)`${fadeIn} ${fadeInTime}ms linear 100ms forwards`;
    // |
    // |--- HACK disable `colon expected ts-styled-plugin(9999)`
// #endregion module
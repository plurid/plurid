// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries


    // #region external
    import {
        Sizes,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export interface IStyledProgressCircle {
    size: Sizes;
}

export const StyledProgressCircle = styled.div<IStyledProgressCircle>`
    height: 0;
    width: 0;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    margin: 10px;

    svg {
        transform: translateX(-50%) translateY(-50%);
    }
`;
// #endregion module

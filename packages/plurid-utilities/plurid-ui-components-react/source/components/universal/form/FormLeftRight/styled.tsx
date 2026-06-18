// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports


export interface IStyledFormLeftRight {
    theme: Theme,
}

export const StyledFormLeftRight = styled.div<IStyledFormLeftRight>`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

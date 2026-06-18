// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



export interface IStyledFormitem {
    theme: Theme,
    level: number;
}

export const StyledFormitem = styled.div<IStyledFormitem>`
    display: grid;
    align-items: center;
    min-height: 2rem;
    padding: 0.3rem 0.7rem;
    user-select: none;
`;

// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #region libraries
// #region imports



// #region module
export interface IStyledEntityPillGroup {
    theme: Theme;
}

export const StyledEntityPillGroup = styled.div<IStyledEntityPillGroup>`
    display: flex;
    flex-flow: wrap;
    margin: 0 auto;
    justify-content: center;
`;
// #region module

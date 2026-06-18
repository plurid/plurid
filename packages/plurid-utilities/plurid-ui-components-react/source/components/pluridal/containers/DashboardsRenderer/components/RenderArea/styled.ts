// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #region libraries
// #region imports



// #region module
export interface IStyledRenderArea {
    theme: Theme;
}

export const StyledRenderArea = styled.div<IStyledRenderArea>`
`;
// #region module

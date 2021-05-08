// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        PluridLinkCoordinates,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export interface IStyledPreview {
    theme: Theme;
    linkCoordinates: PluridLinkCoordinates;
}

export const StyledPluridPlanePreview = styled.div<IStyledPreview>`
    position: absolute;
    min-width: 600px;
    min-height: 300px;
    z-index: 99999;

    top: ${({
        linkCoordinates,
    }) => {
        const location = linkCoordinates.y;
        return location + 'px';
    }};
    left: ${({
        linkCoordinates,
    }) => {
        const location = linkCoordinates.x + 5;
        return location + 'px';
    }};
    background-color: ${({
        theme,
    }) => {
        return theme.backgroundColorSecondary;
    }};
    box-shadow: ${({
        theme,
    }) => {
        return theme.boxShadowUmbra;
    }};
`;
// #endregion module

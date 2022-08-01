// #region imports
    // #region libraries
    import styled, {
        css,
    } from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes/distribution';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledPluridPlaneControls {
    theme: Theme;
    transparentUI: boolean;
    mouseOver: boolean;
}

export const StyledPluridPlaneControls = styled.div<IStyledPluridPlaneControls>`
    background-color: ${({
        transparentUI,
        mouseOver,
        theme,
    }) => {
        if (transparentUI && !mouseOver) {
            return 'transparent';
        }

        return theme.backgroundColorDark;
    }};
    box-shadow: ${({
        theme,
    }) => {
        return theme.boxShadowUmbraInset;
    }};

    width: 100%;
    display: grid;
    align-items: center;
    justify-content: center;
    grid-template-rows: 1fr;
    grid-template-columns: 1fr 2fr 1fr;
    transition: background-color 300ms linear;

    @media (max-width: 800px) {
        grid-template-columns: 1fr 3fr 1fr;
    }
`;



export const styleCommonControls = css`
    margin: 0 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
`;


export const StyledPluridPlaneControlsLeft = styled.div`
    ${styleCommonControls}
`;


export const StyledPluridPlaneControlsCenter = styled.div`
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    word-break: break-all;
`;


export const StyledPluridPlaneControlsRight = styled.div`
    ${styleCommonControls}
    justify-content: right;
`;
// #endregion module

// #region imports
    // #region libraries
    import styled, {
        css,
    } from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
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
    /* the icon groups keep their size; the path takes what is left and never pushes them */
    grid-template-columns: auto minmax(0, 1fr) auto;
    transition: background-color 300ms linear;
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
    min-width: 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

/** The plane's route on ONE line, its END kept visible (the leading part is elided). */
export const StyledPluridPlaneControlsPath = styled.span`
    display: block;
    min-width: 0;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    direction: rtl;
    text-align: center;
    unicode-bidi: plaintext;
`;


export const StyledPluridPlaneControlsRight = styled.div`
    ${styleCommonControls}
    justify-content: right;
`;
// #endregion module

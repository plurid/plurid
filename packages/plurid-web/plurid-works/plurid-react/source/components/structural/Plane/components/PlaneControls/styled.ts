// #region imports
    // #region libraries
    import {
        PLANE_BAR_HEIGHT,
    } from '@plurid/plurid-data';
    import styled, {
        css,
    } from 'styled-components';

    import {
        chromeRoot,
        chromeDocked,
    } from '~services/styled/chrome';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
    import { Z_INDEX } from '~data/constants/zIndex';
// #endregion imports



// #region module
export interface IStyledPluridPlaneControls {
    theme: Theme;
    transparentUI: boolean;
    mouseOver: boolean;
    /** The page presentation: the bar hangs ABOVE the sheet instead of taking a row (the page stays whole). */
    $overlay?: boolean;
}

export const StyledPluridPlaneControls = styled.div<IStyledPluridPlaneControls>`
    ${chromeRoot}
    ${chromeDocked}
    background-color: ${({
        transparentUI,
        mouseOver,
        theme,
    }) => {
        if (transparentUI && !mouseOver) {
            return 'transparent';
        }

        return 'var(--plurid-surface-solid)';
    }};
    box-shadow: ${({
        theme,
    }) => {
        return 'inset 0 -1px 0 0 var(--plurid-rim)';
    }};

    width: 100%;
    /* the page presentation: the bar hangs ABOVE the sheet (outside its box), never over the page,
       and moves with the sheet — it is the plane's top, clipped with the plane when that top leaves
       the view, never sliding (the user's rule, 2026-09-06) */
    ${({ $overlay }) => ($overlay ? `position: absolute; top: -${PLANE_BAR_HEIGHT}px; left: 0; right: 0; height: ${PLANE_BAR_HEIGHT}px; z-index: ${Z_INDEX.PLANE_CHROME};` : '')}
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

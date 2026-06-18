// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes/distribution';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledPluridPlaneBridge {
    theme: Theme;
    planeControls: boolean;
    planeOpacity: number;
    transparentUI: boolean;
    mouseOver: boolean;
    bridgeLength: number;
}

export const StyledPluridPlaneBridge = styled.div<IStyledPluridPlaneBridge>`
    background-color: ${({
        theme,
        planeControls,
        planeOpacity,
        transparentUI,
        mouseOver,
    }) => {
        if (transparentUI && !mouseOver) {
            return theme.backgroundColorPrimaryAlpha;
        }

        if (planeOpacity === 0) {
            return 'transparent';
        }

        if (!planeControls) {
            return theme.backgroundColorPrimary;
        }

        return theme.backgroundColorDark;
    }};

    position: absolute;
    top: 0;
    left: ${({ bridgeLength }) => -bridgeLength}px;
    height: 30px;
    width: ${({ bridgeLength }) => bridgeLength}px;
    opacity: 0.5;

    display: flex;
    align-items: center;
    justify-content: center;
`;
// #endregion module

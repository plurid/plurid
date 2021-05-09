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
}

export const StyledPluridPlaneBridge = styled.div<IStyledPluridPlaneBridge>`
    background-color: ${({
        planeOpacity,
        planeControls,
        theme,
    }) => {
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
    left: -100px;
    height: 30px;
    width: 100px;
    opacity: 0.5;
`;
// #endregion module
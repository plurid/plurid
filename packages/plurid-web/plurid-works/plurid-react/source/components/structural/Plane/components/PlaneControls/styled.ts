// #region imports
    // #region libraries
    import styled from 'styled-components';

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



export const StyledPluridPlaneControlsLeft = styled.div`
    margin: 0 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
`;


export const StyledPluridPlaneControlsCenter = styled.div`
    width: 100%;
    height: 38px;
    position: relative;
`;


export const StyledPluridPlaneControlsRight = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 30px);
    padding: 0 1rem;
`;
// #endregion module

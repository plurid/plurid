// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes/distribution';
    // #endregion libraries


    // #region external
    import {
        fadeInAnimation,
    } from '~services/styled';
    // #endregion external
// #endregion imports



// #region module
export interface IStyledPluridViewcube {
    conceal: boolean;
    mouseOver: boolean;
    isMounted: boolean;
    fadeInTime: number;
}

export const StyledPluridViewcube = styled.div<IStyledPluridViewcube>`
    position: absolute;
    @media (max-width: 800px) {
        top: ${({
            conceal,
            mouseOver,
        }) => {
            if (conceal && !mouseOver) {
                return '-90px';
            }
            return '0';
        }};
    }
    bottom: ${({
        conceal,
        mouseOver,
    }) => {
        if (conceal && !mouseOver) {
            return '-90px';
        }
        return '0';
    }};
    right: ${({
        conceal,
        mouseOver,
    }) => {
        if (conceal && !mouseOver) {
            return '-100px';
        }
        return '0';
    }};
    position: absolute;
    user-select: none;
    transition: all 300ms ease-in-out;
    z-index: 9998;
    height: 175px;
    display: grid;
    grid-template-areas: "PVScale           PVScale         PVScale          PVScale"
                         "PVEmptyOne        PVRotateUp      PVEmptyTwo       PVTranslateY"
                         "PVRotateLeft      PVModel         PVRotateRight    PVTranslateY"
                         "PVEmptyThree      PVRotateDown    PVFitview        PVTranslateY"
                         "PVTranslateX      PVTranslateX    PVTranslateX     PVTranslateX";
    grid-template-rows: 20px 15px 105px 15px 20px;
    grid-template-columns: 15px 100px 15px 20px;

    opacity: ${({
        fadeInTime,
    }) => {
        if (fadeInTime) {
            return '0';
        }

        return '1';
    }};
    animation: ${({
        fadeInTime,
        isMounted,
    }) => {
        if (
            isMounted
            && fadeInTime
        ) {
            return fadeInAnimation(fadeInTime);
        }

        return '';
    }};

    :hover {
        opacity: 1;
    }
`;


export interface IStyledPluridViewcubeArrow {
    theme: Theme;
}

export const StyledPluridViewcubeArrow = styled.div<IStyledPluridViewcubeArrow>`
    display: grid;
    place-content: center;

    /* TODO
     * Themed color
     */
    color: white;
`;


export interface IStyledPluridViewcubeArrowIcon {
    theme: Theme;
}

export const StyledPluridViewcubeArrowIcon = styled.div<IStyledPluridViewcubeArrowIcon>`
    user-select: none;
    font-size: 0.6rem;
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 0.6rem;
    display: grid;
    place-content: center;
    cursor: pointer;

    :hover {
        background-color: ${({
            theme,
        }) => {
            return theme.backgroundColorTertiary;
        }};
    }
`;


export interface IStyledFitView {
}

export const StyledFitView = styled.div<IStyledFitView>`
    grid-area: PVFitview;
    display: grid;
    place-content: center;
    cursor: pointer;
    user-select: none;

    svg {
        height: 0.8rem;
        width: 0.8rem;
        fill: white;
    }
`;
// #endregion module

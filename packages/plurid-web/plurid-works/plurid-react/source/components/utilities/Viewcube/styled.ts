// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Z_INDEX,
    } from '~data/constants/zIndex';

    import {
        Theme,
    } from '@plurid/plurid-themes';
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
    /* The arrows and the fit button stay in the DOM (focusable, labelled) and only SHOW while the
       cube is hovered or holds keyboard focus. */
    &[data-plurid-hover='false']:not(:focus-within) button {
        opacity: 0;
    }
    button {
        transition: opacity 150ms ease;
    }

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
    z-index: ${Z_INDEX.VIEWCUBE};
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

export const StyledPluridViewcubeArrowIcon = styled.button<IStyledPluridViewcubeArrowIcon>`
    border: 0;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    background: none;

    &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 1px;
    }
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

export const StyledFitView = styled.button<IStyledFitView>`
    border: 0;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    background: none;

    &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 1px;
    }
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

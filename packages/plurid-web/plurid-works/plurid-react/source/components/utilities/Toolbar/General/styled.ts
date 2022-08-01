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


    // #region internal
    import {
        MENUS,
    } from './data';
    // #endregion internal
// #endregion imports



// #region module
export interface IStyledToolbar {
    mouseIn: boolean;
    conceal: boolean;
    showMenu: keyof typeof MENUS;
    isMounted: boolean;
    fadeInTime: number;
}

export const StyledToolbar = styled.div<IStyledToolbar>`
    bottom: ${({
        conceal,
        mouseIn,
    }) => {
        if (!conceal) {
            return '-5px';
        }

        if (mouseIn) {
            return '-5px';
        }
        return '-55px';
    }};
    pointer-events: ${({
        showMenu,
    }) => {
        if (showMenu !== MENUS.NONE) {
            return 'all';
        }
        return 'none';
    }};
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

    display: grid;
    position: absolute;
    left: 0;
    right: 0;
    height: 75px;
    z-index: 9999;
    transition: bottom 300ms ease-in-out;
`;


export interface IStyledToolbarButtons {
    theme: Theme;
    transparentUI: boolean;
    showIcons: boolean;
    showTransformButtons: boolean;
    documentsBased: boolean;
    opaque: boolean;
    mouseIn: boolean;
}

export const StyledToolbarButtons = styled.div<IStyledToolbarButtons>`
    color: ${({
        theme,
    }) => {
        return theme.colorPrimary;
    }};
    background-color: ${({
        theme,
        transparentUI,
    }) => {
        if (transparentUI) {
            return theme.backgroundColorPrimaryAlpha;
        }

        return theme.backgroundColorSecondary;
    }};
    box-shadow: ${({
        theme,
    }) => {
        return theme.boxShadowUmbra;
    }};
    grid-template-columns: ${({
        showIcons,
        showTransformButtons,
        documentsBased,
    }) => {
        if (
            showIcons
            && !showTransformButtons
        ) {
            if (documentsBased) {
                return 'repeat(6, minmax(min-content, 40px))';
            } else {
                return 'repeat(5, minmax(min-content, 40px))';
            }
        }

        if (!showTransformButtons) {
            if (documentsBased) {
                return 'repeat(6, minmax(min-content, 40px))';
            } else {
                return 'repeat(5, minmax(min-content, 40px))';
            }
        }

        if (documentsBased) {
            return '40px 200px 200px 200px 40px 40px';
        }

        return '40px 200px 200px 200px 40px';
    }};
    opacity: ${({
        opaque,
        mouseIn,
    }) => {
        if (!opaque && !mouseIn) {
            return '0.4';
        }
        return '1';
    }};

    z-index: 9999;
    user-select: none;
    /* height: 75px; */
    display: grid;
    pointer-events: all;
    display: grid;
    align-items: center;
    justify-content: center;
    justify-items: center;
    border-radius: 22.5px;
    margin: 0 auto;
    margin-top: 10px;
    margin-bottom: 20px;
    padding: 0 22.5px;
    font-size: 12px;
    height: 45px;
    transition: opacity 300ms ease-in-out;

    :after {
        content: '';
        position: absolute;
        top: 55px;
        left: 0;
        right: 0;
        height: 20px;
    }
`;


export interface IStyledToolbarButton {
    theme: Theme;
    button: boolean;
    active: boolean;
    showIcons: boolean;
    showTransformButtons: boolean;
}

export const StyledToolbarButton = styled.div<IStyledToolbarButton>`
    padding: ${({
        button,
        showIcons,
        showTransformButtons,
    }) => {
        if (button) {
            return '0';
        }

        if (
            showIcons
            && !showTransformButtons
        ) {
            return '0';
        }

        return '0 7px';
    }};
    background-color: ${({
        active,
        theme,
    }) => {
        if (active) {
            return theme.backgroundColorTertiary;
        }
        return 'transparent';
    }};
    min-width: ${({
        button,
    }) => {
        if (button) {
            return '40px';
        }

        return '70px';
    }};

    height: 45px;
    display: grid;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;

    @media (hover: hover) {
        :hover {
            background: ${({
                theme,
            }) => {
                return theme.backgroundColorTertiary;
            }};
        }
    }
`;


export const StyledIcon = styled.div`
    width: 40px;
    display: grid;
    place-content: center;

    /* svg {
        height: 15px;
        width: 15px;
        fill: white;
    } */
`;
// #endregion module

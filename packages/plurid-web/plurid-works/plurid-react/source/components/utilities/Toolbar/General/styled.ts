// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
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
    /* stretch buttons to the full toolbar height so their fill is never short */
    align-items: stretch;
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
        height: 20px;
        left: 0;
        right: 20%;
    }

    @media (max-width: 900px) {
        :after {
            right: 0;
        }
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

    /* Original look: a full-height fill on the button, with a smooth fade. Fill the row the
       grid stretches us into (min 45px) so the highlight always spans the toolbar height. */
    min-height: 45px;
    height: 100%;
    display: grid;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    transition: background-color 150ms ease;

    /* No @media (hover: hover) gate — some setups report hover: none even with a mouse,
       which silently dropped the hover fill. */
    :hover {
        background-color: ${({
            theme,
        }) => {
            return theme.backgroundColorTertiary;
        }};
    }
`;


export const StyledIcon = styled.div`
    width: 40px;
    height: 100%;
    display: grid;
    place-content: center;

    /* svg {
        height: 15px;
        width: 15px;
        fill: white;
    } */
`;
// #endregion module

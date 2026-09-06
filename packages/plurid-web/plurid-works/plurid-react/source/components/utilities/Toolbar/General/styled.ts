// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        chromeControl,
        chromeRoot,
        chromeDocked,
    } from '~services/styled/chrome';

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
    ${chromeRoot}
    ${chromeDocked}
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
    z-index: ${Z_INDEX.TOOLBAR};
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

/** The bar: a wide pill of the look's material (the surface, the rim, the halo, the blur); ambient when the host asks for a see-through toolbar. */
export const StyledToolbarButtons = styled.div<IStyledToolbarButtons>`
    color: var(--plurid-ink);
    background: ${({ transparentUI }) => (transparentUI ? 'var(--plurid-surface)' : 'var(--plurid-surface-strong)')};
    border: 1px solid var(--plurid-rim);
    box-shadow: 0 0 0 1px var(--plurid-halo), var(--plurid-shadow);
    backdrop-filter: blur(var(--plurid-blur)) saturate(1.2);
    -webkit-backdrop-filter: blur(var(--plurid-blur)) saturate(1.2);
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
            return 'var(--plurid-opacity-ambient)';
        }
        return 'var(--plurid-opacity-persistent)';
    }};
    &:hover,
    &:focus-within {
        opacity: 1;
    }

    z-index: ${Z_INDEX.TOOLBAR};
    user-select: none;
    display: grid;
    pointer-events: all;
    /* stretch buttons to the full toolbar height so their fill is never short */
    align-items: stretch;
    justify-content: center;
    justify-items: center;
    border-radius: 999px;
    overflow: hidden;
    margin: 0 auto;
    margin-top: 10px;
    margin-bottom: 20px;
    padding: 0 6px;
    font-size: var(--plurid-font-size);
    height: calc(var(--plurid-control) + 12px);
    position: relative;
    transition: opacity var(--plurid-fade) var(--plurid-ease);

    /* A hover bridge under the pill (its bottom margin), so the cursor can slide down to the screen
       edge without the toolbar concealing — the pill's OWN width. A bare ":after" here is a
       DESCENDANT selector in styled-components: it gave every button its own invisible strip,
       800px wide and 20px tall, across the bottom of the view, swallowing the clicks that landed
       there (2026-09-05). */
    &::after {
        content: '';
        position: absolute;
        top: 100%;
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

/** A toolbar button: the look's ink on nothing; hovered, the wash; active (a transform mode, an open menu), the accent as ink. */
export const StyledToolbarButton = styled.button<IStyledToolbarButton>`
    ${chromeControl}
    border: 0;
    margin: 0;
    font: inherit;
    font-family: var(--plurid-font);
    font-size: var(--plurid-font-size);
    font-weight: var(--plurid-weight);
    color: ${({ active }) => (active ? 'var(--plurid-accent)' : 'var(--plurid-ink)')};
    background: transparent;
    border-radius: 999px;
    cursor: pointer;

    &:focus-visible {
        outline: 2px solid var(--plurid-focus);
        outline-offset: -3px;
    }

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

        return '0 14px';
    }};
    min-width: ${({
        button,
    }) => {
        if (button) {
            return '40px';
        }

        return '70px';
    }};

    /* Fill the row the grid stretches us into, inset by the bar's padding, so the highlight
       always spans the bar's height. */
    min-height: calc(var(--plurid-control) + 4px);
    height: calc(100% - 8px);
    margin: 4px 0;
    display: grid;
    align-items: center;
    justify-content: center;
    user-select: none;
    transition: background-color 150ms var(--plurid-ease), color 150ms var(--plurid-ease);

    /* No @media (hover: hover) gate — some setups report hover: none even with a mouse,
       which silently dropped the hover fill. */
    &:hover {
        background: var(--plurid-hover);
    }
    /* the round mask: whatever the icon wrapper paints stays inside the pill */
    overflow: hidden;
    svg {
        fill: currentColor;
    }
`;


export const StyledIcon = styled.div`
    width: 40px;
    height: 100%;
    display: grid;
    place-content: center;
    /* the icon components paint their own background; in a pill the fill is the pill's */
    &, & * {
        background: transparent;
    }

    svg {
        height: 15px;
        width: 15px;
        fill: currentColor;
    }
`;
// #endregion module

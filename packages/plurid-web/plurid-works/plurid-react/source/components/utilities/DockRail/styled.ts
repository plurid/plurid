// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries

    // #region external
    import {
        chromeRoot,
        chromeControl,
        chromePill,
        CHROME_PILL_SIZE,
        CHROME_PILL_MARGIN,
    } from '~services/styled/chrome';
    import { Z_INDEX } from '~data/constants/zIndex';
    // #endregion external
// #endregion imports



// #region module
/** The rail's geometry: the pills' numbers (`services/styled/chrome.ts`), the box derives from them. */
export const RAIL_BUTTON = CHROME_PILL_SIZE;
export const RAIL_GAP = 8;
export const RAIL_MARGIN = CHROME_PILL_MARGIN;
/** The band the rail takes under the viewcube (its margin, the buttons, a breath above). */
export const RAIL_BAND = RAIL_MARGIN + RAIL_BUTTON + 6;

/**
 * THE RAIL of the page presentation: a right-aligned row of pills at the bottom-right of the view —
 * fit everything (the globe), back to the parent page, and the corner control (a cube while the
 * camera is docked: "there is a space"; a page while it is revealed: "back to the page") at the far
 * right (the user's order, 2026-09-06). The dock controls are the one piece of chrome that never
 * fades with the docked state; the fit button fades like the rest of the chrome.
 */
export const StyledDockRail = styled.div`
    ${chromeRoot}
    position: absolute;
    right: ${RAIL_MARGIN}px;
    bottom: ${RAIL_MARGIN}px;
    z-index: ${Z_INDEX.DOCK};
    display: flex;
    gap: ${RAIL_GAP}px;
    pointer-events: none;

    & > * {
        pointer-events: auto;
        transition: opacity var(--plurid-dock-fade, 240ms) ease;
    }
    /* docked: the fit button goes with the rest of the chrome (at once), the dock controls stay */
    [data-plurid-docked] & > :not([data-plurid-control^='dock']) {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: none;
    }
    /* a narrow viewport: the toolbar's pill spans the width, so the rail rises above its band while
       the space is revealed (U02, 2026-09-06: at 390 px More sat on the fit button) */
    @media (max-width: 640px) {
        [data-plurid-presentation='page']:not([data-plurid-docked]) & {
            bottom: ${RAIL_MARGIN + 72}px;
        }
    }
    @media (prefers-reduced-motion: reduce) {
        & > * {
            transition: none;
        }
    }
`;

/** A rail button: the persistent pill (`chromePill`), nothing more. */
export const StyledRailButton = styled.button<{ theme: Theme }>`
    ${chromeControl}
    ${chromePill}
`;
// #endregion module

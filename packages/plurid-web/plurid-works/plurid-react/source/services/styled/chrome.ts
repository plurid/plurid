// #region imports
    // #region libraries
    import {
        css,
    } from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * The engine's chrome (toolbar, viewcube, minimap, plane controls, shortcuts, handles, overlays)
 * renders inside the HOST's document, so the host's global resets and typography cascade into
 * it — a `button { min-height: 42px }` meant for the host's forms resizes the viewcube, a
 * `body { text-transform: uppercase }` shouts the toolbar. These fragments make every chrome
 * surface start from a known state: `chromeRoot` on a chrome root, `chromeControl` on every
 * chrome form control (button / input / select). Plane CONTENT is the host's and is never reset.
 *
 * Specificity: both fragments live inside the component's own class, so they beat the host's
 * element selectors and never fight the component's own rules (which come later in the same
 * block). Host `!important` rules are out of reach by design.
 */
export const chromeRoot = css`
    font-weight: 400;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-transform: none;
    text-decoration: none;
    text-shadow: none;
    white-space: normal;
    word-spacing: normal;
`;


/**
 * Chrome that exists only while the camera is UNDOCKED (the page presentation): the View carries
 * `data-plurid-docked="<planeID>"` while it is docked on a page, and this fragment hides the chrome
 * under it AT ONCE (a site never flashes its chrome) and fades it back in on the reveal — invisible,
 * out of the tab order and out of hit-testing meanwhile — with no script involved.
 * Never set in the space presentation, so nothing changes there.
 */
/** The chrome's two resting opacities: a PERSISTENT affordance (the rail, a control) and an AMBIENT one (a bridge, an arrow, the `?`). */
export const CHROME_OPACITY_PERSISTENT = 0.85;
export const CHROME_OPACITY_AMBIENT = 0.55;

export const chromeDocked = css`
    transition: opacity var(--plurid-dock-fade, 240ms) ease;
    [data-plurid-docked] & {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: none;
    }
    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
`;

/** The persistent pills' geometry: the rail's buttons and the `?` trigger derive from these. */
export const CHROME_PILL_SIZE = 32;
export const CHROME_PILL_RADIUS = 9;
/** The pills' distance from the view's edges. */
export const CHROME_PILL_MARGIN = 16;

/**
 * A PERSISTENT PILL — the rail's buttons and the `?` trigger, one look: a translucent dark pill
 * with a light rim, a white glyph and a dark halo behind the rim, so it reads over the dark space
 * and over a light page alike (docked, the rail sits on the PAGE, whose colours are the page's);
 * a two-tone focus ring for the same reason. Placed on top of `chromeControl`; the caller adds its
 * position and, where the pill fades with the docked state, `chromeDocked` AFTER it (the docked
 * rule must win the opacity).
 */
export const chromePill = css`
    width: ${CHROME_PILL_SIZE}px;
    height: ${CHROME_PILL_SIZE}px;
    flex: none;
    display: grid;
    place-items: center;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: ${CHROME_PILL_RADIUS}px;
    background: rgba(12, 14, 18, 0.62);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(8px) saturate(1.2);
    color: #fff;
    font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
    opacity: ${CHROME_OPACITY_PERSISTENT};
    transition: opacity var(--plurid-dock-fade, 240ms) ease, background-color 150ms ease, border-color 150ms ease;
    &:hover,
    &:focus-visible {
        opacity: 1;
        background: rgba(12, 14, 18, 0.82);
        border-color: rgba(255, 255, 255, 0.45);
    }
    &:focus-visible {
        outline: 2px solid #fff;
        outline-offset: 2px;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35), 0 0 0 5px rgba(0, 0, 0, 0.55);
    }
    svg {
        display: block;
        width: 17px;
        height: 17px;
    }
`;

export const chromeControl = css`
    appearance: none;
    -webkit-appearance: none;
    margin: 0;
    padding: 0;
    border: 0;
    min-width: 0;
    min-height: 0;
    width: auto;
    height: auto;
    font: inherit;
    /* font: inherit takes the host's weight / style / line-height along; pin them (a control never
       relies on the page's typography), while the family stays the engine root's. */
    font-weight: 400;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    word-spacing: normal;
    text-transform: none;
    text-decoration: none;
    text-shadow: none;
    color: inherit;
    background: none;
    box-shadow: none;
    border-radius: 0;
    cursor: pointer;
`;
// #endregion module

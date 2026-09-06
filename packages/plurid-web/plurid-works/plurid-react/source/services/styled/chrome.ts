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
 * `data-plurid-docked="<planeID>"` while it is docked on a page, and this fragment fades the chrome
 * out under it — invisible, out of the tab order and out of hit-testing — with no script involved.
 * Never set in the space presentation, so nothing changes there.
 */
export const chromeDocked = css`
    transition: opacity 240ms ease;
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

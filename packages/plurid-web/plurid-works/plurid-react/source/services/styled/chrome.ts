// #region imports
    // #region libraries
    import {
        css,
    } from 'styled-components';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * THE VOCABULARY. The engine's chrome (the toolbar, the viewcube, the minimap, the rail, the plane
 * bar, the shortcuts, the handles, the overlays) is drawn from three shapes — the PILL (a control),
 * the PANEL (a bar, a drawer, a dialog), the LINE (a beam, a guide, the bridge) — and every value they
 * use is a token of THE LOOK: the `--plurid-*` custom properties the application emits from its
 * `global.look` (plurid-themes `looks`, `services/look`). No component owns a colour, a radius, a
 * font or an opacity; a host changes the look, or overwrites a token in its own stylesheet.
 *
 * The chrome renders inside the HOST's document, so the host's global resets and typography cascade
 * into it — a `button { min-height: 42px }` meant for the host's forms resizes the viewcube, a
 * `body { text-transform: uppercase }` shouts the toolbar. `chromeRoot` on a chrome root and
 * `chromeControl` on every chrome form control start every surface from a known state. Plane
 * CONTENT is the host's and is never reset.
 *
 * Specificity: the fragments live inside the component's own class, so they beat the host's
 * element selectors and never fight the component's own rules (which come later in the same
 * block). Host `!important` rules are out of reach by design.
 */

/** The resting opacity of persistent chrome (the rail, the `?`) and of ambient chrome (a beam, a bridge): the tokens' defaults, for the few places JS needs the number. */
export const CHROME_OPACITY_PERSISTENT = 0.85;
export const CHROME_OPACITY_AMBIENT = 0.55;

/** The pills' geometry — the tokens' defaults, for the few places JS needs the number (the rail's band). */
export const CHROME_PILL_SIZE = 32;
export const CHROME_PILL_RADIUS = 9;
export const CHROME_PILL_MARGIN = 16;

export const chromeRoot = css`
    font-family: var(--plurid-font);
    font-size: var(--plurid-font-size);
    font-weight: var(--plurid-weight);
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-transform: none;
    text-decoration: none;
    text-shadow: none;
    white-space: normal;
    word-spacing: normal;
    color: var(--plurid-ink);
`;

/**
 * Chrome that exists only while the camera is UNDOCKED (the page presentation): the View carries
 * `data-plurid-docked="<planeID>"` while it is docked on a page, and this fragment hides the chrome
 * under it AT ONCE (a site never flashes its chrome) and fades it back in on the reveal — invisible,
 * out of the tab order and out of hit-testing meanwhile — with no script involved.
 * Never set in the space presentation, so nothing changes there.
 */
export const chromeDocked = css`
    transition: opacity var(--plurid-fade) var(--plurid-ease);
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
       relies on the page's typography), while the family and size are the look's. */
    font-family: var(--plurid-font);
    font-size: var(--plurid-font-size);
    font-weight: var(--plurid-weight);
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

/**
 * THE PILL — a control: a translucent surface with a light rim, a dark halo behind the rim and a
 * blur, so it reads over the dark space and over a light page alike (docked, the rail sits on the
 * PAGE, whose colours are the page's); the glyph in the look's ink; a two-tone focus ring for the
 * same reason. Placed on top of `chromeControl`; the caller adds its position and, where the pill
 * fades with the docked state, `chromeDocked` AFTER it (the docked rule must win the opacity).
 */
export const chromePill = css`
    width: var(--plurid-control);
    height: var(--plurid-control);
    flex: none;
    display: grid;
    place-items: center;
    padding: 0;
    border: 1px solid var(--plurid-rim);
    border-radius: var(--plurid-radius);
    background: var(--plurid-surface);
    box-shadow: 0 0 0 1px var(--plurid-halo), var(--plurid-shadow);
    backdrop-filter: blur(var(--plurid-blur)) saturate(1.2);
    -webkit-backdrop-filter: blur(var(--plurid-blur)) saturate(1.2);
    color: var(--plurid-ink);
    cursor: pointer;
    opacity: var(--plurid-opacity-persistent);
    transition: opacity var(--plurid-fade) var(--plurid-ease), background-color 150ms var(--plurid-ease), border-color 150ms var(--plurid-ease);
    &:hover,
    &:focus-visible {
        opacity: 1;
        background: var(--plurid-surface-strong);
        border-color: var(--plurid-ink-muted);
    }
    &:focus-visible {
        outline: 2px solid var(--plurid-focus);
        outline-offset: 2px;
        box-shadow: 0 0 0 1px var(--plurid-halo), 0 0 0 5px var(--plurid-focus-halo);
    }
    /* ACTIVE is the accent as INK, never a fill: the glyph takes the colour, the pill keeps its material */
    &[data-plurid-active='true'] {
        color: var(--plurid-accent);
        opacity: 1;
    }
    svg {
        display: block;
        width: 17px;
        height: 17px;
    }
`;

/**
 * THE PANEL — a bar, a drawer, a menu, the minimap, a dialog: the look's solid surface with the
 * panel radius, the rim, the halo and the shadow; translucent variants set `background` to the
 * surface token themselves. The caller adds its size and position.
 */
export const chromePanel = css`
    border: 1px solid var(--plurid-rim);
    border-radius: var(--plurid-radius-panel);
    background: var(--plurid-surface-solid);
    box-shadow: 0 0 0 1px var(--plurid-halo), var(--plurid-shadow);
    color: var(--plurid-ink);
`;

/**
 * THE LINE — a beam between planes, an alignment guide, the marquee's edge, the bridge's film:
 * the look's line colour at the ambient opacity.
 */
/** A KEY: a keyboard key as the shortcuts dialog draws it — a small strong surface, the mono face. */
export const chromeKey = css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 12px;
    height: 19px;
    padding: 0 6px;
    border-radius: calc(var(--plurid-radius) - 4px);
    border: 1px solid var(--plurid-rim);
    background-color: var(--plurid-surface-strong);
    box-shadow: 0 1px 0 0 var(--plurid-halo);
    color: var(--plurid-ink);
    font-family: var(--plurid-font-mono);
    font-size: var(--plurid-font-size-small);
    line-height: 1;
    white-space: nowrap;
`;

export const chromeLine = css`
    background: var(--plurid-line);
    opacity: var(--plurid-opacity-ambient);
`;
// #endregion module

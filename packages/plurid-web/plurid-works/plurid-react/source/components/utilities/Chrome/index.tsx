// #region imports
    // #region libraries
    import React from 'react';
    import styled from 'styled-components';
    // #endregion libraries

    // #region external
    import {
        chromeRoot,
        chromeControl,
        chromePill,
        chromePanel,
        chromeKey,
        chromeDocked,
    } from '~services/styled/chrome';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE VOCABULARY AS COMPONENTS, so custom chrome matches the look by construction: a PILL (a control),
 * a PANEL (a toolbar, a drawer, a dialog), a KEY. Each is a styled element on the look's tokens; give
 * them `data-plurid-control` / `data-plurid-overlay` like the engine's own pieces and the view treats
 * them as chrome (pointer routing, the docked fade).
 */

/** A control: 32 px, the rim, the halo, the blur; `data-plurid-active="true"` paints the glyph in the accent. Fades with the docked state. */
export const PluridPill = styled.button`
    ${chromeControl}
    ${chromePill}
    ${chromeDocked}
`;

/** A pill with an icon: the same control, `aria-label` required. */
export const PluridIconButton: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { 'aria-label': string }
> = (properties) => (
    <PluridPill
        type="button"
        {...properties}
    />
);

/** A surface: the solid fill, the panel radius, the rim, the shadow; typography from the look. */
export const PluridPanel = styled.div`
    ${chromeRoot}
    ${chromePanel}
`;

/** A keyboard key. */
export const PluridKey = styled.kbd`
    ${chromeKey}
`;
// #endregion module

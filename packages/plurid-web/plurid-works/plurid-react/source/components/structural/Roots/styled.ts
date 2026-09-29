// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        PLURID_ENTITY_ROOT,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledPluridRoots {
    /** Docked before the view is measured: each root is the view's box (`services/logic/docking/unmeasured`). */
    unmeasured?: boolean;
}

/**
 * Docked before the view is measured, each root is the view's box, at the view's origin (as its
 * planes' world coordinates already assume): a preserve-3d root is its planes' containing block, and
 * the docked page's fractions of the view resolve against it (`services/logic/docking/unmeasured`).
 */
const unmeasuredRoots = `
    & > [data-plurid-entity='${PLURID_ENTITY_ROOT}'] {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
`;

export const StyledPluridRoots = styled.div<IStyledPluridRoots>`
    transform-style: preserve-3d;
    /* A transform wrapper, never a hit target: its own box lies in the wall plane (z = 0) and
       Chrome's single hit-test (what clicks use) returned it wherever a click's ray crossed that
       invisible box before reaching a plane BEHIND the wall — a spawned plane's links were dead
       from most viewpoints (2026-09-05). Planes opt back in below. */
    pointer-events: none;
    transform-origin: 0 0 0;

    ${({ unmeasured }) => (unmeasured ? unmeasuredRoots : '')}
`;
// #endregion module

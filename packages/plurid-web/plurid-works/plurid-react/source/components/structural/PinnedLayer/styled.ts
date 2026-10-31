// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        PLANE_BAR_HEIGHT,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        Z_INDEX,
    } from '~data/constants/zIndex';
    import {
        chromeControl,
        chromeFocusRing,
    } from '~services/styled/chrome';
    // #endregion external
// #endregion imports



// #region module
/** The layer over the view: transparent to input where no frame is, so the space keeps it. */
export const StyledPinnedLayer = styled.div`
    position: absolute;
    inset: 0;
    z-index: ${Z_INDEX.PINNED};
    pointer-events: none;
    overflow: hidden;
`;

/** A pinned plane: the plane's own look (its surface, its ink, its shadow), at a screen rect. */
export const StyledPinnedFrame = styled.div`
    position: absolute;
    pointer-events: auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: ${PLANE_BAR_HEIGHT}px minmax(0, 1fr);
    overflow: hidden;
    background-color: var(--plurid-plane);
    color: var(--plurid-ink);
    box-shadow: var(--plurid-shadow);
    font-family: var(--plurid-font);
    font-size: 0.9rem;
    transform-origin: 0 0;

    &:focus-within {
        ${chromeFocusRing(2)}
    }

    &[data-plurid-collapsed='true'] > [data-plurid-pinned-content] {
        visibility: hidden;
    }
`;

export const StyledPinnedBar = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    padding: 0 8px 0 14px;
    border-bottom: 1px solid color-mix(in srgb, var(--plurid-ink) 12%, transparent);
    user-select: none;
`;

export const StyledPinnedTitle = styled.div`
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: var(--plurid-weight-strong, 600);
`;

export const StyledPinnedButton = styled.button`
    ${chromeControl}
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    min-width: 28px;
    padding: 0 8px;
    border-radius: 6px;
    opacity: 0.8;

    &:hover {
        opacity: 1;
        background: color-mix(in srgb, var(--plurid-ink) 10%, transparent);
    }
    &:focus-visible {
        ${chromeFocusRing(2)}
    }
`;

/** The content's row: the plane's content scroller fills it (the host and its slot have no box). */
export const StyledPinnedContent = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    min-height: 0;
`;
// #endregion module

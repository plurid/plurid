// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries


    // #region external
    import {
        chromeControl,
        chromeField,
        chromeFocusRing,
    } from '~services/styled/chrome';
    // #endregion external
// #endregion imports



// #region module
export const StyledBookmarksSave = styled.div`
    display: flex;
    gap: 6px;
    padding: 4px 0.5rem 8px;
`;

export const StyledBookmarksField = styled.input`
    ${chromeControl}
    ${chromeField}
    flex: 1 1 auto;
    min-width: 0;
    height: var(--plurid-control-small);
`;

export const StyledBookmarksButton = styled.button`
    ${chromeControl}
    flex: 0 0 auto;
    height: var(--plurid-control-small);
    padding: 0 10px;
    border: 1px solid var(--plurid-rim);
    border-radius: calc(var(--plurid-radius) - 3px);
    background-color: var(--plurid-surface);
    color: var(--plurid-ink-muted);
    font-size: var(--plurid-font-size-small);
    letter-spacing: 0.08em;
    text-transform: uppercase;

    &:hover:not(:disabled) {
        background-color: var(--plurid-hover);
        color: var(--plurid-ink);
    }

    &:focus-visible {
        ${chromeFocusRing(1)}
    }

    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

export const StyledBookmarksEmpty = styled.div`
    padding: 0 0.5rem 10px;
    color: var(--plurid-ink-faint);
    font-size: var(--plurid-font-size-small);
`;

export const StyledBookmarksGroup = styled.div`
    padding: 8px 0.5rem 2px;
    color: var(--plurid-ink-faint);
    font-size: var(--plurid-font-size-small);
    letter-spacing: 0.1em;
    text-transform: uppercase;
`;

export const StyledBookmarksList = styled.div`
    max-height: 260px;
    overflow-y: auto;
    scrollbar-width: thin;
    /* the rows scroll UNDER the field: a rim says where the list begins */
    border-top: 1px solid var(--plurid-rim);
    padding: 4px 0 6px;
`;

/** A row: the picture, the name, and the edits — which appear on hover and on keyboard focus. */
export const StyledBookmarkRow = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 0.5rem;
    border-radius: calc(var(--plurid-radius) - 3px);

    &:hover {
        background-color: var(--plurid-hover);
    }
`;

export const StyledBookmarkGo = styled.button`
    ${chromeControl}
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 0;
    text-align: left;
    color: var(--plurid-ink-muted);

    &:hover {
        color: var(--plurid-ink);
    }

    &:focus-visible {
        ${chromeFocusRing(1)}
        border-radius: calc(var(--plurid-radius) - 3px);
    }
`;

/** The picture's frame: the space's own ground, so the dots read as planes in a space. */
export const StyledBookmarkThumb = styled.span`
    flex: 0 0 auto;
    display: block;
    border: 1px solid var(--plurid-rim);
    border-radius: calc(var(--plurid-radius) - 4px);
    background-color: var(--plurid-surface);
    overflow: hidden;
    line-height: 0;
`;

export const StyledBookmarkName = styled.span`
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const StyledBookmarkActions = styled.div`
    flex: 0 0 auto;
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 120ms var(--plurid-ease);

    ${StyledBookmarkRow}:hover &,
    &:focus-within {
        opacity: 1;
    }

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
`;

export const StyledBookmarkAction = styled.button`
    ${chromeControl}
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border-radius: calc(var(--plurid-radius) - 4px);
    color: var(--plurid-ink-faint);
    font-size: var(--plurid-font-size-small);

    &:hover {
        background-color: var(--plurid-surface-strong);
        color: var(--plurid-ink);
    }

    &:focus-visible {
        ${chromeFocusRing(1)}
    }
`;
// #endregion module

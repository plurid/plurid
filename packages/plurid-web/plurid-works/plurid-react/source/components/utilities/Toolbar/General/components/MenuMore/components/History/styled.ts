// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #endregion libraries


    // #region external
    import {
        chromeControl,
    } from '~services/styled/chrome';
    // #endregion external
// #endregion imports



// #region module
export const StyledHistoryControls = styled.div`
    display: flex;
    gap: 6px;
    padding: 4px 0.5rem 8px;
`;

export const StyledHistoryButton = styled.button`
    ${chromeControl}
    flex: 1;
    height: var(--plurid-control-small);
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

    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

export const StyledHistoryEmpty = styled.div`
    padding: 4px 0.5rem 10px;
    color: var(--plurid-ink-faint);
    font-size: var(--plurid-font-size-small);
`;

export const StyledHistoryList = styled.div`
    max-height: 220px;
    overflow-y: auto;
    scrollbar-width: thin;
    padding-bottom: 6px;
`;

export const StyledHistoryRow = styled.div<{ present?: boolean; ahead?: boolean }>`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    min-height: 26px;
    padding: 3px 0.5rem;
    border-radius: calc(var(--plurid-radius) - 3px);
    cursor: ${({ present }) => (present ? 'default' : 'pointer')};
    /* a step ahead of the present (what redo would do) is the ambient tier */
    opacity: ${({ ahead }) => (ahead ? 'var(--plurid-opacity-ambient)' : '1')};
    color: ${({ present }) => (present ? 'var(--plurid-ink)' : 'var(--plurid-ink-muted)')};
    background-color: ${({ present }) => (present ? 'var(--plurid-hover)' : 'transparent')};

    &:hover {
        background-color: var(--plurid-hover);
    }
`;

export const StyledHistoryLabel = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const StyledHistoryWhen = styled.span`
    flex-shrink: 0;
    color: var(--plurid-ink-faint);
    font-size: var(--plurid-font-size-small);
    font-variant-numeric: tabular-nums;
`;
// #endregion module

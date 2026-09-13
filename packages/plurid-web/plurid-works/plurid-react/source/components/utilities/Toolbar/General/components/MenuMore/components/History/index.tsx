// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridHistoryEntry,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        usePluridHistory,
    } from '~services/hooks/history';
    // #endregion external


    // #region internal
    import {
        StyledHistoryList,
        StyledHistoryRow,
        StyledHistoryLabel,
        StyledHistoryWhen,
        StyledHistoryControls,
        StyledHistoryButton,
        StyledHistoryEmpty,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
/** How long ago, in as few words as it takes. */
const ago = (
    at: number,
    now: number,
): string => {
    const seconds = Math.max(0, Math.round((now - at) / 1000));
    if (seconds < 60) {
        return seconds + 's ago';
    }
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
        return minutes + 'm ago';
    }
    return Math.round(minutes / 60) + 'h ago';
};

interface HistoryRow {
    key: string;
    entry: PluridHistoryEntry;
    /** What `goTo` takes: negative undoes to that step, positive redoes to it. */
    index: number;
}


/**
 * THE HISTORY, as a list: every step of the arrangement by the name the change gave it
 * (`describeArrangementChange`), the present marked, a click jumping to that step in ONE restore
 * (`history.goTo`). The steps ahead of the present (what redo would do) are listed above it.
 */
const MenuMoreHistory: React.FC = () => {
    const history = usePluridHistory();
    const now = Date.now();

    // newest at the top: the furthest redo first, then the present, then back through the undos
    const ahead: HistoryRow[] = history.future
        .map((entry, index) => ({ key: 'future-' + index, entry, index: index + 1 }))
        .reverse();
    const behind: HistoryRow[] = history.past
        .map((entry, index) => ({ key: 'past-' + index, entry, index: -(history.past.length - index) }))
        .reverse();

    const row = (
        item: HistoryRow,
        isAhead: boolean,
    ) => (
        <StyledHistoryRow
            key={item.key}
            role="option"
            aria-selected={false}
            ahead={isAhead}
            data-plurid-control="history-entry"
            data-plurid-history-index={item.index}
            onClick={() => history.goTo(item.index)}
        >
            <StyledHistoryLabel>{item.entry.label}</StyledHistoryLabel>
            <StyledHistoryWhen>{ago(item.entry.at, now)}</StyledHistoryWhen>
        </StyledHistoryRow>
    );

    return (
        <>
            <StyledHistoryControls>
                <StyledHistoryButton
                    type="button"
                    disabled={!history.canUndo}
                    data-plurid-control="history-undo"
                    onClick={() => history.undo()}
                >
                    undo
                </StyledHistoryButton>

                <StyledHistoryButton
                    type="button"
                    disabled={!history.canRedo}
                    data-plurid-control="history-redo"
                    onClick={() => history.redo()}
                >
                    redo
                </StyledHistoryButton>
            </StyledHistoryControls>

            {ahead.length === 0 && behind.length === 0 && (
                <StyledHistoryEmpty>
                    nothing yet
                </StyledHistoryEmpty>
            )}

            {(ahead.length > 0 || behind.length > 0) && (
                <StyledHistoryList
                    role="listbox"
                    aria-label="History"
                >
                    {ahead.map((item) => row(item, true))}

                    <StyledHistoryRow
                        role="option"
                        aria-selected={true}
                        present={true}
                        data-plurid-control="history-present"
                    >
                        <StyledHistoryLabel>now</StyledHistoryLabel>
                    </StyledHistoryRow>

                    {behind.map((item) => row(item, false))}
                </StyledHistoryList>
            )}
        </>
    );
}
// #endregion module



// #region exports
export default MenuMoreHistory;
// #endregion exports

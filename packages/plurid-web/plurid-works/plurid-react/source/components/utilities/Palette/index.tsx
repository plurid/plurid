// #region imports
    // #region libraries
    import React, {
        useEffect,
        useId,
        useMemo,
        useRef,
        useState,
    } from 'react';

    import {
        PLURID_ENTITY_PALETTE,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    import Context from '~services/context';
    import {
        getPlanesRegistrar,
    } from '~services/engine';

    import {
        useEngineStore,
        useEngineDispatch,
        useEngineSelector,
        useEnginePubSub,
    } from '~services/hooks/engine';

    import {
        paletteRows,
        filterRows,
        PaletteRow,
    } from '~services/logic/palette';
    // #endregion external


    // #region internal
    import {
        StyledPaletteBackdrop,
        StyledPalettePanel,
        StyledPaletteInput,
        StyledPaletteList,
        StyledPaletteGroupTitle,
        StyledPaletteRow,
        StyledPaletteKeys,
        StyledPaletteKey,
        StyledPaletteEmpty,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const ROW_ID = 'plurid-palette-row-';

/**
 * THE COMMAND PALETTE (⌘/Ctrl+K): every command that applies right now, the space's bookmarks and
 * presets, and every shown plane — one list, filtered as you type. A row runs the SAME code its key
 * press runs (`runShortcut`), so a command never has a second implementation. The rows are read from
 * the store WHEN IT OPENS (a still list to walk); the arrows move, Enter runs, Escape closes.
 */
const PluridPalette: React.FC = () => {
    // one per application: two palettes on a page had one id between them
    const listID = 'plurid-palette-list-' + useId().replace(/[^A-Za-z0-9_-]/g, '');
    // #region properties
    const store = useEngineStore();
    const dispatch = useEngineDispatch();
    const pubsub = useEnginePubSub();
    const visible = useEngineSelector(selectors.ui.getPaletteVisible);
    const theme = useEngineSelector(selectors.themes.getGeneralTheme);
    const context = React.useContext(Context);
    // #endregion properties


    // #region references
    const panel = useRef<HTMLDivElement>(null);
    const input = useRef<HTMLInputElement>(null);
    const restoreFocus = useRef<HTMLElement | null>(null);
    const list = useRef<HTMLDivElement>(null);
    // #endregion references


    // #region state
    const [query, setQuery] = useState('');
    const [at, setAt] = useState(0);
    // the rows are the state AS THE PALETTE OPENED: a list that moves while it is read is unusable
    const [rows, setRows] = useState<PaletteRow[]>([]);
    const shown = useMemo(() => filterRows(rows, query), [rows, query]);
    const selected = shown[Math.min(at, Math.max(0, shown.length - 1))];
    // #endregion state


    // #region effects
    useEffect(() => {
        if (!visible) {
            return;
        }
        setQuery('');
        setAt(0);
        // a plane goes by its declared title, as its bar and a screen reader name it (the rows used
        // to show the path of every plane, titled or not)
        const registrar = getPlanesRegistrar(context?.planesRegistrar);
        setRows(paletteRows(store.getState(), {
            titleOf: (route) => {
                const head = registrar?.get(route)?.head as { title?: unknown } | undefined;
                return head && typeof head === 'object' && typeof head.title === 'string' ? head.title : undefined;
            },
        }));
        if (typeof document !== 'undefined') {
            restoreFocus.current = document.activeElement as HTMLElement | null;
        }
        input.current?.focus({ preventScroll: true });

        return () => {
            const previous = restoreFocus.current;
            restoreFocus.current = null;
            if (previous && typeof previous.focus === 'function' && previous.isConnected) {
                previous.focus({ preventScroll: true });
            }
        };
    }, [
        visible,
    ]);

    // keep the selected row in view while the arrows walk the list (jsdom has no `scrollIntoView`)
    useEffect(() => {
        const element = list.current?.querySelector('[data-plurid-palette-selected="true"]');
        if (element && typeof element.scrollIntoView === 'function') {
            element.scrollIntoView({ block: 'nearest' });
        }
    }, [
        at,
        query,
    ]);
    // #endregion effects


    // #region handlers
    const close = () => dispatch(actions.ui.setPaletteVisible(false));

    const run = (row: PaletteRow | undefined) => {
        if (!row || !pubsub) {
            return;
        }
        close();
        row.run({
            dispatch,
            state: store.getState(),
            pubsub,
        });
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
        // the palette owns its keys: the space's shortcuts never see them while it is open
        event.stopPropagation();
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            run(selected);
            return;
        }
        if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey)) {
            event.preventDefault();
            setAt((value) => (shown.length === 0 ? 0 : (value + 1) % shown.length));
            return;
        }
        if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
            event.preventDefault();
            setAt((value) => (shown.length === 0 ? 0 : (value - 1 + shown.length) % shown.length));
        }
    };
    // #endregion handlers


    // #region render
    if (!visible) {
        return null;
    }

    let group = '';

    return (
        <StyledPaletteBackdrop
            onClick={close}
            onWheel={(event: React.WheelEvent) => event.stopPropagation()}
            data-plurid-entity={PLURID_ENTITY_PALETTE}
            data-plurid-overlay="palette"
        >
            <StyledPalettePanel
                ref={panel}
                theme={theme}
                role="dialog"
                aria-modal="true"
                aria-label="Command palette"
                onClick={(event: React.MouseEvent) => event.stopPropagation()}
                onKeyDown={onKeyDown}
            >
                <StyledPaletteInput
                    ref={input}
                    type="text"
                    value={query}
                    placeholder="Run a command, go to a plane…"
                    role="combobox"
                    aria-expanded={true}
                    aria-controls={listID}
                    aria-autocomplete="list"
                    aria-activedescendant={selected ? ROW_ID + selected.id : undefined}
                    data-plurid-control="palette-input"
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setAt(0);
                    }}
                />

                <StyledPaletteList
                    ref={list}
                    id={listID}
                    role="listbox"
                    aria-label="Commands"
                >
                    {shown.length === 0 && (
                        <StyledPaletteEmpty>
                            Nothing matches “{query}”.
                        </StyledPaletteEmpty>
                    )}

                    {shown.map((row) => {
                        const heading = row.group !== group ? row.group : '';
                        group = row.group;
                        const isSelected = row === selected;

                        return (
                            <React.Fragment key={row.id}>
                                {heading && (
                                    <StyledPaletteGroupTitle>
                                        {heading}
                                    </StyledPaletteGroupTitle>
                                )}

                                <StyledPaletteRow
                                    id={ROW_ID + row.id}
                                    theme={theme}
                                    selected={isSelected}
                                    role="option"
                                    aria-selected={isSelected}
                                    data-plurid-control="palette-row"
                                    data-plurid-palette-row={row.id}
                                    data-plurid-palette-selected={isSelected ? 'true' : undefined}
                                    onMouseEnter={() => setAt(shown.indexOf(row))}
                                    onClick={() => run(row)}
                                >
                                    <span className="title">{row.title}</span>

                                    {row.keys && row.keys.length > 0 && (
                                        <StyledPaletteKeys>
                                            {row.keys.map((key, index) => (
                                                <StyledPaletteKey key={key + index}>
                                                    {key}
                                                </StyledPaletteKey>
                                            ))}
                                        </StyledPaletteKeys>
                                    )}
                                </StyledPaletteRow>
                            </React.Fragment>
                        );
                    })}
                </StyledPaletteList>
            </StyledPalettePanel>
        </StyledPaletteBackdrop>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default PluridPalette;
// #endregion exports

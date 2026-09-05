// #region imports
    // #region libraries
    import React, {
        useEffect,
        useMemo,
        useRef,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridConfigurationSpaceShortcuts,
        PLURID_ENTITY_SHORTCUTS_OVERLAY,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';

    import {
        describeShortcuts,
    } from '~services/logic/shortcuts/registry';
    // #endregion external


    // #region internal
    import {
        StyledShortcutsTrigger,
        StyledShortcutsBackdrop,
        StyledShortcutsPanel,
        StyledShortcutsHeader,
        StyledShortcutsGroups,
        StyledShortcutsGroup,
        StyledShortcutsGroupTitle,
        StyledShortcutsRow,
        StyledShortcutsKeys,
        StyledShortcutsKey,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridShortcutsStateProperties {
    theme: Theme;
    visible: boolean;
    shortcuts?: PluridConfigurationSpaceShortcuts;
}

export interface PluridShortcutsDispatchProperties {
    setVisible: (visible: boolean) => void;
}

export type PluridShortcutsProperties =
    & PluridShortcutsStateProperties
    & PluridShortcutsDispatchProperties;

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The help overlay: the engine's keyboard / pointer vocabulary, GENERATED from the shortcut table
 * with the host's `keymap` / `disabled` applied (so it can never drift from the bindings). Toggled
 * with `?` (a registry shortcut) or its trigger button; a real modal dialog — focus moves in,
 * Tab is trapped, Escape and the backdrop close it, focus returns to where it was.
 */
const PluridShortcuts: React.FC<PluridShortcutsProperties> = (
    properties,
) => {
    // #region properties
    const {
        theme,
        visible,
        shortcuts,
        setVisible,
    } = properties;
    // #endregion properties


    // #region references
    const panel = useRef<HTMLDivElement>(null);
    const restoreFocus = useRef<HTMLElement | null>(null);
    // #endregion references


    // #region state
    const groups = useMemo(
        () => describeShortcuts(shortcuts),
        [
            JSON.stringify(shortcuts?.keymap || null),
            JSON.stringify(shortcuts?.disabled ?? null),
        ],
    );
    // #endregion state


    // #region effects
    useEffect(() => {
        if (!visible) {
            return;
        }
        if (typeof document !== 'undefined') {
            restoreFocus.current = document.activeElement as HTMLElement | null;
        }
        const element = panel.current;
        if (element) {
            element.focus({ preventScroll: true });
        }

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
    // #endregion effects


    // #region handlers
    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.stopPropagation();
            setVisible(false);
            return;
        }
        if (event.key !== 'Tab' || !panel.current) {
            return;
        }
        // Trap Tab inside the dialog.
        const focusable = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE))
            .filter((node) => !node.hasAttribute('disabled'));
        if (focusable.length === 0) {
            event.preventDefault();
            return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && (active === first || active === panel.current)) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    };
    // #endregion handlers


    // #region render
    return (
        <>
        <StyledShortcutsTrigger
            theme={theme}
            type="button"
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
            aria-haspopup="dialog"
            aria-expanded={visible}
            data-plurid-control="shortcuts"
            onClick={() => setVisible(!visible)}
        >
            ?
        </StyledShortcutsTrigger>

        {visible && (
        <StyledShortcutsBackdrop
            onClick={() => setVisible(false)}
            onWheel={(event: React.WheelEvent) => event.stopPropagation()}
            data-plurid-entity={PLURID_ENTITY_SHORTCUTS_OVERLAY}
            data-plurid-control="shortcuts-overlay"
        >
            <StyledShortcutsPanel
                ref={panel}
                theme={theme}
                role="dialog"
                aria-modal="true"
                aria-labelledby="plurid-shortcuts-title"
                tabIndex={-1}
                onClick={(event: React.MouseEvent) => event.stopPropagation()}
                onKeyDown={onKeyDown}
            >
                <StyledShortcutsHeader>
                    <h2 id="plurid-shortcuts-title">Keyboard Shortcuts</h2>
                    <span>? or Esc to close</span>
                </StyledShortcutsHeader>

                <StyledShortcutsGroups>
                    {groups.map((group) => (
                        <StyledShortcutsGroup key={group.id}>
                            <StyledShortcutsGroupTitle>
                                {group.title}
                            </StyledShortcutsGroupTitle>

                            {group.items.map((item, itemIndex) => (
                                <StyledShortcutsRow key={(item.id || item.label) + itemIndex}>
                                    <span className="label">{item.label}</span>

                                    <StyledShortcutsKeys>
                                        {item.keys.map((key, keyIndex) => (
                                            <StyledShortcutsKey
                                                key={key + keyIndex}
                                                theme={theme}
                                            >
                                                {key}
                                            </StyledShortcutsKey>
                                        ))}
                                    </StyledShortcutsKeys>
                                </StyledShortcutsRow>
                            ))}
                        </StyledShortcutsGroup>
                    ))}
                </StyledShortcutsGroups>
            </StyledShortcutsPanel>
        </StyledShortcutsBackdrop>
        )}
        </>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridShortcutsStateProperties => ({
    theme: selectors.themes.getGeneralTheme(state),
    visible: selectors.ui.getShortcutsOverlayVisible(state),
    shortcuts: selectors.configuration.getConfiguration(state).space.shortcuts,
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridShortcutsDispatchProperties => ({
    setVisible: (visible) => dispatch(
        actions.ui.setShortcutsOverlayVisible(visible),
    ),
});


const ConnectedPluridShortcuts = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridShortcuts);
// #endregion module



// #region exports
export default ConnectedPluridShortcuts;
// #endregion exports

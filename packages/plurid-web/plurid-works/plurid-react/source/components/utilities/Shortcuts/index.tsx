// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
    } from 'react';

    import { connect } from 'react-redux';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // #endregion external


    // #region internal
    import {
        SHORTCUT_GROUPS,
    } from './data';

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
}

export type PluridShortcutsProperties = PluridShortcutsStateProperties;

/**
 * Self-contained help overlay listing the engine's keyboard/pointer vocabulary.
 * Toggled with `?` (and dismissed with `?`, `Escape`, or a backdrop click) — owns its
 * own visibility so it needs no wiring into the View, matching the Toolbar/Viewcube pattern.
 */
const PluridShortcuts: React.FC<PluridShortcutsProperties> = (
    properties,
) => {
    // #region properties
    const {
        theme,
    } = properties;
    // #endregion properties


    // #region state
    const [visible, setVisible] = useState(false);
    // #endregion state


    // #region effects
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            if (target && (
                target.tagName === 'INPUT'
                || target.tagName === 'TEXTAREA'
                || target.isContentEditable
            )) {
                return;
            }

            if (event.key === '?') {
                event.preventDefault();
                setVisible((value) => !value);
            } else if (event.key === 'Escape') {
                setVisible((value) => (value ? false : value));
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, []);
    // #endregion effects


    // #region render
    return (
        <>
        <StyledShortcutsTrigger
            theme={theme}
            type="button"
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
            onClick={() => setVisible((value) => !value)}
        >
            ?
        </StyledShortcutsTrigger>

        {visible && (
        <StyledShortcutsBackdrop
            onClick={() => setVisible(false)}
            data-plurid-entity="shortcuts-overlay"
        >
            <StyledShortcutsPanel
                theme={theme}
                onClick={(event) => event.stopPropagation()}
            >
                <StyledShortcutsHeader>
                    <h2>Keyboard Shortcuts</h2>
                    <span>? or Esc to close</span>
                </StyledShortcutsHeader>

                <StyledShortcutsGroups>
                    {SHORTCUT_GROUPS.map((group) => (
                        <StyledShortcutsGroup key={group.title}>
                            <StyledShortcutsGroupTitle>
                                {group.title}
                            </StyledShortcutsGroupTitle>

                            {group.items.map((item, itemIndex) => (
                                <StyledShortcutsRow key={item.label + itemIndex}>
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
});


const ConnectedPluridShortcuts = connect(
    mapStateToProperties,
    null,
    null,
    {
        context: StateContext,
    },
)(PluridShortcuts);
// #endregion module



// #region exports
export default ConnectedPluridShortcuts;
// #endregion exports

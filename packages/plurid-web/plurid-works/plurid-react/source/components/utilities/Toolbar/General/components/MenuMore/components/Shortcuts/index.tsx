// #region imports
    // #region libraries
    import React, {
        useMemo,
    } from 'react';

    import { connect } from 'react-redux';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        StyledPluridMoreMenuItem,
    } from '../../styled';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';

    import {
        describeShortcuts,
    } from '~services/logic/shortcuts/registry';
    // #endregion external
// #endregion imports



// #region module
export interface PluridMenuMoreShortcutsOwnProperties {
}

export interface PluridMenuMoreShortcutsStateProperties {
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

export type PluridMenuMoreShortcutsProperties = PluridMenuMoreShortcutsOwnProperties
    & PluridMenuMoreShortcutsStateProperties;


/**
 * The toolbar's shortcuts drawer, generated from the SAME shortcut table as the `?` overlay (with
 * the host's `keymap` / `disabled` applied) — it used to render a separate, stale copy.
 */
const PluridMenuMoreShortcuts: React.FC<PluridMenuMoreShortcutsProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        interactionTheme,
        configuration,
    } = properties;

    const shortcuts = configuration.space.shortcuts;

    const rows = useMemo(() => {
        const groups = describeShortcuts(shortcuts);
        const flat: { key: string; label: string; keys: string; afterline: boolean }[] = [];
        groups.forEach((group) => {
            group.items.forEach((item, index) => {
                flat.push({
                    key: group.id + '-' + (item.id || index),
                    label: item.label,
                    keys: item.keys.join(' + '),
                    afterline: index === group.items.length - 1,
                });
            });
        });
        return flat;
    }, [
        JSON.stringify(shortcuts?.keymap || null),
        JSON.stringify(shortcuts?.disabled ?? null),
    ]);


    /** render */
    return (
        <>
            {rows.map((row, index) => (
                <StyledPluridMoreMenuItem
                    key={row.key}
                    theme={interactionTheme}
                    afterline={row.afterline && index !== rows.length - 1}
                    last={index === rows.length - 1}
                >
                    <div>
                        {row.label}
                    </div>

                    <div>
                        {row.keys}
                    </div>
                </StyledPluridMoreMenuItem>
            ))}
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridMenuMoreShortcutsStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const ConnectedPluridMenuMoreShortcuts = connect(
    mapStateToProps,
    null,
    null,
    {
        context: StateContext,
    },
)(PluridMenuMoreShortcuts);
// #endregion module



// #region exports
export default ConnectedPluridMenuMoreShortcuts;
// #endregion exports

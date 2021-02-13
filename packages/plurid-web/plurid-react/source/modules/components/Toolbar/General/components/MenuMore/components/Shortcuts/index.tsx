// #region imports
    // #region libraries
    import React from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        defaultShortcuts,
        shortcutsNames,

        PluridConfiguration,
    } from '@plurid/plurid-data';

    import {
        internatiolate,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import {
        StyledPluridMoreMenuItem,
    } from '../../styled';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external
// #endregion imports



// #region module
export interface PluridMenuMoreShortcutsOwnProperties {
}

export interface PluridMenuMoreShortcutsStateProperties {
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

export interface PluridMenuMoreShortcutsDispatchProperties {
}

export type PluridMenuMoreShortcutsProperties = PluridMenuMoreShortcutsOwnProperties
    & PluridMenuMoreShortcutsStateProperties
    & PluridMenuMoreShortcutsDispatchProperties;

const PluridMenuMoreShortcuts: React.FC<PluridMenuMoreShortcutsProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        interactionTheme,
        configuration,

        /** dispatch */
    } = properties;

    const {
        global,
    } = configuration;

    const {
        language,
    } = global;


    /** render */
    return (
        <>
            {defaultShortcuts.map((shortcut, index) => {
                const {
                    type,
                } = shortcut;
                const shortcutData = shortcutsNames[type];
                const {
                    name,
                    internationalizedKey,
                    key,
                    modifier,
                } = shortcutData;
                const modifierString = Array.isArray(modifier)
                    ? modifier.reduce((total, element) => total + ' + ' + element) + ' +'
                    : typeof modifier === 'string'
                        ? modifier + ' +'
                        : '';

                const internationalizedName = internatiolate(language, name);

                const keyAsAny: any = key;
                const keyName = internationalizedKey
                    ? internatiolate(language, keyAsAny)
                    : key;

                return (
                    <StyledPluridMoreMenuItem
                        key={name}
                        theme={interactionTheme}
                        afterline={
                            type === 'TURN_DOWN'
                            || type === 'TOGGLE_ROTATE'
                            || type === 'TOGGLE_TRANSLATE'
                        }
                        last={index === defaultShortcuts.length - 1 ? true : false}
                    >
                        <div>
                            {internationalizedName}
                        </div>

                        <div>
                            {modifierString} {keyName}
                        </div>
                    </StyledPluridMoreMenuItem>
                );
            })}
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridMenuMoreShortcutsStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): PluridMenuMoreShortcutsDispatchProperties => ({
});


const ConnectedPluridMenuMoreShortcuts = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridMenuMoreShortcuts);
// #endregion module



// #region exports
export default ConnectedPluridMenuMoreShortcuts;
// #endregion exports

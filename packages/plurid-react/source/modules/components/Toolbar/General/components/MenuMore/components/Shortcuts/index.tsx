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

import {
    StyledMoreMenuItem,
} from '../../styled';

import { AppState } from '../../../../../../../services/state/store';
import StateContext from '../../../../../../../services/state/context';
import selectors from '../../../../../../../services/state/selectors';
// import actions from '../../../../../../../services/state/actions';



interface MenuMoreShortcutsOwnProperties {
}

interface MenuMoreShortcutsStateProperties {
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

interface MenuMoreShortcutsDispatchProperties {
}

type MenuMoreShortcutsProperties = MenuMoreShortcutsOwnProperties
    & MenuMoreShortcutsStateProperties
    & MenuMoreShortcutsDispatchProperties;

const MenuMoreShortcuts: React.FC<MenuMoreShortcutsProperties> = (
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
        language,
    } = configuration;


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
                    key,
                    modifier,
                } = shortcutData;
                const modifierString = Array.isArray(modifier)
                    ? modifier.reduce((total, element) => total + ' + ' + element) + ' +'
                    : typeof modifier === 'string'
                        ? modifier + ' +'
                        : '';

                const internationalizedName = internatiolate(language, name);

                return (
                    <StyledMoreMenuItem
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
                            {modifierString} {key}
                        </div>
                    </StyledMoreMenuItem>
                );
            })}
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): MenuMoreShortcutsStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): MenuMoreShortcutsDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(MenuMoreShortcuts);

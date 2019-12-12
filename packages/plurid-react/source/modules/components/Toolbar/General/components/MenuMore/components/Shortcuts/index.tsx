import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    PluridConfiguration,

    defaultShortcuts,
    shortcutsNames,
} from '@plurid/plurid-data';

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

const MenuMoreShortcuts: React.FC<MenuMoreShortcutsProperties> = (properties) => {
    const {
        /** state */
        // interactionTheme,
        // configuration,

        /** dispatch */
    } = properties;

    return (
        <>
            {defaultShortcuts.map(shortcut => {
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

                return (
                    <StyledMoreMenuItem
                        key={name}
                        afterline={
                            type === 'TURN_DOWN'
                            || type === 'TOGGLE_ROTATE'
                            || type === 'TOGGLE_TRANSLATE'
                        }
                    >
                        <div>
                            {name}
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

import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    PluridSwitch
} from '@plurid/plurid-ui-react';

import {
    StyledMoreMenuItem,
} from '../../styled';

import { AppState } from '../../../../../../../services/state/store';
import StateContext from '../../../../../../../services/state/context';
import selectors from '../../../../../../../services/state/selectors';
import actions from '../../../../../../../services/state/actions';



interface MenuMoreViewcubeOwnProperties {
}

interface MenuMoreViewcubeStateProperties {
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

interface MenuMoreViewcubeDispatchProperties {
    dispatchToggleConfigurationViewcubeHide: typeof actions.configuration.toggleConfigurationViewcubeHide;
    dispatchToggleConfigurationViewcubeOpaque: typeof actions.configuration.toggleConfigurationViewcubeOpaque;
    dispatchToggleConfigurationViewcubeConceal: typeof actions.configuration.toggleConfigurationViewcubeConceal;
}

type MenuMoreViewcubeProperties = MenuMoreViewcubeOwnProperties
    & MenuMoreViewcubeStateProperties
    & MenuMoreViewcubeDispatchProperties;

const MenuMoreViewcube: React.FC<MenuMoreViewcubeProperties> = (properties) => {
    const {
        /** state */
        interactionTheme,
        configuration,

        /** dispatch */
        dispatchToggleConfigurationViewcubeHide,
        dispatchToggleConfigurationViewcubeOpaque,
        dispatchToggleConfigurationViewcubeConceal,
    } = properties;

    const {
        viewcube,
    } = configuration.elements;

    const {
        show,
        opaque,
        conceal,
    } = viewcube;

    return (
        <>
            <StyledMoreMenuItem>
                <div>
                    {show
                        ? 'hide'
                        : 'show'
                    } viewcube
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={show}
                    atChange={() => dispatchToggleConfigurationViewcubeHide(!show)}
                    exclusive={true}
                    level={2}
                />
            </StyledMoreMenuItem>

            {show && (
                <>
                    <StyledMoreMenuItem>
                        <div>
                            always opaque
                        </div>

                        <PluridSwitch
                            theme={interactionTheme}
                            checked={opaque}
                            atChange={() => dispatchToggleConfigurationViewcubeOpaque(!opaque)}
                            exclusive={true}
                            level={2}
                        />
                    </StyledMoreMenuItem>

                    <StyledMoreMenuItem>
                        <div>
                            conceal viewcube
                        </div>

                        <PluridSwitch
                            theme={interactionTheme}
                            checked={conceal}
                            atChange={() => dispatchToggleConfigurationViewcubeConceal()}
                            exclusive={true}
                            level={2}
                        />
                    </StyledMoreMenuItem>
                </>
            )}
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): MenuMoreViewcubeStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): MenuMoreViewcubeDispatchProperties => ({
    dispatchToggleConfigurationViewcubeHide: (toggle: boolean) => dispatch(
        actions.configuration.toggleConfigurationViewcubeHide(toggle)
    ),
    dispatchToggleConfigurationViewcubeOpaque: (toggle: boolean) => dispatch(
        actions.configuration.toggleConfigurationViewcubeOpaque(toggle)
    ),
    dispatchToggleConfigurationViewcubeConceal: () => dispatch(
        actions.configuration.toggleConfigurationViewcubeConceal()
    ),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(MenuMoreViewcube);

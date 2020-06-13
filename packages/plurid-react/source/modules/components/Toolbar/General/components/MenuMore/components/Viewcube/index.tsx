import React from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    internationalization,

    PluridConfiguration,
    InternationalizationLanguageType,
} from '@plurid/plurid-data';

import {
    internatiolate,
} from '@plurid/plurid-engine';

import {
    PluridSwitch
} from '@plurid/plurid-ui-react';

import {
    StyledPluridMoreMenuItem,
} from '../../styled';

import { AppState } from '../../../../../../../services/state/store';
import StateContext from '../../../../../../../services/state/context';
import selectors from '../../../../../../../services/state/selectors';
import actions from '../../../../../../../services/state/actions';



export interface PluridMenuMoreViewcubeOwnProperties {
}

export interface PluridMenuMoreViewcubeStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

export interface PluridMenuMoreViewcubeDispatchProperties {
    dispatchToggleConfigurationViewcubeHide: typeof actions.configuration.toggleConfigurationViewcubeHide;
    dispatchToggleConfigurationViewcubeButtons: typeof actions.configuration.toggleConfigurationViewcubeButtons;
    dispatchToggleConfigurationViewcubeOpaque: typeof actions.configuration.toggleConfigurationViewcubeOpaque;
    dispatchToggleConfigurationViewcubeConceal: typeof actions.configuration.toggleConfigurationViewcubeConceal;
}

export type PluridMenuMoreViewcubeProperties = PluridMenuMoreViewcubeOwnProperties
    & PluridMenuMoreViewcubeStateProperties
    & PluridMenuMoreViewcubeDispatchProperties;


const PluridMenuMoreViewcube: React.FC<PluridMenuMoreViewcubeProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        stateLanguage,
        interactionTheme,
        configuration,

        /** dispatch */
        dispatchToggleConfigurationViewcubeHide,
        dispatchToggleConfigurationViewcubeButtons,
        dispatchToggleConfigurationViewcubeOpaque,
        dispatchToggleConfigurationViewcubeConceal,
    } = properties;

    const {
        viewcube,
    } = configuration.elements;

    const {
        show,
        buttons,
        opaque,
        conceal,
    } = viewcube;


    /** render */
    return (
        <>
            <StyledPluridMoreMenuItem
                last={!show ? true : false}
            >
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerViewcubeShowViewcube)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={show}
                    atChange={() => dispatchToggleConfigurationViewcubeHide(!show)}
                    exclusive={true}
                    level={2}
                />
            </StyledPluridMoreMenuItem>

            {show && (
                <>
                    <StyledPluridMoreMenuItem>
                        <div>
                            {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerViewcubeShowTransformButtons)}
                        </div>

                        <PluridSwitch
                            theme={interactionTheme}
                            checked={buttons}
                            atChange={() => dispatchToggleConfigurationViewcubeButtons(!buttons)}
                            exclusive={true}
                            level={2}
                        />
                    </StyledPluridMoreMenuItem>

                    <StyledPluridMoreMenuItem>
                        <div>
                            {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerViewcubeAlwaysOpaque)}
                        </div>

                        <PluridSwitch
                            theme={interactionTheme}
                            checked={opaque}
                            atChange={() => dispatchToggleConfigurationViewcubeOpaque(!opaque)}
                            exclusive={true}
                            level={2}
                        />
                    </StyledPluridMoreMenuItem>

                    <StyledPluridMoreMenuItem
                        last={true}
                    >
                        <div>
                            {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerViewcubeConcealViewcube)}
                        </div>

                        <PluridSwitch
                            theme={interactionTheme}
                            checked={conceal}
                            atChange={() => dispatchToggleConfigurationViewcubeConceal()}
                            exclusive={true}
                            level={2}
                        />
                    </StyledPluridMoreMenuItem>
                </>
            )}
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridMenuMoreViewcubeStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).language,
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): PluridMenuMoreViewcubeDispatchProperties => ({
    dispatchToggleConfigurationViewcubeHide: (toggle: boolean) => dispatch(
        actions.configuration.toggleConfigurationViewcubeHide(toggle)
    ),
    dispatchToggleConfigurationViewcubeButtons: (toggle: boolean) => dispatch(
        actions.configuration.toggleConfigurationViewcubeButtons(toggle)
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
)(PluridMenuMoreViewcube);

import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    internationalization,

    TRANSFORM_TOUCHES,

    PluridConfiguration,
    InternationalizationLanguageType,
} from '@plurid/plurid-data';

import {
    internatiolate,
} from '@plurid/plurid-engine';

import {
    PluridSwitch,
} from '@plurid/plurid-ui-react';

import {
    StyledMoreMenuItem,
} from '../../styled';

import { AppState } from '../../../../../../../services/state/store';
import StateContext from '../../../../../../../services/state/context';
import selectors from '../../../../../../../services/state/selectors';
import actions from '../../../../../../../services/state/actions';



interface MenuMoreTransformOwnProperties {
}

interface MenuMoreTransformStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

interface MenuMoreTransformDispatchProperties {
    dispatchToggleConfigurationSpaceTransformMultimode: typeof actions.configuration.toggleConfigurationSpaceTransformMultimode;
    dispatchSetConfigurationSpaceTransformTouch: typeof actions.configuration.setConfigurationSpaceTransformTouch;
    dispatchSetConfigurationSpaceTransformLocks: typeof actions.configuration.setConfigurationSpaceTransformLocks;
}

type MenuMoreTransformProperties = MenuMoreTransformOwnProperties
    & MenuMoreTransformStateProperties
    & MenuMoreTransformDispatchProperties;

const MenuMoreTransform: React.FC<MenuMoreTransformProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        stateLanguage,
        interactionTheme,
        configuration,

        /** dispatch */
        dispatchToggleConfigurationSpaceTransformMultimode,
        dispatchSetConfigurationSpaceTransformTouch,
        dispatchSetConfigurationSpaceTransformLocks,
    } = properties;

    const {
        transformMultimode,
        transformLocks,
        transformTouch,
    } = configuration.space;


    /** render */
    return (
        <>
            <StyledMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformMultiModeTransform)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformMultimode}
                    atChange={() => dispatchToggleConfigurationSpaceTransformMultimode(!transformMultimode)}
                    exclusive={true}
                    level={2}
                />
            </StyledMoreMenuItem>

            <StyledMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformAllowRotationX)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformLocks.rotationX}
                    atChange={() => dispatchSetConfigurationSpaceTransformLocks('rotationX')}
                    exclusive={true}
                    level={2}
                />
            </StyledMoreMenuItem>

            <StyledMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformAllowRotationY)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformLocks.rotationY}
                    atChange={() => dispatchSetConfigurationSpaceTransformLocks('rotationY')}
                    exclusive={true}
                    level={2}
                />
            </StyledMoreMenuItem>

            <StyledMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformAllowTranslationX)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformLocks.translationX}
                    atChange={() => dispatchSetConfigurationSpaceTransformLocks('translationX')}
                    exclusive={true}
                    level={2}
                />
            </StyledMoreMenuItem>

            <StyledMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformAllowTranslationY)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformLocks.translationY}
                    atChange={() => dispatchSetConfigurationSpaceTransformLocks('translationY')}
                    exclusive={true}
                    level={2}
                />
            </StyledMoreMenuItem>

            <StyledMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformAllowTranslationZ)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformLocks.translationZ}
                    atChange={() => dispatchSetConfigurationSpaceTransformLocks('translationZ')}
                    exclusive={true}
                    level={2}
                />
            </StyledMoreMenuItem>

            <StyledMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformAllowScale)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformLocks.scale}
                    atChange={() => dispatchSetConfigurationSpaceTransformLocks('scale')}
                    exclusive={true}
                    level={2}
                />
            </StyledMoreMenuItem>

            <StyledMoreMenuItem
                last={true}
            >
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerTransformTouchTransform)}
                    :&nbsp;{transformTouch === TRANSFORM_TOUCHES.PAN
                        ? 'pan'
                        : 'swipe'
                    }
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformTouch === TRANSFORM_TOUCHES.PAN}
                    atChange={() => transformTouch === TRANSFORM_TOUCHES.PAN
                        ? dispatchSetConfigurationSpaceTransformTouch(TRANSFORM_TOUCHES.SWIPE)
                        : dispatchSetConfigurationSpaceTransformTouch(TRANSFORM_TOUCHES.PAN)
                    }
                    level={2}
                />
            </StyledMoreMenuItem>
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): MenuMoreTransformStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).language,
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): MenuMoreTransformDispatchProperties => ({
    dispatchToggleConfigurationSpaceTransformMultimode: (
        multimode,
    ) => dispatch(
        actions.configuration.toggleConfigurationSpaceTransformMultimode(multimode)
    ),
    dispatchSetConfigurationSpaceTransformTouch: (
        touch: keyof typeof TRANSFORM_TOUCHES,
    ) => dispatch(
        actions.configuration.setConfigurationSpaceTransformTouch(touch)
    ),
    dispatchSetConfigurationSpaceTransformLocks: (
        lock: string,
    ) => dispatch(
        actions.configuration.setConfigurationSpaceTransformLocks(lock)
    ),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(MenuMoreTransform);

import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    PluridConfiguration,

    TRANSFORM_TOUCHES,
} from '@plurid/plurid-data';

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
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

interface MenuMoreTransformDispatchProperties {
    dispatchSetConfigurationSpaceTransformTouch: typeof actions.configuration.setConfigurationSpaceTransformTouch;
    dispatchSetConfigurationSpaceTransformLocks: typeof actions.configuration.setConfigurationSpaceTransformLocks;
}

type MenuMoreTransformProperties = MenuMoreTransformOwnProperties
    & MenuMoreTransformStateProperties
    & MenuMoreTransformDispatchProperties;

const MenuMoreTransform: React.FC<MenuMoreTransformProperties> = (properties) => {
    const {
        /** state */
        interactionTheme,
        configuration,

        /** dispatch */
        dispatchSetConfigurationSpaceTransformTouch,
        dispatchSetConfigurationSpaceTransformLocks,
    } = properties;

    const {
        transformLocks,
        transformTouch,
    } = configuration.space;

    return (
        <>
            <StyledMoreMenuItem>
                <div>
                    lock rotation X
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
                    lock rotation Y
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
                    lock translation X
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
                    lock translation Y
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
                    lock translation Z
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
                    lock scale
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformLocks.scale}
                    atChange={() => dispatchSetConfigurationSpaceTransformLocks('scale')}
                    exclusive={true}
                    level={2}
                />
            </StyledMoreMenuItem>

            <StyledMoreMenuItem>
                <div>
                    touch transform: {transformTouch === TRANSFORM_TOUCHES.PAN
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
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): MenuMoreTransformDispatchProperties => ({
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

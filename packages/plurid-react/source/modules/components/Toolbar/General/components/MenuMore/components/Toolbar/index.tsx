import React, {
    useState,
    useEffect,
} from 'react';
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
    PluridSwitch,
} from '@plurid/plurid-ui-react';

import {
    StyledMoreMenuItem,
} from '../../styled';

import { AppState } from '../../../../../../../services/state/store';
import StateContext from '../../../../../../../services/state/context';
import selectors from '../../../../../../../services/state/selectors';
import actions from '../../../../../../../services/state/actions';
import {
    ViewSize,
} from '../../../../../../../services/state/modules/data/types';



interface MenuMoreToolbarOwnProperties {
}

interface MenuMoreToolbarStateProperties {
    interactionTheme: Theme;
    configuration: PluridConfiguration;
    viewSize: ViewSize;
}

interface MenuMoreToolbarDispatchProperties {
    dispatchToggleConfigurationToolbarConceal: typeof actions.configuration.toggleConfigurationToolbarConceal;
    dispatchToggleConfigurationToolbarTransformIcons: typeof actions.configuration.toggleConfigurationToolbarTransformIcons;
    dispatchToggleConfigurationToolbarTransformButtons: typeof actions.configuration.toggleConfigurationToolbarTransformButtons;
}

type MenuMoreToolbarProperties = MenuMoreToolbarOwnProperties
    & MenuMoreToolbarStateProperties
    & MenuMoreToolbarDispatchProperties;

const MenuMoreToolbar: React.FC<MenuMoreToolbarProperties> = (properties) => {
    const {
        /** state */
        interactionTheme,
        configuration,
        viewSize,

        /** dispatch */
        dispatchToggleConfigurationToolbarConceal,
        dispatchToggleConfigurationToolbarTransformIcons,
        dispatchToggleConfigurationToolbarTransformButtons,
    } = properties;

    const {
        toolbar,
    } = configuration.elements;

    const {
        show: showToolbar,
        conceal,
        transformIcons,
        transformButtons,
    } = toolbar;

    const [viewSizeSmall, setViewSizeSmall] = useState(false);

    useEffect(() => {
        if (viewSize.width < 800) {
            setViewSizeSmall(true);
        } else {
            setViewSizeSmall(false);
        }
    }, [
        viewSize.width,
    ]);

    return (
        <>
            <StyledMoreMenuItem>
                <div>
                    always opaque
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={false}
                    atChange={() => {}}
                    exclusive={true}
                    level={2}
                />
            </StyledMoreMenuItem>

            <StyledMoreMenuItem>
                <div>
                    show transform icons
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformIcons}
                    atChange={() => dispatchToggleConfigurationToolbarTransformIcons()}
                    exclusive={true}
                    level={2}
                />
            </StyledMoreMenuItem>

            {!viewSizeSmall && (
                <StyledMoreMenuItem>
                    <div>
                        show transform arrows
                    </div>

                    <PluridSwitch
                        theme={interactionTheme}
                        checked={transformButtons}
                        atChange={() => dispatchToggleConfigurationToolbarTransformButtons()}
                        exclusive={true}
                        level={2}
                    />
                </StyledMoreMenuItem>
            )}

            <StyledMoreMenuItem>
                <div>
                    conceal toolbar
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={conceal}
                    atChange={() => dispatchToggleConfigurationToolbarConceal()}
                    exclusive={true}
                    level={2}
                />
            </StyledMoreMenuItem>
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): MenuMoreToolbarStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
    viewSize: selectors.data.getViewSize(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): MenuMoreToolbarDispatchProperties => ({
    dispatchToggleConfigurationToolbarConceal: () => dispatch(
        actions.configuration.toggleConfigurationToolbarConceal()
    ),
    dispatchToggleConfigurationToolbarTransformIcons: () => dispatch(
        actions.configuration.toggleConfigurationToolbarTransformIcons()
    ),
    dispatchToggleConfigurationToolbarTransformButtons: () => dispatch(
        actions.configuration.toggleConfigurationToolbarTransformButtons()
    ),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(MenuMoreToolbar);

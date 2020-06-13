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
    internationalization,

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
    StyledPluridMoreMenuItem,
} from '../../styled';

import { AppState } from '../../../../../../../services/state/store';
import StateContext from '../../../../../../../services/state/context';
import selectors from '../../../../../../../services/state/selectors';
import actions from '../../../../../../../services/state/actions';
import {
    ViewSize,
} from '../../../../../../../services/state/types/space';



export interface PluridMenuMoreToolbarOwnProperties {
}

export interface PluridMenuMoreToolbarStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
    viewSize: ViewSize;
}

export interface PluridMenuMoreToolbarDispatchProperties {
    dispatchToggleConfigurationToolbarConceal: typeof actions.configuration.toggleConfigurationToolbarConceal;
    dispatchToggleConfigurationToolbarTransformIcons: typeof actions.configuration.toggleConfigurationToolbarTransformIcons;
    dispatchToggleConfigurationToolbarTransformButtons: typeof actions.configuration.toggleConfigurationToolbarTransformButtons;
    dispatchToggleConfigurationToolbarOpaque: typeof actions.configuration.toggleConfigurationToolbarOpaque
}

export type PluridMenuMoreToolbarProperties = PluridMenuMoreToolbarOwnProperties
    & PluridMenuMoreToolbarStateProperties
    & PluridMenuMoreToolbarDispatchProperties;


const PluridMenuMoreToolbar: React.FC<PluridMenuMoreToolbarProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        stateLanguage,
        interactionTheme,
        configuration,
        viewSize,

        /** dispatch */
        dispatchToggleConfigurationToolbarConceal,
        dispatchToggleConfigurationToolbarTransformIcons,
        dispatchToggleConfigurationToolbarTransformButtons,
        dispatchToggleConfigurationToolbarOpaque,
    } = properties;

    const {
        toolbar,
    } = configuration.elements;

    const {
        conceal,
        opaque,
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


    /** render */
    return (
        <>
            <StyledPluridMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerToolbarAlwaysOpaque)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={opaque}
                    atChange={() => dispatchToggleConfigurationToolbarOpaque()}
                    exclusive={true}
                    level={2}
                />
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerToolbarShowTransformIcons)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={transformIcons}
                    atChange={() => dispatchToggleConfigurationToolbarTransformIcons()}
                    exclusive={true}
                    level={2}
                />
            </StyledPluridMoreMenuItem>

            {!viewSizeSmall && (
                <StyledPluridMoreMenuItem>
                    <div>
                        {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerToolbarShowTransformArrows)}
                    </div>

                    <PluridSwitch
                        theme={interactionTheme}
                        checked={transformButtons}
                        atChange={() => dispatchToggleConfigurationToolbarTransformButtons()}
                        exclusive={true}
                        level={2}
                    />
                </StyledPluridMoreMenuItem>
            )}

            <StyledPluridMoreMenuItem
                last={true}
            >
                <div>
                    {internatiolate(stateLanguage, internationalization.fields.toolbarDrawerToolbarConcealToolbar)}
                </div>

                <PluridSwitch
                    theme={interactionTheme}
                    checked={conceal}
                    atChange={() => dispatchToggleConfigurationToolbarConceal()}
                    exclusive={true}
                    level={2}
                />
            </StyledPluridMoreMenuItem>
        </>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridMenuMoreToolbarStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).language,
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
    viewSize: selectors.space.getViewSize(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): PluridMenuMoreToolbarDispatchProperties => ({
    dispatchToggleConfigurationToolbarConceal: () => dispatch(
        actions.configuration.toggleConfigurationToolbarConceal()
    ),
    dispatchToggleConfigurationToolbarTransformIcons: () => dispatch(
        actions.configuration.toggleConfigurationToolbarTransformIcons()
    ),
    dispatchToggleConfigurationToolbarTransformButtons: () => dispatch(
        actions.configuration.toggleConfigurationToolbarTransformButtons()
    ),
    dispatchToggleConfigurationToolbarOpaque: () => dispatch(
        actions.configuration.toggleConfigurationToolbarOpaque()
    )
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridMenuMoreToolbar);

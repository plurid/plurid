// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


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
        universal,
    } from '@plurid/plurid-ui-components-react';
    // #endregion libraries


    // #region external
    import {
        StyledPluridMoreMenuItem,
    } from '../../styled';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    import {
        DispatchActionWithoutPayload,
    } from '~data/interfaces';
    import {
        ViewSize,
    } from '~services/state/modules/space/types';
    // #endregion external
// #endregion imports



// #region module
const {
    inputs: {
        Switch: PluridSwitch,
    },
} = universal;

export interface PluridMenuMoreToolbarOwnProperties {
}

export interface PluridMenuMoreToolbarStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
    viewSize: ViewSize;
}

export interface PluridMenuMoreToolbarDispatchProperties {
    dispatchToggleConfigurationToolbarConceal: DispatchActionWithoutPayload<typeof actions.configuration.toggleConfigurationToolbarConceal>;
    dispatchToggleConfigurationToolbarTransformIcons: DispatchActionWithoutPayload<typeof actions.configuration.toggleConfigurationToolbarTransformIcons>;
    dispatchToggleConfigurationToolbarTransformButtons: DispatchActionWithoutPayload<typeof actions.configuration.toggleConfigurationToolbarTransformButtons>;
    dispatchToggleConfigurationToolbarOpaque: DispatchActionWithoutPayload<typeof actions.configuration.toggleConfigurationToolbarOpaque>;
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
    stateLanguage: selectors.configuration.getConfiguration(state).global.language,
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
    viewSize: selectors.space.getViewSize(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): PluridMenuMoreToolbarDispatchProperties => ({
    dispatchToggleConfigurationToolbarConceal: () => dispatch(
        actions.configuration.toggleConfigurationToolbarConceal(),
    ),
    dispatchToggleConfigurationToolbarTransformIcons: () => dispatch(
        actions.configuration.toggleConfigurationToolbarTransformIcons(),
    ),
    dispatchToggleConfigurationToolbarTransformButtons: () => dispatch(
        actions.configuration.toggleConfigurationToolbarTransformButtons(),
    ),
    dispatchToggleConfigurationToolbarOpaque: () => dispatch(
        actions.configuration.toggleConfigurationToolbarOpaque(),
    ),
});


const ConnectedPluridMenuMoreToolbar = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridMenuMoreToolbar);
// #endregion module



// #region exports
export default ConnectedPluridMenuMoreToolbar;
// #endregion exports

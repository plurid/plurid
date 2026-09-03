// #region imports
    // #region libraries
    import React from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';

    import styled from 'styled-components';


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

    import {
        StyledPluridMoreMenuItem,
    } from '../../styled';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';

    import {
        alignSelection,
        distributeSelection,
        duplicateSelection,
    } from '~services/state/thunks/selection';
    import {
        DispatchAction,
    } from '~data/interfaces';
    // #endregion libraries
// #endregion imports



// #region module
const StyledSelectionActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: flex-end;

    button {
        font: inherit;
        font-size: 0.7rem;
        line-height: 1;
        padding: 4px 6px;
        border-radius: 4px;
        border: 1px solid currentColor;
        background: transparent;
        color: inherit;
        cursor: pointer;
        opacity: 0.85;
    }

    button:hover,
    button:focus-visible {
        opacity: 1;
        outline: none;
        box-shadow: 0 0 0 2px currentColor inset;
    }
`;

/** The selection editing actions (align on an edge, distribute, duplicate, select all). */
const SELECTION_ACTIONS: { id: string; label: string; title: string; run: () => unknown }[] = [
    { id: 'align-left', label: '⇤', title: 'Align left edges', run: () => alignSelection('left') },
    { id: 'align-center-x', label: '⇹', title: 'Align horizontal centers', run: () => alignSelection('centerX') },
    { id: 'align-right', label: '⇥', title: 'Align right edges', run: () => alignSelection('right') },
    { id: 'align-top', label: '⤒', title: 'Align top edges', run: () => alignSelection('top') },
    { id: 'align-center-y', label: '⇳', title: 'Align vertical centers', run: () => alignSelection('centerY') },
    { id: 'align-bottom', label: '⤓', title: 'Align bottom edges', run: () => alignSelection('bottom') },
    { id: 'distribute-x', label: '↔', title: 'Distribute horizontally', run: () => distributeSelection('x') },
    { id: 'distribute-y', label: '↕', title: 'Distribute vertically', run: () => distributeSelection('y') },
    { id: 'duplicate', label: '⧉', title: 'Duplicate (⌘/Ctrl+D)', run: () => duplicateSelection() },
    { id: 'select-all', label: 'all', title: 'Select every plane (⌘/Ctrl+A)', run: () => actions.space.selectAll() },
];

const {
    inputs: {
        Switch: PluridSwitch,
    },
} = universal;

export interface PluridMenuMoreTransformOwnProperties {
}

export interface PluridMenuMoreTransformStateProperties {
    stateLanguage: InternationalizationLanguageType;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
}

export interface PluridMenuMoreTransformDispatchProperties {
    dispatchSetConfigurationSpaceTransformLocks: DispatchAction<typeof actions.configuration.setConfigurationSpaceTransformLocks>;
    dispatchThunk: (thunk: unknown) => void;
}

export type PluridMenuMoreTransformProperties = PluridMenuMoreTransformOwnProperties
    & PluridMenuMoreTransformStateProperties
    & PluridMenuMoreTransformDispatchProperties;


const PluridMenuMoreTransform: React.FC<PluridMenuMoreTransformProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        stateLanguage,
        interactionTheme,
        configuration,

        /** dispatch */
        dispatchSetConfigurationSpaceTransformLocks,
        dispatchThunk,
    } = properties;

    const {
        transformLocks,
    } = configuration.space;


    /** render */
    return (
        <>
            <StyledPluridMoreMenuItem>
                <div>
                    selection
                </div>

                <StyledSelectionActions>
                    {SELECTION_ACTIONS.map((action) => (
                        <button
                            key={action.id}
                            type="button"
                            title={action.title}
                            data-plurid-control={'selection-' + action.id}
                            onClick={() => dispatchThunk(action.run())}
                        >
                            {action.label}
                        </button>
                    ))}
                </StyledSelectionActions>
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
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
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
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
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
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
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
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
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
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
            </StyledPluridMoreMenuItem>

            <StyledPluridMoreMenuItem>
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
            </StyledPluridMoreMenuItem>

        </>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridMenuMoreTransformStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).global.language,
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): PluridMenuMoreTransformDispatchProperties => ({
    dispatchThunk: (thunk) => dispatch(thunk as any),
    dispatchSetConfigurationSpaceTransformLocks: (
        lock: string,
    ) => dispatch(
        actions.configuration.setConfigurationSpaceTransformLocks(lock),
    ),
});


const ConnectedPluridMenuMoreTransform = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridMenuMoreTransform);
// #endregion module



// #region exports
export default ConnectedPluridMenuMoreTransform;
// #endregion exports

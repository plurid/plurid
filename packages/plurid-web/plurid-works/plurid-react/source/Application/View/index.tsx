// #region imports
    // #region libraries
    import React, {
        useRef,
        useCallback,
        useState,
        useEffect,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        /** constants */
        PLURID_ENTITY_VIEW,
        defaultTreePlane,

        /** enumerations */
        TRANSFORM_MODES,
        TRANSFORM_TOUCHES,

        /** interfaces */
        PluridApplication as PluridApplicationProperties,
        PluridConfiguration as PluridAppConfiguration,
        PluridPartialConfiguration,
        PluridContext,
        PluridPlane,
        IndexedPluridPlane,
        RegisteredPluridPlane,
        PluridView,
        TreePlane,
    } from '@plurid/plurid-data';

    import {
        space,
        router,
        general as generalEngine,
    } from '@plurid/plurid-engine';

    import PluridPubSub, {
        TOPICS,
    } from '@plurid/plurid-pubsub';

    import {
        meta,
    } from '@plurid/plurid-functions';

    import themes, {
        Theme,
        THEME_NAMES,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import Context from '~services/logic/context';

    import {
        handleGlobalShortcuts,
        handleGlobalWheel,
    } from '~services/logic/shortcuts';

    import {
        loadHammer,
    } from '~services/utilities/imports';

    import renderStatic from '~services/logic/static';

    import { AppState } from '~services/state/store';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    import StateContext from '~services/state/context';
    import {
        ViewSize,
    } from '~services/state/types/space';
    import {
        SpaceSize,
    } from '~services/state/modules/space/types';
    // #endregion external


    // #region internal
    import './index.css';

    import {
        StyledEmpty,
        GlobalStyle,
        StyledView,
    } from './styled';

    import handleView from './logic';
    // #endregion internal
// #endregion imports



// #region module
export interface ViewOwnProperties {
    application: PluridApplicationProperties;
}

export interface ViewStateProperties {
    stateConfiguration: PluridAppConfiguration;
    // stateDataUniverses: Indexed<PluridInternalStateUniverse>;
    // viewSize: ViewSize;
    stateSpaceLoading: boolean;
    stateTransform: any;
    // initialTree: TreePlane[];
    // stateTree: TreePlane[];
    // activeUniverseID: string;
    // stateSpaceLocation: any;
    // stateCulledView: any;
    stateSpaceView: any[];
}

export interface ViewDispatchProperties {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;

    dispatchSetConfiguration: typeof actions.configuration.setConfiguration;
    dispatchSetConfigurationMicro: typeof actions.configuration.setConfigurationMicro;

    // dispatchSetUniverses: typeof actions.data.setUniverses;

    dispatchSetSpaceLoading: typeof actions.space.setSpaceLoading;
    dispatchSetAnimatedTransform: typeof actions.space.setAnimatedTransform;
    dispatchSetTransformTime: typeof actions.space.setTransformTime;
    dispatchSetSpaceLocation: typeof actions.space.setSpaceLocation;
    dispatchSetInitialTree: typeof actions.space.setInitialTree;
    dispatchSetTree: typeof actions.space.setTree;
    // dispatchSetSpaceSize: typeof actions.space.setSpaceSize;

    dispatchSetGeneralTheme: typeof actions.themes.setGeneralTheme;
    dispatchSetInteractionTheme: typeof actions.themes.setInteractionTheme;

    dispatchRotateXWith: typeof actions.space.rotateXWith;
    dispatchRotateX: typeof actions.space.rotateX;
    dispatchRotateYWith: typeof actions.space.rotateYWith;
    dispatchRotateY: typeof actions.space.rotateY;
    // dispatchTranslateX: typeof actions.space.translateX;
    dispatchTranslateXWith: typeof actions.space.translateXWith;
    // dispatchTranslateY: typeof actions.space.translateY;
    dispatchTranslateYWith: typeof actions.space.translateYWith;
    // dispatchScaleUp: typeof actions.space.scaleUp;
    dispatchScaleUpWith: typeof actions.space.scaleUpWith;
    // dispatchScaleDown: typeof actions.space.scaleDown;
    dispatchScaleDownWith: typeof actions.space.scaleDownWith;

    // dispatchSetActiveUniverse: typeof actions.space.setActiveUniverse;

    dispatchSpaceSetViewSize: typeof actions.space.setViewSize;
    dispatchSpaceSetView: typeof actions.space.spaceSetView;
    // dispatchSpaceSetCulledView: typeof actions.space.spaceSetCulledView;

    // dispatchDataSetPlaneSources: typeof actions.data.setPlaneSources;
}

export type ViewProperties = ViewOwnProperties
    & ViewStateProperties
    & ViewDispatchProperties;

const PluridView: React.FC<ViewProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            application,
            // #endregion values
        // #endregion required


        // #region state
        stateConfiguration,
        stateSpaceLoading,
        // #endregion state


        // #region dispatch
        dispatchSetSpaceLoading,
        // #endregion dispatch
    } = properties;
    // #endregion properties


    // #region references
    const viewElement = useRef<HTMLDivElement | null>(null);
    // #endregion references


    // #region render
    const viewContainer = handleView(
        application.view,
    );

    return (
        <StyledView
            ref={viewElement}
            tabIndex={0}
            transformMode={stateConfiguration.space.transformMode}
            data-plurid-entity={PLURID_ENTITY_VIEW}
        >
            <GlobalStyle />

            {/* {!stateSpaceLoading && ( */}
                <>
                    {/* <Context.Provider
                        value={pluridContext}
                    > */}
                        {viewContainer}
                    {/* </Context.Provider> */}
                </>
            {/* )} */}
        </StyledView>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): ViewStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    // stateDataUniverses: selectors.data.getUniverses(state),
    // viewSize: selectors.space.getViewSize(state),
    stateTransform: selectors.space.getTransform(state),
    // initialTree: selectors.space.getInitialTree(state),
    // stateTree: selectors.space.getTree(state),
    // activeUniverseID: selectors.space.getActiveUniverseID(state),
    stateSpaceLoading: selectors.space.getLoading(state),
    // stateSpaceLocation: selectors.space.getTransform(state),
    // stateCulledView: selectors.space.getCulledView(state),
    stateSpaceView: selectors.space.getView(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ViewDispatchProperties => ({
    dispatch,

    dispatchSetConfiguration: (configuration: PluridAppConfiguration) => dispatch(
        actions.configuration.setConfiguration(configuration)
    ),
    dispatchSetConfigurationMicro: () => dispatch(
        actions.configuration.setConfigurationMicro()
    ),

    // dispatchSetUniverses: (universes: any) => dispatch(
    //     actions.data.setUniverses(universes)
    // ),
    dispatchSpaceSetViewSize: (viewSize: ViewSize) => dispatch(
        actions.space.setViewSize(viewSize)
    ),

    dispatchSetSpaceLoading: (loading: boolean) => dispatch(
        actions.space.setSpaceLoading(loading)
    ),
    dispatchSetAnimatedTransform: (animated: boolean) => dispatch(
        actions.space.setAnimatedTransform(animated)
    ),
    dispatchSetTransformTime: (
        value,
    ) => dispatch(
        actions.space.setTransformTime(value)
    ),
    dispatchSetSpaceLocation: (spaceLocation: any) => dispatch(
        actions.space.setSpaceLocation(spaceLocation)
    ),
    dispatchSetInitialTree: (
        tree: TreePlane[],
    ) => dispatch(
        actions.space.setInitialTree(tree),
    ),
    dispatchSetTree: (
        tree: TreePlane[],
    ) => dispatch(
        actions.space.setTree(tree),
    ),
    // dispatchSetSpaceSize: (payload: SpaceSize) => dispatch(
    //     actions.space.setSpaceSize(payload)
    // ),

    dispatchSetGeneralTheme: (theme: Theme) => dispatch(
        actions.themes.setGeneralTheme(theme)
    ),
    dispatchSetInteractionTheme: (theme: Theme) => dispatch(
        actions.themes.setInteractionTheme(theme)
    ),

    dispatchRotateX: (value) => dispatch(
        actions.space.rotateX(value)
    ),
    dispatchRotateXWith: (value) => dispatch(
        actions.space.rotateXWith(value)
    ),
    dispatchRotateY: (value) => dispatch(
        actions.space.rotateY(value)
    ),
    dispatchRotateYWith: (value) => dispatch(
        actions.space.rotateYWith(value)
    ),
    // dispatchTranslateX: (value) => dispatch(
    //     actions.space.translateX(value)
    // ),
    dispatchTranslateXWith: (value) => dispatch(
        actions.space.translateXWith(value)
    ),
    // dispatchTranslateY: (value) => dispatch(
    //     actions.space.translateY(value)
    // ),
    dispatchTranslateYWith: (value) => dispatch(
        actions.space.translateYWith(value)
    ),
    // dispatchScaleUp: (value) => dispatch(
    //     actions.space.scaleUp(value)
    // ),
    dispatchScaleUpWith: (value) => dispatch(
        actions.space.scaleUpWith(value)
    ),
    // dispatchScaleDown: (value) => dispatch(
    //     actions.space.scaleDown(value)
    // ),
    dispatchScaleDownWith: (value) => dispatch(
        actions.space.scaleDownWith(value)
    ),

    // dispatchSetActiveUniverse: (activeUniverse: string) => dispatch(
    //     actions.space.setActiveUniverse(activeUniverse)
    // ),

    dispatchSpaceSetView: (
        view,
    ) => dispatch(
        actions.space.spaceSetView(view),
    ),
    // dispatchSpaceSetCulledView: (
    //     culledView,
    // ) => dispatch(
    //     actions.space.spaceSetCulledView(culledView),
    // ),

    // dispatchDataSetPlaneSources: (
    //     planeSources,
    // ) => dispatch(
    //     actions.data.setPlaneSources(planeSources),
    // ),
});


const ConnectedView = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridView);
// #endregion module



// #region exports
export default ConnectedView;
// #endregion exports

// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridPlane as IPluridPlane,
        RegisteredPluridPlane,
        TreePlane,
        PluridConfiguration,
        PLURID_ENTITY_PLANE,
    } from '@plurid/plurid-data';

    import {
        mathematics,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import {
        cleanTemplate,
    } from '~services/utilities/template';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import { ViewSize } from '~services/state/types/space';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPluridPlane,
    } from './styled';

    import PlaneBridge from './components/PlaneBridge';
    import PlaneControls from './components/PlaneControls';
    import PlaneContent from './components/PlaneContent';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridPlaneOwnProperties {
    // #region required
        // #region values
        planeID: string;
        plane: RegisteredPluridPlane<PluridReactComponent>;
        treePlane: TreePlane;
        location: any;
        // #endregion values
    // #endregion required
}

export interface PluridPlaneStateProperties {
    viewSize: ViewSize;
    spaceScale: number;
    generalTheme: Theme;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
    tree: TreePlane[];
}

export interface PluridPlaneDispatchProperties {
    updateSpaceTreePlane: typeof actions.space.updateSpaceTreePlane;
}

export type PluridPlaneProperties = PluridPlaneOwnProperties
    & PluridPlaneStateProperties
    & PluridPlaneDispatchProperties;


const PluridPlane: React.FC<React.PropsWithChildren<PluridPlaneProperties>> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            planeID,
            plane,
            treePlane,
            location,

            children,
            // #endregion values
        // #endregion required

        // #region state
        viewSize,
        generalTheme,
        configuration,
        // tree,
        // #endregion state

        // #region dispatch
        updateSpaceTreePlane,
        // #endregion dispatch
    } = properties;

    const {
        global,
        elements,
    } = configuration;

    const {
        transparentUI,
    } = global;

    const {
        controls,
        width: planeWidth,
        opacity: planeOpacity,
    } = elements.plane;

    const showPlaneControls = controls.show;

    const width = mathematics.numbers.checkIntegerNonUnit(planeWidth)
        ? planeWidth
        : planeWidth * viewSize.width;
    // #endregion properties


    // #region state
    const [mouseOver, setMouseOver] = useState(false);

    // based on camera location and world position compute transform matrix
    // #endregion state


    // #region handlers
    const updatePlaneSize = (
        size: any,
    ) => {
        const updatedTreePlane = {
            ...treePlane,
        };
        updatedTreePlane.width = size.width;
        updatedTreePlane.height = size.height;

        updateSpaceTreePlane(updatedTreePlane);
    }
    // #endregion handlers


    // #region render
    // console.log('Render plane');
    return (
        <StyledPluridPlane
            suppressHydrationWarning={true}
            theme={generalTheme}
            planeControls={showPlaneControls}
            planeOpacity={planeOpacity}
            show={treePlane.show}
            id={planeID}
            style={{
                width,
                transform: cleanTemplate(`
                    translateX(${location.translateX}px)
                    translateY(${location.translateY}px)
                    translateZ(${location.translateZ}px)
                    rotateX(${location.rotateX}deg)
                    rotateY(${location.rotateY}deg)
                `),
            }}
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            transparentUI={transparentUI}
            mouseOver={mouseOver}
            data-plurid-plane={planeID}
            data-plurid-entity={PLURID_ENTITY_PLANE}
        >
            {treePlane.show && (
                <>
                    {treePlane.parentPlaneID && (
                        <PlaneBridge />
                    )}

                    {showPlaneControls && (
                        <PlaneControls
                            plane={plane}
                            treePlane={treePlane}
                            mouseOver={mouseOver}
                        />
                    )}

                    <PlaneContent
                        // updatePlaneSize={updatePlaneSize}
                    >
                        {children}
                    </PlaneContent>
                </>
            )}
        </StyledPluridPlane>
    );
    // #endregion render
}


const mapStateToProps = (
    state: AppState,
): PluridPlaneStateProperties => ({
    viewSize: selectors.space.getViewSize(state),
    spaceScale: selectors.space.getScale(state),
    generalTheme: selectors.themes.getGeneralTheme(state),
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
    tree: selectors.space.getTree(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlaneDispatchProperties => ({
    updateSpaceTreePlane: (treePlane: TreePlane) => dispatch(
        actions.space.updateSpaceTreePlane(treePlane),
    ),
});


const ConnectedPluridPlane = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridPlane);
// #endregion module



// #region exports
export default ConnectedPluridPlane;
// #endregion exports

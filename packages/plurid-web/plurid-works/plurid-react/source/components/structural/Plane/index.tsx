// #region imports
    // #region libraries
    import React, {
        useContext,
        useState,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        RegisteredPluridPlane,
        TreePlane,
        TreePlaneLocation,
        PluridConfiguration,
        PLURID_ENTITY_PLANE,
    } from '@plurid/plurid-data';

    import {
        cleanTemplate,
    } from '@plurid/plurid-engine';

    import {
        mathematics,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import ErrorBoundary from '~components/utilities/ErrorBoundary';

    import Context from '~services/context';

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
const getTreePlaneByID = (
    stateTree: TreePlane[],
    id: string | undefined,
): TreePlane | undefined => {
    if (!id) {
        return;
    }

    for (const plane of stateTree) {
        if (plane.planeID === id) {
            return plane;
        }

        if (plane.children) {
            const found = getTreePlaneByID(
                plane.children,
                id,
            );

            if (found) {
                return found;
            }
        }
    }

    return;
}


export interface PluridPlaneOwnProperties {
    // #region required
        // #region values
        planeID: string;
        plane: RegisteredPluridPlane<PluridReactComponent>;
        treePlane: TreePlane;
        location: TreePlaneLocation;
        // #endregion values
    // #endregion required
}

export interface PluridPlaneStateProperties {
    stateTree: TreePlane[];
    stateViewSize: ViewSize;
    stateGeneralTheme: Theme;
    stateConfiguration: PluridConfiguration;
}

export interface PluridPlaneDispatchProperties {
    dispatchUpdateSpaceTreePlane: typeof actions.space.updateSpaceTreePlane;
}

export type PluridPlaneProperties =
    & PluridPlaneOwnProperties
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

            children,
            // #endregion values
        // #endregion required

        // #region state
        stateTree,
        stateViewSize,
        stateGeneralTheme,
        stateConfiguration,
        // #endregion state

        // #region dispatch
        dispatchUpdateSpaceTreePlane,
        // #endregion dispatch
    } = properties;

    const {
        global,
        elements,
    } = stateConfiguration;

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
        : planeWidth * stateViewSize.width;

    const parentTreePlane = getTreePlaneByID(
        stateTree,
        treePlane.parentPlaneID,
    );
    // #endregion properties


    // #region context
    const context = useContext(Context);
    if (!context) {
        return (<></>);
    }

    const {
        planeRenderError,
    } = context;
    // #endregion context


    // #region state
    const [
        mouseOver,
        setMouseOver,
    ] = useState(false);

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

        dispatchUpdateSpaceTreePlane(updatedTreePlane);
    }
    // #endregion handlers


    // #region render
    // console.log('Render plane');

    const planeContentProperties = {
        // updatePlaneSize,
    };

    return (
        <StyledPluridPlane
            suppressHydrationWarning={true}
            theme={stateGeneralTheme}
            planeControls={showPlaneControls}
            planeOpacity={planeOpacity}
            show={treePlane.show}
            id={planeID}
            style={{
                // width,
                width: '100%', // TOFIX
                transform: cleanTemplate(`
                    translateX(${treePlane.location.translateX}px)
                    translateY(${treePlane.location.translateY}px)
                    translateZ(${treePlane.location.translateZ}px)
                    rotateX(${treePlane.location.rotateX}deg)
                    rotateY(${treePlane.location.rotateY}deg)
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
                        <PlaneBridge
                            treePlane={treePlane}
                            parentTreePlane={parentTreePlane!}
                        />
                    )}

                    {showPlaneControls && (
                        <PlaneControls
                            plane={plane}
                            treePlane={treePlane}
                            mouseOver={mouseOver}
                        />
                    )}

                    {planeRenderError ? (
                        <ErrorBoundary
                            renderError={typeof planeRenderError !== 'boolean'
                                ? planeRenderError : undefined
                            }
                        >
                            <PlaneContent
                                {...planeContentProperties}
                            >
                                {children}
                            </PlaneContent>
                        </ErrorBoundary>
                    ) : (
                        <PlaneContent
                            {...planeContentProperties}
                        >
                            {children}
                        </PlaneContent>
                    )}
                </>
            )}
        </StyledPluridPlane>
    );
    // #endregion render
}


const mapStateToProps = (
    state: AppState,
): PluridPlaneStateProperties => ({
    stateTree: selectors.space.getTree(state),
    stateViewSize: selectors.space.getViewSize(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateConfiguration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlaneDispatchProperties => ({
    dispatchUpdateSpaceTreePlane: (
        treePlane: TreePlane,
    ) => dispatch(
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

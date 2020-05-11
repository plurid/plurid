import React, {
    useState,
} from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Theme } from '@plurid/plurid-themes';

import {
    StyledPluridPlane,
} from './styled';

import PlaneBridge from './components/PlaneBridge';
import PlaneControls from './components/PlaneControls';
import PlaneContent from './components/PlaneContent';

import {
    PluridPlane as IPluridPlane,
    TreePlane,
    PluridConfiguration,
    PLURID_ENTITY_PLANE,
} from '@plurid/plurid-data';

import {
    mathematics,
} from '@plurid/plurid-functions';

import {
    cleanTemplate,
} from '../../services/utilities/template';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import { ViewSize } from '../../services/state/types/space';
import selectors from '../../services/state/selectors';
import actions from '../../services/state/actions';



interface PluridPlaneOwnProperties {
    planeID: string;
    plane: IPluridPlane;
    treePlane: TreePlane;
    location: any;
}

interface PluridPlaneStateProperties {
    viewSize: ViewSize;
    spaceScale: number;
    generalTheme: Theme;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
    tree: TreePlane[];
}

interface PluridPlaneDispatchProperties {
    updateSpaceTreePlane: typeof actions.space.updateSpaceTreePlane;
}

type PluridPlaneProperties = PluridPlaneOwnProperties
    & PluridPlaneStateProperties
    & PluridPlaneDispatchProperties;


const PluridPlane: React.FC<React.PropsWithChildren<PluridPlaneProperties>> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        planeID,
        plane,
        treePlane,
        location,

        children,

        /** state */
        viewSize,
        generalTheme,
        configuration,
        // tree,

        /** dispatch */
        updateSpaceTreePlane,
    } = properties;

    const {
        transparentUI,
        elements,
    } = configuration;

    const {
        controls,
        width: planeWidth,
        opacity: planeOpacity,
    } = elements.plane;

    const showPlaneControls = controls.show;

    const width = mathematics.numbers.checkIntegerNonUnit(planeWidth)
        ? planeWidth
        : planeWidth * viewSize.width;


    /** state */
    const [mouseOver, setMouseOver] = useState(false);

    // based on camera location and world position compute transform matrix


    /** handlers */
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


    /** render */
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
                        updatePlaneSize={updatePlaneSize}
                    >
                        {children}
                    </PlaneContent>
                </>
            )}
        </StyledPluridPlane>
    );
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


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridPlane);

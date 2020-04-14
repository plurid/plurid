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
    PluridPage,
    TreePage,
    PluridConfiguration,
    PLURID_ENTITY_PLANE,
} from '@plurid/plurid-data';

import {
    mathematics,
} from '@plurid/plurid-functions';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import { ViewSize } from '../../services/state/types/space';
import selectors from '../../services/state/selectors';
import actions from '../../services/state/actions';



interface PluridPlaneOwnProperties {
    planeID: string;
    page: PluridPage;
    treePage: TreePage;
    location: any;
}

interface PluridPlaneStateProperties {
    viewSize: ViewSize;
    spaceScale: number;
    generalTheme: Theme;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
    tree: TreePage[];
}

interface PluridPlaneDispatchProperties {
    updateSpaceTreePage: typeof actions.space.updateSpaceTreePage;
}

type PluridPlaneProperties = PluridPlaneOwnProperties
    & PluridPlaneStateProperties
    & PluridPlaneDispatchProperties;

type PluridPlanePropertiesWithChildren = React.PropsWithChildren<PluridPlaneProperties>;

const PluridPlane: React.FC<PluridPlanePropertiesWithChildren> = (properties) => {
    const {
        /** own */
        planeID,
        page,
        treePage,
        location,

        children,

        /** state */
        viewSize,
        generalTheme,
        configuration,
        // tree,

        /** dispatch */
        updateSpaceTreePage,
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

    const [mouseOver, setMouseOver] = useState(false);

    // based on camera location and world position compute transform matrix

    const updatePlaneSize = (
        size: any,
    ) => {
        const updatedTreePage = {
            ...treePage,
        };
        updatedTreePage.width = size.width;
        updatedTreePage.height = size.height;

        updateSpaceTreePage(updatedTreePage);
    }

    return (
        <StyledPluridPlane
            theme={generalTheme}
            planeControls={showPlaneControls}
            planeOpacity={planeOpacity}
            show={treePage.show}
            id={planeID}
            style={{
                width,
                transform: `
                    translateX(${location.translateX}px)
                    translateY(${location.translateY}px)
                    translateZ(${location.translateZ}px)
                    rotateX(${location.rotateX}deg)
                    rotateY(${location.rotateY}deg)
                `,
            }}
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            transparentUI={transparentUI}
            mouseOver={mouseOver}
            data-plurid-plane={planeID}
            data-plurid-entity={PLURID_ENTITY_PLANE}
        >
            {treePage.parentPlaneID && (
                <PlaneBridge />
            )}

            {showPlaneControls && (
                <PlaneControls
                    page={page}
                    treePage={treePage}
                    mouseOver={mouseOver}
                />
            )}

            <PlaneContent
                updatePlaneSize={updatePlaneSize}
            >
                {children}
            </PlaneContent>
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
    updateSpaceTreePage: (treePage: TreePage) => dispatch(
        actions.space.updateSpaceTreePage(treePage),
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

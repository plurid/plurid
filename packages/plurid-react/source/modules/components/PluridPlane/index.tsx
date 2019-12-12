import React from 'react';
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
} from '@plurid/plurid-data';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import { ViewSize } from '../../services/state/types/space';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



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
}

interface PluridPlaneDispatchProperties {
}

type PluridPlaneProperties = PluridPlaneOwnProperties
    & PluridPlaneStateProperties
    & PluridPlaneDispatchProperties;

type PluridPlanePropertiesWithChildren = React.PropsWithChildren<PluridPlaneProperties>;

const PluridPlane: React.FC<PluridPlanePropertiesWithChildren> = (properties) => {
    const {
        planeID,
        page,
        treePage,
        location,
        children,

        viewSize,

        generalTheme,
        configuration,
    } = properties;

    const {
        controls,
        width: planeWidth,
        opacity: planeOpacity,
    } = configuration.elements.plane;

    const showPlaneControls = controls.show;

    const width = planeWidth * viewSize.width || 500;

    // based on camera location and world position compute transform matrix

    return (
        <StyledPluridPlane
            theme={generalTheme}
            planeControls={showPlaneControls}
            planeOpacity={planeOpacity}
            show={treePage.show}
            data-plurid-plane={planeID}
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
        >
            {treePage.parentPlaneID && (
                <PlaneBridge />
            )}

            {showPlaneControls && (
                <PlaneControls
                    page={page}
                    treePage={treePage}
                />
            )}

            <PlaneContent>
                {children}
            </PlaneContent>
        </StyledPluridPlane>
    );
}


const mapStateToProps = (state: AppState): PluridPlaneStateProperties => ({
    viewSize: selectors.space.getViewSize(state),
    spaceScale: selectors.space.getScale(state),
    generalTheme: selectors.themes.getGeneralTheme(state),
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PluridPlaneDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridPlane);

import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Theme } from '@plurid/apps.utilities.themes';

import {
    StyledPluridPlane,
} from './styled';

import PlaneBridge from './components/PlaneBridge';
import PlaneControls from './components/PlaneControls';
import PlaneContent from './components/PlaneContent';

import {
    PluridPage,
    TreePage,
} from '@plurid/plurid-data';

import { AppState } from '../../services/state/store';
import { ViewSize } from '../../services/state/types/data';
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
    planeWidth: number;
}

interface PluridPlaneDispatchProperties {

}

type PluridPlaneProperties = PluridPlaneOwnProperties
    & PluridPlaneStateProperties
    & PluridPlaneDispatchProperties;

const PluridPlane: React.FC<PluridPlaneProperties> = (properties) => {
    const {
        planeID,
        page,
        treePage,
        location,
        children,

        generalTheme,
    } = properties;

    return (
        <StyledPluridPlane
            theme={generalTheme}
            show={treePage.show}
            data-plurid-plane={planeID}
            style={{
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

            <PlaneControls
                page={page}
            />

            <PlaneContent>
                {children}
            </PlaneContent>
        </StyledPluridPlane>
    );
}


const mapStateToProps = (state: AppState): PluridPlaneStateProperties => ({
    viewSize: selectors.data.getViewSize(state),
    spaceScale: selectors.space.getScale(state),
    generalTheme: selectors.themes.getGeneralTheme(state),
    interactionTheme: selectors.themes.getInteractionTheme(state),
    planeWidth: selectors.configuration.getConfiguration(state).planeWidth,
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PluridPlaneDispatchProperties => ({
});


export default connect(mapStateToProps, mapDispatchToProps)(PluridPlane);

import React, {
    useContext,
} from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    PluridContext
} from '@plurid/plurid-data';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledPluridPlanePreview,
} from './styled';

import Context from '../../../../services/logic/context';

import { AppState } from '../../../../services/state/store';
import StateContext from '../../../../services/state/context';
import selectors from '../../../../services/state/selectors';
// import actions from '../../../../services/state/actions';



interface PluridPlanePreviewOwnProperties {
    planeID: string;
    linkCoordinates: any;
}

interface PluridPlanePreviewStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

interface PluridPlanePreviewDispatchProperties {
}

type PluridPlanePreviewProperties = PluridPlanePreviewOwnProperties
    & PluridPlanePreviewStateProperties
    & PluridPlanePreviewDispatchProperties;


const PluridPlanePreview: React.FC<PluridPlanePreviewProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        planeID,
        linkCoordinates,

        /** state */
        stateGeneralTheme,
        // stateInteractionTheme,
    } = properties;


    /** context */
    const context: PluridContext = useContext(Context);

    const {
        planesRegistry,
    } = context;

    const plane = planesRegistry.get(planeID);


    /** render */
    if (!plane) {
        return (<></>);
    }

    if (plane.component.kind !== 'react') {
        return (<></>);
    }

    const Component = plane.component.element;

    return (
        <StyledPluridPlanePreview
            theme={stateGeneralTheme}
            linkCoordinates={linkCoordinates}
        >
            <Component />
        </StyledPluridPlanePreview>
    );
}


const mapStateToProperties = (
    state: AppState,
): PluridPlanePreviewStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlanePreviewDispatchProperties => ({
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridPlanePreview);

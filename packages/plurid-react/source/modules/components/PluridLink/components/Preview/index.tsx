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
    StyledPreview,
} from './styled';

import Context from '../../../../services/logic/context';

import { AppState } from '../../../../services/state/store';
import StateContext from '../../../../services/state/context';
import selectors from '../../../../services/state/selectors';
// import actions from '../../../../services/state/actions';



interface PreviewOwnProperties {
    planeID: string;
    linkCoordinates: any;
}

interface PreviewStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

interface PreviewDispatchProperties {
}

type PreviewProperties = PreviewOwnProperties
    & PreviewStateProperties
    & PreviewDispatchProperties;

const Preview: React.FC<PreviewProperties> = (
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
        indexedPlanes,
    } = context;

    const plane = indexedPlanes?.get(planeID);


    /** render */
    if (!plane) {
        return (<></>);
    }

    if (plane.component.kind !== 'react') {
        return (<></>);
    }

    const Component = plane.component.element;

    return (
        <StyledPreview
            theme={stateGeneralTheme}
            linkCoordinates={linkCoordinates}
        >
            <Component />
        </StyledPreview>
    );
}


const mapStateToProperties = (
    state: AppState,
): PreviewStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PreviewDispatchProperties => ({
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(Preview);

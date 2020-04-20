import React, {
    useState,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Theme } from '@plurid/plurid-themes';

import {
    /** constants */
    PLURID_ENTITY_PLANE_CONTROLS,

    /** interfaces */
    PluridPlane,
    TreePlane,
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    utilities,
} from '@plurid/plurid-engine';

import {
    PluridTextline,
} from '@plurid/plurid-ui-react';

import {
    PluridIconCopy,
    PluridIconLink,
} from '@plurid/plurid-icons-react';

import {
    clipboard,
} from '@plurid/plurid-functions';

import {
    StyledPlaneControls,
    StyledPlaneControlsLeft,
    StyledPlaneControlsCenter,
    StyledPlaneControlsRight,
} from './styled';

import { AppState } from '../../../../services/state/store';
import StateContext from '../../../../services/state/context';
import selectors from '../../../../services/state/selectors';
// import actions from '../../../../services/state/actions';



interface PlaneControlsOwnProperties {
    plane: PluridPlane;
    treePlane: TreePlane;
    mouseOver: boolean;
}

interface PlaneControlsStateProperties {
    configuration: PluridConfiguration;
    generalTheme: Theme;
    interactionTheme: Theme;
}

interface PlaneControlsDispatchProperties {
}

type PlaneControlsProperties = PlaneControlsOwnProperties
    & PlaneControlsStateProperties
    & PlaneControlsDispatchProperties;

const PlaneControls: React.FC<PlaneControlsProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        plane,
        treePlane,
        mouseOver,

        /** state */
        configuration,
        generalTheme,
        interactionTheme,
    } = properties;

    const {
        transparentUI,
        elements,
    } = configuration;

    const {
        pathbar,
    } = elements.plane.controls;

    let basePath = '';
    if (configuration) {
        if (pathbar.domainURL) {
            basePath = typeof window === 'undefined'
                ? ''
                : window.location.hostname;
        }
    }

    const protocol = 'http';
    const host = 'localhost:3000';
    const gateway = 'gateway';

    // const pathValue = treePlane.routeDivisions.path.value;
    // const space = treePlane.routeDivisions.space.value;
    // const universe = treePlane.routeDivisions.universe.value;
    // const cluster = treePlane.routeDivisions.cluster.value;
    // const cleanRoute = utilities.cleanPathElement(treePlane.route);
    // const plurid = `${protocol}://${host}://${pathValue}://${space}://${universe}://${cluster}://${cleanRoute}`;
    const gatewayAddress = `${protocol}://${host}/${gateway}?plurid=` + encodeURIComponent(treePlane.route);


    /** state */
    const [path, setPath] = useState(treePlane.routeDivisions.plane.value);
    const [showAddress, setShowAddress] = useState(false);


    /** handlers */
    const onPathInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPath(event.target.value);

        if (pathbar.onChange) {
            const id = plane.id || plane.path;
            pathbar.onChange(event, id);
        }
    }

    const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (pathbar.onKeyDown) {
            const id = plane.id || plane.path;
            pathbar.onKeyDown(event, id);
        }
    }

    const copyGatewayLink = () => {
        clipboard.copy(gatewayAddress);
    }


    /** render */
    return (
        <StyledPlaneControls
            theme={generalTheme}
            mouseOver={mouseOver}
            transparentUI={transparentUI}
            data-plurid-entity={PLURID_ENTITY_PLANE_CONTROLS}
        >
            <StyledPlaneControlsLeft>
            </StyledPlaneControlsLeft>

            <StyledPlaneControlsCenter>
                <PluridTextline
                    theme={interactionTheme}
                    text={showAddress ? gatewayAddress : path}
                    atChange={onPathInput}
                    atKeyDown={handleOnKeyDown}
                    ariaLabel="Plurid Pathbar"
                />
            </StyledPlaneControlsCenter>

            <StyledPlaneControlsRight>
                <PluridIconCopy
                    atClick={() => copyGatewayLink()}
                />

                <PluridIconLink
                    atClick={() => setShowAddress(show => !show)}
                />
            </StyledPlaneControlsRight>
        </StyledPlaneControls>
    );
}


const mapStateToProps = (
    state: AppState,
): PlaneControlsStateProperties => ({
    configuration: selectors.configuration.getConfiguration(state),
    generalTheme: selectors.themes.getGeneralTheme(state),
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PlaneControlsDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PlaneControls);

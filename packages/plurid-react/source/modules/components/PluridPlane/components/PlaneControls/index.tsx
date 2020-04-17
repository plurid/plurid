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
    PluridTextline,
} from '@plurid/plurid-ui-react';

import {
    PluridIconCopy,
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

    const [path, setPath] = useState(basePath + treePlane.route);

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
        const plurid = 'http://localhost:3000://r://s://u://c://' + treePlane.route;
        const gatewayLink = 'http://localhost:3000/gateway?plurid=' + encodeURIComponent(plurid);
        clipboard.copy(gatewayLink);
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
                    text={path}
                    atChange={onPathInput}
                    atKeyDown={handleOnKeyDown}
                    ariaLabel="Plurid Pathbar"
                />
            </StyledPlaneControlsCenter>

            <StyledPlaneControlsRight>
                <PluridIconCopy
                    atClick={copyGatewayLink}
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
